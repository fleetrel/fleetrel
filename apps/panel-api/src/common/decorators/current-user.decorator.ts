import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import type { Request } from "express"

import { IRequestUser } from "../types"

/**
 * Injects the authenticated principal attached by the JWT strategy.
 * Pass a key to pull a single field, e.g. `@CurrentUser("userId") id: string`.
 */
export const CurrentUser = createParamDecorator(
  (field: keyof IRequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    const user = request.user as IRequestUser | undefined

    return field ? user?.[field] : user
  },
)
