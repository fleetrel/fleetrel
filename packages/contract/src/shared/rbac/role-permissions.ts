import { type Permission, PERMISSIONS } from "./permissions"
import { type Role, ROLE_RANK } from "./roles"

/** Static role → permissions mapping. `owner` always holds every permission. */
export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
  owner: Object.values(PERMISSIONS),
  admin: [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_MANAGE],
  operator: [],
  viewer: [],
}

/** Returns `true` when `role` holds every permission in `required`. */
export function hasPermissions(role: Role, required: readonly Permission[]): boolean {
  const granted = ROLE_PERMISSIONS[role]
  return required.every((permission) => granted.includes(permission))
}

/**
 * Whether `actor` may move a user from `currentRole` to `nextRole`: an actor can
 * neither touch a user ranked above itself nor grant a role above its own.
 * Permission checks (`users:manage`) and the last-owner invariant are enforced
 * separately.
 */
export function canAssignRole(actor: Role, currentRole: Role, nextRole: Role): boolean {
  const actorRank = ROLE_RANK[actor]
  return ROLE_RANK[currentRole] <= actorRank && ROLE_RANK[nextRole] <= actorRank
}
