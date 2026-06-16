import { Module } from "@nestjs/common"
import { TelemtI18nModule } from "@fleetrel/i18n/backend"
import { DatabaseModule, DatabaseService } from "./common/database"
import { CommonConfigModule } from "./common/config"
import { PanelModules } from "./modules/panel.module"
import { ClsModule } from "nestjs-cls"
import { TransactionalAdapterPrisma } from "@nestjs-cls/transactional-adapter-prisma"
import { ClsPluginTransactional } from "@nestjs-cls/transactional"

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
})
export class AppModule {}
