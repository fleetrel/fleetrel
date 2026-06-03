export const fallbackLocale = "en"

export const supportedLocales = ["en", "ru"] as const

export const defaultNamespace = "common"

export const namespaces = ["common", "panel-api"] as const

export const i18nConfig = {
  fallbackLocale,
  supportedLocales,
  defaultNamespace,
  namespaces,
  interpolation: {
    escapeValue: false,
  },
} as const
