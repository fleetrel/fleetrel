import type { User } from "@fleetrel/contract"

import { UserEntity } from "../entities"

/** Converts a user entity to its wire shape; the password hash never leaves the backend. */
export function toUserWire(entity: UserEntity): User {
  return {
    id: entity.id,
    email: entity.email,
    role: entity.role,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  }
}
