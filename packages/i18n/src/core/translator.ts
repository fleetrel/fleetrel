import i18next, { type i18n } from "i18next"

import { defaultNamespace, fallbackLocale, i18nConfig, namespaces } from "./config"
import { getResources } from "./resources"
import type { Namespace, NamespacedKey, SupportedLocale, TranslationParams } from "./types"

export type Translator = {
  instance: i18n
  t: (key: NamespacedKey, params?: TranslationParams) => string
}

export function createTranslator(options?: {
  locale?: SupportedLocale
  namespaces?: readonly Namespace[]
}): Translator {
  const instance = i18next.createInstance()
  const locale = options?.locale ?? fallbackLocale
  const namespaceList = options?.namespaces ?? namespaces

  instance.init({
    resources: getResources([locale, fallbackLocale], namespaceList),
    lng: locale,
    fallbackLng: fallbackLocale,
    supportedLngs: [...i18nConfig.supportedLocales],
    defaultNS: defaultNamespace,
    ns: [...namespaceList],
    interpolation: i18nConfig.interpolation,
    initImmediate: false,
  })

  return {
    instance,
    t: (key, params) => instance.t(key, params),
  }
}
