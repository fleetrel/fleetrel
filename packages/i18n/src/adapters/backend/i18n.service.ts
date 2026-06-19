import { Inject, Injectable } from "@nestjs/common"

import {
  createTranslator,
  type Namespace,
  type NamespacedKey,
  type SupportedLocale,
  type TranslationParams,
  type Translator,
} from "../../core"

import {
  TELEMT_I18N_DEFAULT_LOCALE,
  TELEMT_I18N_LOCALE,
  TELEMT_I18N_OPTIONS,
} from "./i18n.constants"
import type { TelemtI18nModuleOptions } from "./i18n.types"

@Injectable()
export class TelemtI18nService {
  private readonly translators = new Map<string, Translator>()
  private readonly defaultLocale: SupportedLocale
  private readonly currentLocale: SupportedLocale
  private readonly defaultNamespaces?: readonly Namespace[]

  constructor(
    @Inject(TELEMT_I18N_DEFAULT_LOCALE)
    defaultLocale: SupportedLocale,
    @Inject(TELEMT_I18N_LOCALE)
    currentLocale: SupportedLocale,
    @Inject(TELEMT_I18N_OPTIONS)
    options: TelemtI18nModuleOptions,
  ) {
    this.defaultLocale = defaultLocale
    this.currentLocale = currentLocale
    this.defaultNamespaces = options.namespaces
  }

  t(key: NamespacedKey, params?: TranslationParams): string {
    return this.tLocale(this.currentLocale, key, params)
  }

  tLocale(locale: SupportedLocale, key: NamespacedKey, params?: TranslationParams): string {
    return this.getTranslator(locale).t(key, params)
  }

  translate(key: NamespacedKey, params?: TranslationParams): string {
    return this.t(key, params)
  }

  scoped(locale: SupportedLocale = this.currentLocale, namespaces?: readonly Namespace[]) {
    return this.getTranslator(locale, namespaces ?? this.defaultNamespaces)
  }

  private getTranslator(locale: SupportedLocale, namespaces?: readonly Namespace[]) {
    const cacheKey = `${locale}:${namespaces?.join(",") ?? "*"}`
    const existing = this.translators.get(cacheKey)

    if (existing) {
      return existing
    }

    const created = createTranslator({ locale, namespaces })
    this.translators.set(cacheKey, created)

    return created
  }
}
