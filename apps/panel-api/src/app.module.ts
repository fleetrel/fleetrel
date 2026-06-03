import { Module } from "@nestjs/common"
import { TelemtI18nModule } from "@fleetrel/i18n/backend"
import { DatabaseModule } from "./common/database"
import { CommonConfigModule } from "./common/config"
import { PanelModules } from "./modules/panel.module"
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core"
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod"

@Module({
  imports: [
    CommonConfigModule,
    TelemtI18nModule.forRoot({
      defaultLocale: "en",
      localeCookieName: "locale",
      localeHeaderNames: ["x-locale", "accept-language"],
    }),
    DatabaseModule,
    PanelModules,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
