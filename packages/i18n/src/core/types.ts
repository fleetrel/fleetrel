import type { defaultNamespace, namespaces, supportedLocales } from "./config"
import type { sourceResources } from "../locales/schema"

export type SupportedLocale = (typeof supportedLocales)[number]

export type Namespace = (typeof namespaces)[number]

export type DefaultNamespace = typeof defaultNamespace

export type LocaleShape<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Record<string, unknown>
      ? LocaleShape<T[K]>
      : never
}

export type Resources = typeof sourceResources

export type ResourceStore = Record<SupportedLocale, Resources>

export type TranslationKey<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends Record<string, unknown>
      ? TranslationKey<T[K], `${Prefix}${K}.`>
      : never
}[keyof T & string]

export type NamespaceKey<N extends Namespace> = TranslationKey<Resources[N]>

export type NamespacedKey<N extends Namespace = Namespace> = {
  [K in N]: `${K}:${NamespaceKey<K>}`
}[N]

export type TranslationParams = Record<string, string | number | boolean | Date>
