/**
 * Global prefix the panel API is mounted under. Clients use it as part of the
 * base URL; the backend passes it to `setGlobalPrefix`. Route `path` values in
 * this package are relative to this prefix.
 */
export const API_PREFIX = "/api"

/** HTTP methods used by REST route definitions. */
export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const

/** Union of the HTTP methods supported by route definitions. */
export type HttpMethod = (typeof HTTP_METHODS)[number]
