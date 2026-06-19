import type { Namespace, SupportedLocale } from "../../core/types"

import type { LocaleResolver } from "./i18n.request"

export type TelemtI18nModuleOptions = {
  defaultLocale?: SupportedLocale
  namespaces?: readonly Namespace[]
  localeCookieName?: string
  localeHeaderNames?: readonly string[]
  localeResolver?: LocaleResolver
}
