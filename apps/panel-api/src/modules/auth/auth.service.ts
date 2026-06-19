import { randomUUID } from "crypto"

import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { hash, verify } from "argon2"

import { ERRORS } from "@fleetrel/contract"

import { getJWTRefreshSignConfig, getJWTRefreshVerifyConfig } from "../../common/config"
import { fail, isFail, ok, TResult } from "../../common/utils"
import { SessionsService } from "../sessions"
import { UsersService } from "../users"

import { REFRESH_TOKEN_VERSION } from "./constants"
import { SignInDto, SignUpDto } from "./dtos"
import { IJWTPayload, ITokens } from "./interfaces"

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionsService: SessionsService,
  ) {}

  async signUp(dto: SignUpDto): Promise<TResult<ITokens>> {
    try {
      const passwordHash = await hash(dto.password)
      const newUser = await this.usersService.createUser({
        email: dto.email,
        password: passwordHash,
      })
      if (isFail(newUser)) return newUser

      const tokens = await this.startSession(newUser.response.id)
      if (isFail(tokens)) return tokens
      return ok(tokens.response)
    } catch (error) {
      this.logger.error("signUp failed", error instanceof Error ? error.stack : String(error))
      return fail(ERRORS.CREATE_USER_ERROR)
    }
  }

  async signIn(dto: SignInDto): Promise<TResult<ITokens>> {
    try {
      const user = await this.usersService.findUserEntityByEmail(dto.email)
      if (isFail(user)) {
        this.logger.warn("signIn: user not found")
        return fail(ERRORS.AUTH_INVALID_CREDENTIALS)
      }

      const isValidPassword = await verify(user.response.password, dto.password)
      if (!isValidPassword) {
        this.logger.warn(`signIn: invalid password for userId=${user.response.id}`)
        return fail(ERRORS.AUTH_INVALID_CREDENTIALS)
      }

      const tokens = await this.startSession(user.response.id)
      if (isFail(tokens)) return tokens
      return ok(tokens.response)
    } catch (error) {
      this.logger.error("signIn failed", error instanceof Error ? error.stack : String(error))
      return fail(ERRORS.AUTH_SIGN_IN_ERROR)
    }
  }

  /**
   * Rotates the token pair for an existing session. The presented refresh token
   * must match the hash stored for its session; any mismatch revokes the session
   * (reuse defense) so a leaked token cannot mint an unbounded chain of tokens.
   */
  async refreshTokens(refreshToken: string): Promise<TResult<ITokens>> {
    try {
      const payload = this.verifyRefreshToken(refreshToken)
      if (isFail(payload)) return payload

      const { sub: userId, sid: sessionId } = payload.response

      const user = await this.usersService.findUserById(userId)
      if (isFail(user)) return fail(ERRORS.AUTH_FORBIDDEN)

      const tokens = await this.issueTokenPair({ sub: userId, sid: sessionId })

      // Single atomic UPDATE: verifies the stored hash matches the presented
      // token and writes the new hash in one round-trip. If two concurrent
      // refresh requests arrive with the same token, only one wins the CAS;
      // the other gets AUTH_FORBIDDEN but the session is NOT revoked — revoking
      // on a CAS loss would be a false positive for multi-tab concurrent refresh.
      const rotated = await this.sessionsService.verifyAndRotateSession(
        sessionId,
        refreshToken,
        tokens.refreshToken,
      )
      if (isFail(rotated)) return fail(ERRORS.AUTH_FORBIDDEN)

      return ok(tokens)
    } catch (error) {
      this.logger.error(
        "refreshTokens failed",
        error instanceof Error ? error.stack : String(error),
      )
      return fail(ERRORS.AUTH_REFRESH_ERROR)
    }
  }

  async signOut(refreshToken: string): Promise<void> {
    const payload = this.verifyRefreshToken(refreshToken)
    if (isFail(payload)) return

    const { sid: sessionId } = payload.response

    // Verify the token matches the currently stored hash before revoking.
    // A stale rotated-away token has a valid JWT signature but will fail here,
    // preventing forced sign-out via token replay.
    const session = await this.sessionsService.verifyRefreshToken(sessionId, refreshToken)
    if (isFail(session)) return

    await this.sessionsService.revokeSession(sessionId)
    this.logger.debug(`signOut: session revoked sid=${sessionId}`)
  }

  private verifyRefreshToken(refreshToken: string): TResult<IJWTPayload> {
    let payload: IJWTPayload
    try {
      payload = this.jwtService.verify<IJWTPayload>(
        refreshToken,
        getJWTRefreshVerifyConfig(this.configService),
      )
    } catch {
      return fail(ERRORS.AUTH_INVALID_TOKEN)
    }

    if (payload.version !== REFRESH_TOKEN_VERSION) return fail(ERRORS.AUTH_INVALID_TOKEN)

    return ok(payload)
  }

  private async startSession(userId: string): Promise<TResult<ITokens>> {
    const sessionId = randomUUID()
    this.logger.debug(`startSession: creating session sid=${sessionId} userId=${userId}`)

    const tokens = await this.issueTokenPair({ sub: userId, sid: sessionId })

    const session = await this.sessionsService.createSession({
      sessionId,
      userId,
      refreshToken: tokens.refreshToken,
    })
    if (isFail(session)) return session

    this.logger.log(`startSession: session started sid=${sessionId} userId=${userId}`)
    return ok(tokens)
  }

  private async issueTokenPair(payload: IJWTPayload): Promise<ITokens> {
    const accessToken = await this.jwtService.signAsync(payload)
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, version: REFRESH_TOKEN_VERSION },
      getJWTRefreshSignConfig(this.configService),
    )

    return { accessToken, refreshToken }
  }
}
