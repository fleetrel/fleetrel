import { namespaces, supportedLocales } from "./config"
import { resources } from "../locales"
import type { Namespace, Resources, SupportedLocale } from "./types"

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (supportedLocales as readonly string[]).includes(locale)
}

export function isNamespace(namespace: string): namespace is Namespace {
  return (namespaces as readonly string[]).includes(namespace)
}

export function getNamespaceResource<L extends SupportedLocale, N extends Namespace>(
  locale: L,
  namespace: N,
): Resources[N] {
  return resources[locale][namespace] as Resources[N]
}

export function getResources(
  localeList: readonly SupportedLocale[] = supportedLocales,
  namespaceList: readonly Namespace[] = namespaces,
) {
  return Object.fromEntries(
    localeList.map((locale) => [
      locale,
      Object.fromEntries(
        namespaceList.map((namespace) => [namespace, getNamespaceResource(locale, namespace)]),
      ),
    ]),
  )
}
