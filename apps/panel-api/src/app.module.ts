import { Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"
import { TelemtI18nModule } from "@fleetrel/i18n/backend"
import { DatabaseModule, DatabaseService } from "./common/database"
import { CommonConfigModule } from "./common/config"
import { THROTTLE_LIMIT, THROTTLE_TTL_MS } from "./common/constants"
import { PanelModules } from "./modules/panel.module"
import { ClsModule } from "nestjs-cls"
import { TransactionalAdapterPrisma } from "@nestjs-cls/transactional-adapter-prisma"
import { ClsPluginTransactional } from "@nestjs-cls/transactional"

@Module({
  imports: [
    CommonConfigModule,
    // Global rate limiter. Every route uses THROTTLE_LIMIT.DEFAULT unless it
    // carries a @Throttle() override. @SkipThrottle() bypasses the guard entirely.
    ThrottlerModule.forRoot([
      { name: "default", ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT.DEFAULT },
    ]),
    TelemtI18nModule.forRoot({
      defaultLocale: "en",
      localeCookieName: "locale",
      localeHeaderNames: ["x-locale", "accept-language"],
    }),
    DatabaseModule,
    PanelModules,
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: DatabaseService,
          }),
        }),
      ],
      global: true,
      middleware: { mount: true },
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
