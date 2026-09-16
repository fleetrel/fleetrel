import { applyDecorators, SetMetadata } from "@nestjs/common"
import { ApiForbiddenResponse } from "@nestjs/swagger"

import type { Permission } from "@fleetrel/contract"

import { REQUIRED_PERMISSIONS_KEY } from "../constants"

/**
 * Restricts a route (or whole controller) to operators whose role holds every
 * listed permission. Enforced by the global `PermissionsGuard`; routes without
 * this decorator are open to any authenticated operator.
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  applyDecorators(
    SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions),
    ApiForbiddenResponse({ description: `Requires permissions: ${permissions.join(", ")}.` }),
  )
