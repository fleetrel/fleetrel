import { Body, Controller, Post, Req, Res, UnauthorizedException } from "@nestjs/common"
import { Throttle } from "@nestjs/throttler"
import type { Request, Response } from "express"
import { AuthService } from "./auth.service"
import { AuthCookieService } from "./auth-cookie.service"
import { SignInDto, SignUpDto } from "./dtos"
import { AUTH_COOKIE } from "./constants"
import { errorHandler } from "../../common/helpers"
import { Public } from "../../common/decorators"
import { THROTTLE_LIMIT, THROTTLE_TTL_MS } from "../../common/constants"

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Public()
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.AUTH_STRICT } })
  @Post("sign-up")
  async signUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response) {
    const tokens = errorHandler(await this.authService.signUp(dto))
    this.authCookieService.setAuthCookies(res, tokens)
    return { ok: true }
  }

  @Public()
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.AUTH_STRICT } })
  @Post("sign-in")
  async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const tokens = errorHandler(await this.authService.signIn(dto))
    this.authCookieService.setAuthCookies(res, tokens)
    return { ok: true }
  }

  @Public()
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.AUTH_REFRESH } })
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[AUTH_COOKIE.REFRESH_TOKEN]
    if (!refreshToken) throw new UnauthorizedException()

    const tokens = errorHandler(await this.authService.refreshTokens(refreshToken))
    this.authCookieService.setAuthCookies(res, tokens)
    return { ok: true }
  }

  @Public()
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.AUTH_SIGNOUT } })
  @Post("sign-out")
  async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[AUTH_COOKIE.REFRESH_TOKEN]
    if (refreshToken) await this.authService.signOut(refreshToken)

    this.authCookieService.clearAuthCookies(res)
    return { ok: true }
  }
}
