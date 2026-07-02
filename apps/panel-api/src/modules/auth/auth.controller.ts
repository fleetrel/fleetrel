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
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { Throttle } from "@nestjs/throttler"
import type { Request, Response } from "express"

import { THROTTLE_LIMIT, THROTTLE_TTL_MS } from "../../common/constants"
import { CurrentUser, Public } from "../../common/decorators"
import { errorHandler } from "../../common/helpers"

import { AuthService } from "./auth.service"
import { AuthCookieService } from "./auth-cookie.service"
import { AUTH_COOKIE } from "./constants"
import { SignInDto, SignUpDto } from "./dtos"
import { UserResponseModel } from "./models"

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Public()
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.AUTH_STRICT } })
  @Post("sign-up")
  @ApiOperation({ summary: "Регистрация нового пользователя" })
  @ApiCreatedResponse({
    description: "Пользователь успешно зарегистрирован. Устанавливаются куки.",
  })
  @ApiBadRequestResponse({ description: "Невалидные данные в теле запроса." })
  @ApiConflictResponse({ description: "Пользователь с таким email/логином уже существует." })
  @ApiTooManyRequestsResponse({ description: "Превышен лимит запросов (Rate Limit)." })
  async signUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response) {
    const tokens = errorHandler(await this.authService.signUp(dto))
    this.authCookieService.setAuthCookies(res, tokens)
    return { ok: true }
  }

  @Public()
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.AUTH_STRICT } })
  @Post("sign-in")
  @ApiOperation({ summary: "Авторизация пользователя (вход)" })
  @ApiOkResponse({ description: "Успешный вход. Устанавливаются куки." })
  @ApiBadRequestResponse({
    description: "Невалидные данные в теле запроса.",
  })
  @ApiUnauthorizedResponse({ description: "Неверный email или пароль." })
  @ApiTooManyRequestsResponse({ description: "Превышен лимит запросов (Rate Limit)." })
  async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const tokens = errorHandler(await this.authService.signIn(dto))
    this.authCookieService.setAuthCookies(res, tokens)
    return { ok: true }
  }

  @Public()
  @Throttle({ default: { ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.AUTH_REFRESH } })
  @Post("refresh")
  @HttpCode(200)
  @ApiOperation({ summary: "Обновление access токена" })
  @ApiOkResponse({ description: "Токены успешно обновлены. Куки перезаписаны." })
  @ApiUnauthorizedResponse({ description: "Refresh токен отсутствует, истек или невалиден." })
  @ApiTooManyRequestsResponse({ description: "Превышен лимит запросов (Rate Limit)." })
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
  @ApiOperation({ summary: "Выход из аккаунта (logout)" })
  @ApiOkResponse({ description: "Успешный выход. Куки очищены." })
  @ApiTooManyRequestsResponse({ description: "Превышен лимит запросов (Rate Limit)." })
  async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[AUTH_COOKIE.REFRESH_TOKEN]
    if (refreshToken) await this.authService.signOut(refreshToken)

    this.authCookieService.clearAuthCookies(res)
    return { ok: true }
  }

  @Get("me")
  @ApiOperation({ summary: "Получение данных текущего пользователя" })
  @ApiOkResponse({ description: "Данные пользователя.", type: UserResponseModel })
  @ApiUnauthorizedResponse({
    description: "Пользователь не авторизован (токен невалиден).",
    type: UserResponseModel,
  })
  async me(@CurrentUser("userId") userId: string) {
    const result = await this.authService.userInfo(userId)
    return errorHandler(result)
  }
}
