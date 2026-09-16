import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import type { Request } from "express"

import { ERRORS, hasPermissions, type Permission } from "@fleetrel/contract"

import { IS_PUBLIC_KEY, REQUIRED_PERMISSIONS_KEY } from "../constants"
import { HttpExceptionWithErrorCodeType } from "../exceptions"
import { IRequestUser } from "../types"

/**
 * Global authorization guard enforcing `@RequirePermissions()`. Must run after
 * `JwtAuthGuard`, which populates `request.user`.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()]

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)
    if (isPublic) return true

    const required = this.reflector.getAllAndOverride<Permission[] | undefined>(
      REQUIRED_PERMISSIONS_KEY,
      targets,
    )
    if (!required?.length) return true

    const user = context.switchToHttp().getRequest<Request>().user as IRequestUser | undefined
    if (user && hasPermissions(user.role, required)) return true

    const { message, code, httpCode } = ERRORS.PERMISSION_DENIED
    throw new HttpExceptionWithErrorCodeType(message, code, httpCode)
  }
}
