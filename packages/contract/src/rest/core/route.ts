import type { z, ZodType } from "zod"

import type { ErrorCode } from "../../shared/errors"

import type { HttpMethod } from "./http"

/** Zod schemas describing the inbound parts of a request. */
export interface RouteRequest {
  body?: ZodType
  params?: ZodType
  query?: ZodType
}

/**
 * Declarative, transport-agnostic description of a single REST endpoint.
 * Contains only data (paths, methods, Zod schemas, error codes) so it can be
 * consumed by any HTTP layer — NestJS decorators, a fetch/axios client, or a
 * docs generator.
 */
export interface RouteDef {
  method: HttpMethod
  /**
   * Root path shared by a module's routes (no leading/trailing slash), e.g.
   * "auth". Inner slashes and `:param` tokens are allowed for nested
   * resources, e.g. "fleet/servers".
   */
  base: string
  /**
   * Path relative to `base` (no leading slash); "" for the module root. Inner
   * slashes and `:param` tokens are allowed, e.g. ":serverId/configs".
   */
  segment: string
  /** Full request path derived from `base` and `segment`, e.g. "/auth/sign-in". */
  path: string
  /** Human-readable endpoint summary, reused for API docs. */
  summary?: string
  request?: RouteRequest
  /** Success response schemas keyed by HTTP status code. */
  responses: Partial<Record<number, ZodType>>
  /** Domain error codes this endpoint can return. */
  errors?: readonly ErrorCode[]
}

type RoutePath<TBase extends string, TSegment extends string> = TSegment extends ""
  ? `/${TBase}`
  : `/${TBase}/${TSegment}`

/**
 * Builds a route definition, deriving the full `path` from `base` and `segment`
 * while preserving literal types for downstream client generation.
 */
export function defineRoute<const T extends Omit<RouteDef, "path">>(
  route: T,
): T & { path: RoutePath<T["base"], T["segment"]> } {
  const path = (
    route.segment === "" ? `/${route.base}` : `/${route.base}/${route.segment}`
  ) as RoutePath<T["base"], T["segment"]>

  return { ...route, path }
}

/** Request body type of a route, or `never` when the route declares no body. */
export type InferRequestBody<T extends RouteDef> = T["request"] extends {
  body: infer B extends ZodType
}
  ? z.output<B>
  : never

/** Path params type of a route, or `never` when the route declares no params. */
export type InferRequestParams<T extends RouteDef> = T["request"] extends {
  params: infer P extends ZodType
}
  ? z.output<P>
  : never

/** Query params type of a route, or `never` when the route declares no query. */
export type InferRequestQuery<T extends RouteDef> = T["request"] extends {
  query: infer Q extends ZodType
}
  ? z.output<Q>
  : never

/** Response body type of a route for the given HTTP status code. */
export type InferResponse<
  T extends RouteDef,
  TStatus extends number,
> = T["responses"][TStatus] extends infer R extends ZodType ? z.output<R> : never
