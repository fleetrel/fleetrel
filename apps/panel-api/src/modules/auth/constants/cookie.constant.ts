/**
 * Names of the cookies that carry the auth token pair.
 * Shared between the controller (writes them) and the JWT strategy (reads them).
 */
export const AUTH_COOKIE = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const

/**
 * Path scope for each cookie. The refresh token is scoped to the refresh
 * endpoint only, so the browser never attaches it to regular API calls.
 * Paths include the global `/api` prefix configured in `main.ts`.
 */
export const AUTH_COOKIE_PATH = {
  ACCESS_TOKEN: "/",
  REFRESH_TOKEN: "/api/auth/refresh",
} as const
