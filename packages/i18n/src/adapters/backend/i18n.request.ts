import { isSupportedLocale } from "../../core/resources"
import type { SupportedLocale } from "../../core/types"

export type I18nRequest = {
  headers?: Record<string, string | readonly string[] | undefined>
  cookies?: Record<string, string | undefined>
}

export type LocaleResolver = (
  request: I18nRequest,
) => SupportedLocale | undefined

export type LocaleResolutionOptions = {
  cookieName?: string
  headerNames?: readonly string[]
}

export const defaultLocaleCookieName = "locale"
export const defaultLocaleHeaderNames = ["x-locale", "accept-language"] as const

export function resolveLocaleFromRequest(
  request: I18nRequest,
  options: LocaleResolutionOptions = {},
): SupportedLocale | undefined {
  const cookieName = options.cookieName ?? defaultLocaleCookieName
  const headerNames = options.headerNames ?? [...defaultLocaleHeaderNames]

  const cookieLocale = getLocaleFromCookie(request, cookieName)
  if (cookieLocale) {
    return cookieLocale
  }

  for (const headerName of headerNames) {
    const headerValue = getHeaderValue(request.headers, headerName)

    if (!headerValue) {
      continue
    }

    if (headerName.toLowerCase() === "accept-language") {
      const locale = resolveLocaleFromAcceptLanguage(headerValue)
      if (locale) {
        return locale
      }

      continue
    }

    const locale = normalizeLocale(headerValue)
    if (isSupportedLocale(locale)) {
      return locale
    }
  }

  return undefined
}

function getLocaleFromCookie(
  request: I18nRequest,
  cookieName: string,
): SupportedLocale | undefined {
  const direct = request.cookies?.[cookieName]
  if (direct) {
    const normalized = normalizeLocale(direct)
    if (isSupportedLocale(normalized)) {
      return normalized
    }
  }

  const cookieHeader = getHeaderValue(request.headers, "cookie")
  if (!cookieHeader) {
    return undefined
  }

  const cookies = parseCookieHeader(cookieHeader)
  const normalized = normalizeLocale(cookies[cookieName])
  if (isSupportedLocale(normalized)) {
    return normalized
  }

  return undefined
}

function getHeaderValue(
  headers: Record<string, string | readonly string[] | undefined> | undefined,
  name: string,
): string | undefined {
  if (!headers) {
    return undefined
  }

  const lowerName = name.toLowerCase()

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== lowerName || value == null) {
      continue
    }

    if (Array.isArray(value)) {
      return value.length ? value[0] : undefined
    }

    if (typeof value === "string") {
      return value
    }
  }

  return undefined
}

function parseCookieHeader(header: string): Record<string, string> {
  return Object.fromEntries(
    header
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [name, ...value] = item.split("=")
        return [name.trim(), decodeURIComponent(value.join("=").trim())]
      }),
  )
}

function resolveLocaleFromAcceptLanguage(
  header: string,
): SupportedLocale | undefined {
  const entries = header
    .split(",")
    .map((part) => {
      const [langPart, qPart] = part.trim().split(";")
      const locale = normalizeLocale(langPart)
      const q = qPart?.includes("=") ? Number(qPart.split("=")[1]) : 1
      return { locale, q: Number.isFinite(q) ? q : 0 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { locale } of entries) {
    if (isSupportedLocale(locale)) {
      return locale
    }
  }

  return undefined
}

function normalizeLocale(locale: string | undefined): string {
  return locale?.trim().toLowerCase().split("-")[0] ?? ""
}
