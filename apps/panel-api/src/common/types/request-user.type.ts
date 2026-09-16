import type { Role } from "@fleetrel/contract"

/**
 * Authenticated principal attached to `request.user` by the JWT strategy
 * after a successful access-token verification.
 */
export interface IRequestUser {
  userId: string
  sessionId: string
  /** Role loaded from the database on every request, so role changes apply immediately. */
  role: Role
}
