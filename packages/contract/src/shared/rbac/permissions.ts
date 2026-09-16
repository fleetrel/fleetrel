/**
 * Registry of operator permissions in `resource:action` form. Each feature
 * module declares its own entries here; the same strings are intended to be
 * reused as API-key scopes.
 */
export const PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_MANAGE: "users:manage",
} as const

/** Union of all registered permissions. */
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
