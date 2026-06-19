import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import type { Request } from "express"
import { ExtractJwt, Strategy } from "passport-jwt"

import { IRequestUser } from "../../../common/types"
import { isFail } from "../../../common/utils"
import { SessionsService } from "../../sessions"
import { AUTH_COOKIE } from "../constants"
import { IJWTPayload } from "../interfaces"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    cfg: ConfigService,
    private readonly sessionsService: SessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.[AUTH_COOKIE.ACCESS_TOKEN] ?? null,
      ]),
      secretOrKey: cfg.getOrThrow("JWT_AUTH_SECRET"),
      ignoreExpiration: false,
    })
  }

  /**
   * Beyond verifying the signature, the access token is only accepted while its
   * session still exists. Once the session is revoked (sign-out) the token is
   * rejected immediately, instead of staying valid until it expires.
   */
  async validate(payload: IJWTPayload): Promise<IRequestUser> {
    const session = await this.sessionsService.findActiveSession(payload.sid)
    if (isFail(session)) throw new UnauthorizedException()

    // The session must belong to the user the token claims to authenticate.
    if (session.response.userId !== payload.sub) throw new UnauthorizedException()

    return { userId: payload.sub, sessionId: payload.sid }
  }
}
