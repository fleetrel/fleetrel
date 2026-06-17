import { Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { PassportModule } from "@nestjs/passport"
import { JwtModule } from "@nestjs/jwt"
import { AuthService } from "./auth.service"
import { AuthCookieService } from "./auth-cookie.service"
import { AuthController } from "./auth.controller"
import { JwtStrategy } from "./strategies"
import { UsersModule } from "../users"
import { SessionsModule } from "../sessions"
import { getJWTConfig } from "../../common/config"
import { JwtAuthGuard } from "../../common/guards"

@Module({
  imports: [UsersModule, PassportModule, JwtModule.registerAsync(getJWTConfig()), SessionsModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCookieService,
    JwtStrategy,
    // Protect every route by default; opt-out per route with `@Public()`.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
