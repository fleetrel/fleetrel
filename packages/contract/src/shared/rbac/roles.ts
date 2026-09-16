import { z } from "zod"

/** Operator roles, ordered from most to least privileged. */
export const ROLES = ["owner", "admin", "operator", "viewer"] as const

/** Wire schema of an operator role. */
export const roleSchema = z.enum(ROLES)

/** Operator role. */
export type Role = z.infer<typeof roleSchema>

/**
 * Privilege rank of each role. A higher rank may manage users of a lower or
 * equal rank; see `canAssignRole`.
 */
export const ROLE_RANK: Readonly<Record<Role, number>> = {
  owner: 3,
  admin: 2,
  operator: 1,
  viewer: 0,
}
