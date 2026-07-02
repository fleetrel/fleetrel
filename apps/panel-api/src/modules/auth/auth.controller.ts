import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { Throttle } from "@nestjs/throttler"
import type { Request, Response } from "express"

import { AUTH_BASE, AUTH_ROUTES, AuthOkResponse } from "@fleetrel/contract"

import { THROTTLE_LIMIT, THROTTLE_TTL_MS } from "../../common/constants"
import { CurrentUser, Public } from "../../common/decorators"
import { errorHandler } from "../../common/helpers"

import { AuthService } from "./auth.service"
import { AuthCookieService } from "./auth-cookie.service"
import { AUTH_COOKIE } from "./constants"
import { MeResponseDto, SignInDto, SignUpDto } from "./dtos"

@ApiTags("Authentication")
@Controller(AUTH_BASE)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Public()
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.AUTH_STRICT } })
  @Post(AUTH_ROUTES.signUp.segment)
  @ApiOperation({ summary: AUTH_ROUTES.signUp.summary })
  @ApiCreatedResponse({ description: "User registered; auth cookies are set." })
  @ApiBadRequestResponse({ description: "Invalid request body." })
  @ApiConflictResponse({ description: "A user with this email already exists." })
  @ApiTooManyRequestsResponse({ description: "Rate limit exceeded." })
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthOkResponse> {
    const tokens = errorHandler(await this.authService.signUp(dto))
    this.authCookieService.setAuthCookies(res, tokens)
    return { ok: true }
  }

  @Public()
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.AUTH_STRICT } })
  @Post(AUTH_ROUTES.signIn.segment)
  @ApiOperation({ summary: AUTH_ROUTES.signIn.summary })
  @ApiCreatedResponse({ description: "Signed in; auth cookies are set." })
  @ApiBadRequestResponse({ description: "Invalid request body." })
  @ApiUnauthorizedResponse({ description: "Incorrect email or password." })
  @ApiTooManyRequestsResponse({ description: "Rate limit exceeded." })
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthOkResponse> {
    const tokens = errorHandler(await this.authService.signIn(dto))
    this.authCookieService.setAuthCookies(res, tokens)
    return { ok: true }
  }

  @Public()
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.AUTH_REFRESH } })
  @Post(AUTH_ROUTES.refresh.segment)
  @HttpCode(200)
  @ApiOperation({ summary: AUTH_ROUTES.refresh.summary })
  @ApiOkResponse({ description: "Tokens rotated; auth cookies are overwritten." })
  @ApiUnauthorizedResponse({ description: "Refresh token is missing, expired, or invalid." })
  @ApiTooManyRequestsResponse({ description: "Rate limit exceeded." })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthOkResponse> {
    const refreshToken = req.cookies?.[AUTH_COOKIE.REFRESH_TOKEN]
    if (!refreshToken) throw new UnauthorizedException()

    const tokens = errorHandler(await this.authService.refreshTokens(refreshToken))
    this.authCookieService.setAuthCookies(res, tokens)
    return { ok: true }
  }

  @Public()
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.AUTH_SIGNOUT } })
  @Post(AUTH_ROUTES.signOut.segment)
  @ApiOperation({ summary: AUTH_ROUTES.signOut.summary })
  @ApiCreatedResponse({ description: "Signed out; auth cookies are cleared." })
  @ApiTooManyRequestsResponse({ description: "Rate limit exceeded." })
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthOkResponse> {
    const refreshToken = req.cookies?.[AUTH_COOKIE.REFRESH_TOKEN]
    if (refreshToken) await this.authService.signOut(refreshToken)

    this.authCookieService.clearAuthCookies(res)
    return { ok: true }
  }

  @Get(AUTH_ROUTES.me.segment)
  @ApiOperation({ summary: AUTH_ROUTES.me.summary })
  @ApiOkResponse({ description: "Current user profile.", type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: "Not authenticated (token is invalid)." })
  async me(@CurrentUser("userId") userId: string): Promise<MeResponseDto> {
    const result = await this.authService.userInfo(userId)
    return errorHandler(result)
  }
}
