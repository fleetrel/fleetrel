import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import type { CookieOptions, Response } from "express"

import { parseDuration } from "../../common/utils"

import { AUTH_COOKIE, AUTH_COOKIE_PATH } from "./constants"
import { ITokens } from "./interfaces"

/**
 * Single owner of the auth-cookie security policy: names, paths, flags and
 * lifetimes. Controllers delegate here instead of building cookies inline.
 */
@Injectable()
export class AuthCookieService {
  constructor(private readonly configService: ConfigService) {}

  setAuthCookies(res: Response, tokens: ITokens): void {
    res.cookie(AUTH_COOKIE.ACCESS_TOKEN, tokens.accessToken, {
      ...this.baseOptions,
      path: AUTH_COOKIE_PATH.ACCESS_TOKEN,
      maxAge: parseDuration(this.configService.getOrThrow("JWT_AUTH_EXPIRES")),
    })

    res.cookie(AUTH_COOKIE.REFRESH_TOKEN, tokens.refreshToken, {
      ...this.baseOptions,
      path: AUTH_COOKIE_PATH.REFRESH_TOKEN,
      maxAge: parseDuration(this.configService.getOrThrow("JWT_AUTH_EXPIRES_REFRESH")),
    })
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(AUTH_COOKIE.ACCESS_TOKEN, {
      ...this.baseOptions,
      path: AUTH_COOKIE_PATH.ACCESS_TOKEN,
    })
    res.clearCookie(AUTH_COOKIE.REFRESH_TOKEN, {
      ...this.baseOptions,
      path: AUTH_COOKIE_PATH.REFRESH_TOKEN,
    })
  }

  private get baseOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "strict",
    }
  }
}
