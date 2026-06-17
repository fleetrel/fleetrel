/** Sliding window duration in milliseconds shared across all throttle tiers. */
export const THROTTLE_TTL_MS = 60_000

/**
 * Per-IP request limits per `THROTTLE_TTL_MS` window.
 *
 * DEFAULT      — applied to every route that carries no @Throttle() override.
 * AUTH_STRICT  — credential endpoints (sign-in, sign-up): prevents brute-force
 *                and account-farming with a tight limit.
 * AUTH_REFRESH — token refresh: higher than strict to accommodate multi-tab UX.
 * AUTH_SIGNOUT — sign-out: generous limit, the action is safe to repeat.
 */
export const THROTTLE_LIMIT = {
  DEFAULT: 120,
  AUTH_STRICT: 5,
  AUTH_REFRESH: 30,
  AUTH_SIGNOUT: 10,
} as const
