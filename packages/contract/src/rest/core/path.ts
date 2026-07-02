import type { z, ZodType } from "zod"

import type { RouteDef } from "./route"

/** Primitive value accepted for a single query parameter. */
export type QueryParamValue = string | number | boolean | null | undefined

type ParamsInput<T extends RouteDef> = T["request"] extends { params: infer P extends ZodType }
  ? z.input<P>
  : never

type QueryInput<T extends RouteDef> = T["request"] extends { query: infer Q extends ZodType }
  ? z.input<Q>
  : never

type BuildPathOptions<T extends RouteDef> = ([ParamsInput<T>] extends [never]
  ? { params?: never }
  : { params: ParamsInput<T> }) &
  ([QueryInput<T>] extends [never] ? { query?: never } : { query?: QueryInput<T> })

/**
 * `options` is required when the route declares path params, optional when it
 * only declares query params, and forbidden otherwise.
 */
type BuildPathArgs<T extends RouteDef> = [ParamsInput<T>] extends [never]
  ? [QueryInput<T>] extends [never]
    ? []
    : [options?: BuildPathOptions<T>]
  : [options: BuildPathOptions<T>]

/**
 * Builds a concrete request path from a route definition: substitutes `:param`
 * tokens with URL-encoded values and appends a query string. The result is
 * relative to the API mount point — clients prepend `<host>` + `API_PREFIX`.
 *
 * @example
 * buildPath(SESSIONS_ROUTES.revoke, { params: { sessionId: "cb81…" } })
 * // "/sessions/cb81…/revoke"
 *
 * @throws Error when a `:param` token has no matching value in `options.params`
 * — a programmer error, not a runtime input condition.
 */
export function buildPath<T extends RouteDef>(route: T, ...args: BuildPathArgs<T>): string {
  const options = (args[0] ?? {}) as {
    params?: Record<string, unknown>
    query?: Record<string, QueryParamValue | readonly QueryParamValue[]>
  }

  const path = route.path.replace(/:([A-Za-z0-9_]+)/g, (_, name: string) => {
    const value = options.params?.[name]
    if (value === undefined || value === null) {
      throw new Error(`buildPath: missing value for path parameter ":${name}" in "${route.path}"`)
    }
    return encodeURIComponent(String(value))
  })

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(options.query ?? {})) {
    const items = Array.isArray(value) ? value : [value]
    for (const item of items) {
      if (item === undefined || item === null) continue
      search.append(key, String(item))
    }
  }

  const queryString = search.toString()
  return queryString ? `${path}?${queryString}` : path
}
