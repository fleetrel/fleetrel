import { CustomDecorator, SetMetadata } from "@nestjs/common"

import { IS_PUBLIC_KEY } from "../constants"

/**
 * Opt a route (or whole controller) out of the global `JwtAuthGuard`.
 * Routes are authenticated by default; mark the few public ones explicitly.
 */
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true)
