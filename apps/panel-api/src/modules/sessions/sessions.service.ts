import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { createHmac, timingSafeEqual } from "crypto"
import { ERRORS } from "@fleetrel/contract"
import { fail, isPrismaError, ok, TResult } from "../../common/utils"
import { getJWTRefreshTokenPepper } from "../../common/config"
import { AuthSessionRepository } from "./repositories"
import { AuthSessionEntity } from "./entities"
import { CreateSessionDto } from "./dtos"

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name)

  constructor(
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly configService: ConfigService,
  ) {}

  async createSession(dto: CreateSessionDto): Promise<TResult<AuthSessionEntity>> {
    try {
      const session = await this.authSessionRepository.create({
        id: dto.sessionId,
        userId: dto.userId,
        refreshTokenHash: this.hashRefreshToken(dto.refreshToken),
        lastActiveAt: new Date(),
      })

      this.logger.debug(`createSession: session created sid=${dto.sessionId} userId=${dto.userId}`)
      return ok(session)
    } catch (error) {
      this.logger.error(
        "createSession failed",
        error instanceof Error ? error.stack : String(error),
      )
      return fail(ERRORS.SESSION_ERROR_CREATE)
    }
  }

  /**
   * Resolves an active session by id. A missing session means it was revoked
   * (sign-out) or never existed, so the caller must treat the request as
   * unauthenticated even when the bearer JWT is still cryptographically valid.
   */
  async findActiveSession(sessionId: string): Promise<TResult<AuthSessionEntity>> {
    try {
      const session = await this.authSessionRepository.findById(sessionId)
      if (!session) {
        this.logger.warn(`findActiveSession: session not found sid=${sessionId}`)
        return fail(ERRORS.SESSION_NOT_FOUND)
      }
      return ok(session)
    } catch (error) {
      this.logger.error(
        "findActiveSession failed",
        error instanceof Error ? error.stack : String(error),
      )
      return fail(ERRORS.SESSION_NOT_FOUND)
    }
  }

  /** Checks that `token` matches the hash stored for the session. */
  async verifyRefreshToken(sessionId: string, token: string): Promise<TResult<AuthSessionEntity>> {
    try {
      const session = await this.authSessionRepository.findById(sessionId)
      if (!session) return fail(ERRORS.SESSION_NOT_FOUND)

      const isValid = this.safeCompareHashes(this.hashRefreshToken(token), session.refreshTokenHash)
      if (!isValid) {
        this.logger.warn(`verifyRefreshToken: token mismatch sid=${sessionId}`)
        return fail(ERRORS.SESSION_TOKEN_MISMATCH)
      }

      return ok(session)
    } catch (error) {
      this.logger.error(
        "verifyRefreshToken failed",
        error instanceof Error ? error.stack : String(error),
      )
      return fail(ERRORS.SESSION_NOT_FOUND)
    }
  }

  /**
   * Atomically verifies `currentToken` against the stored hash and rotates it
   * to `newToken` in a single UPDATE. Eliminates the TOCTOU window that exists
   * when verify and rotate are two separate DB round-trips: only one concurrent
   * caller can win the compare-and-swap; the other gets SESSION_TOKEN_MISMATCH
   * without revoking the session (which would be a false positive for concurrent
   * legitimate refreshes from multiple tabs).
   */
  async verifyAndRotateSession(
    sessionId: string,
    currentToken: string,
    newToken: string,
  ): Promise<TResult<void>> {
    try {
      const swapped = await this.authSessionRepository.compareAndSwapTokenHash(
        sessionId,
        this.hashRefreshToken(currentToken),
        this.hashRefreshToken(newToken),
      )
      if (!swapped) {
        this.logger.warn(
          `verifyAndRotateSession: CAS failed (concurrent refresh?) sid=${sessionId}`,
        )
        return fail(ERRORS.SESSION_TOKEN_MISMATCH)
      }
      this.logger.debug(`verifyAndRotateSession: token rotated sid=${sessionId}`)
      return ok(undefined)
    } catch (error) {
      this.logger.error(
        "verifyAndRotateSession failed",
        error instanceof Error ? error.stack : String(error),
      )
      return fail(ERRORS.SESSION_ERROR_CREATE)
    }
  }

  async revokeSession(sessionId: string): Promise<boolean> {
    try {
      await this.authSessionRepository.deleteById(sessionId)
      this.logger.debug(`revokeSession: session deleted sid=${sessionId}`)
      return true
    } catch (error) {
      // P2025 = record not found — session already revoked, not an error
      if (isPrismaError(error) && error.code !== "P2025") {
        this.logger.error(
          "revokeSession failed",
          error instanceof Error ? error.stack : String(error),
        )
      }
      return false
    }
  }

  private hashRefreshToken(token: string): string {
    return createHmac("sha256", getJWTRefreshTokenPepper(this.configService))
      .update(token)
      .digest("hex")
  }

  private safeCompareHashes(a: string, b: string): boolean {
    const bufA = Buffer.from(a, "hex")
    const bufB = Buffer.from(b, "hex")

    if (bufA.length !== bufB.length) return false

    return timingSafeEqual(bufA, bufB)
  }
}
