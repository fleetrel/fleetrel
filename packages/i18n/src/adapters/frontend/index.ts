import "./i18next-types"

import i18next, { type i18n, type InitOptions } from "i18next"

import {
  defaultNamespace,
  fallbackLocale,
  getResources,
  i18nConfig,
  type Namespace,
  namespaces,
  type SupportedLocale,
} from "../../core"

export type FrontendI18nOptions = {
  locale?: SupportedLocale
  namespaces?: readonly Namespace[]
  instance?: i18n
  initOptions?: Omit<
    InitOptions,
    "defaultNS" | "fallbackLng" | "lng" | "ns" | "resources" | "supportedLngs"
  >
}

export async function initFrontendI18n(options: FrontendI18nOptions = {}): Promise<i18n> {
  const instance = options.instance ?? i18next.createInstance()
  const locale = options.locale ?? fallbackLocale
  const namespaceList = options.namespaces ?? namespaces

  await instance.init({
    ...options.initOptions,
    resources: getResources([locale, fallbackLocale], namespaceList),
    lng: locale,
    fallbackLng: fallbackLocale,
    supportedLngs: [...i18nConfig.supportedLocales],
    defaultNS: defaultNamespace,
    ns: [...namespaceList],
    interpolation: i18nConfig.interpolation,
  })

  return instance
}
