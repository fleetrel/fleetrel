import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModuleAsyncOptions, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt"

export const getJWTConfig = (): JwtModuleAsyncOptions => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (cfg: ConfigService) => ({
    secret: cfg.getOrThrow("JWT_AUTH_SECRET"),
    signOptions: { expiresIn: cfg.getOrThrow("JWT_AUTH_EXPIRES") },
  }),
})

export const getJWTRefreshSignConfig = (cfg: ConfigService): JwtSignOptions => ({
  secret: cfg.getOrThrow("JWT_AUTH_REFRESH_SECRET"),
  expiresIn: cfg.getOrThrow("JWT_AUTH_EXPIRES_REFRESH"),
})

export const getJWTRefreshVerifyConfig = (cfg: ConfigService): JwtVerifyOptions => ({
  secret: cfg.getOrThrow("JWT_AUTH_REFRESH_SECRET"),
})

export const getJWTRefreshTokenPepper = (cfg: ConfigService) =>
  cfg.getOrThrow("REFRESH_TOKEN_PEPPER")
