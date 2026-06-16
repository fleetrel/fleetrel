import { DynamicModule, Global, Module, Scope } from "@nestjs/common"
import { REQUEST } from "@nestjs/core"
import { TelemtI18nService } from "./i18n.service"
import {
  TELEMT_I18N_DEFAULT_LOCALE,
  TELEMT_I18N_LOCALE,
  TELEMT_I18N_OPTIONS,
} from "./i18n.constants"
import type { TelemtI18nModuleOptions } from "./i18n.types"
import { fallbackLocale } from "../../core"
import type { SupportedLocale } from "../../core/types"
import {
  defaultLocaleCookieName,
  defaultLocaleHeaderNames,
  resolveLocaleFromRequest,
  type I18nRequest,
} from "./i18n.request"

const createLocaleProvider = () => ({
  provide: TELEMT_I18N_LOCALE,
  scope: Scope.REQUEST,
  inject: [REQUEST, TELEMT_I18N_OPTIONS, TELEMT_I18N_DEFAULT_LOCALE],
  useFactory: (request: I18nRequest, opts: TelemtI18nModuleOptions, fallback: string) => {
    const cookieName = opts.localeCookieName ?? defaultLocaleCookieName
    const headerNames = opts.localeHeaderNames ?? [...defaultLocaleHeaderNames]
    const localeResolver = opts.localeResolver

    const resolved =
      localeResolver?.(request) ??
      resolveLocaleFromRequest(request, {
        cookieName,
        headerNames,
      })

    return (resolved ?? fallback) as SupportedLocale
  },
})

@Global()
@Module({
  providers: [
    {
      provide: TELEMT_I18N_OPTIONS,
      useValue: {},
    },
    {
      provide: TELEMT_I18N_DEFAULT_LOCALE,
      useValue: fallbackLocale,
    },
    createLocaleProvider(),
    TelemtI18nService,
  ],
  exports: [TelemtI18nService],
})
export class TelemtI18nModule {
  static forRoot(options: TelemtI18nModuleOptions = {}): DynamicModule {
    return {
      module: TelemtI18nModule,
      providers: [
        {
          provide: TELEMT_I18N_OPTIONS,
          useValue: options,
        },
        {
          provide: TELEMT_I18N_DEFAULT_LOCALE,
          useValue: options.defaultLocale ?? fallbackLocale,
        },
        createLocaleProvider(),
        TelemtI18nService,
      ],
      exports: [TelemtI18nService],
      global: true,
    }
  }
}
