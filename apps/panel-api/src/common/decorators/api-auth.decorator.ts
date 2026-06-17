import { applyDecorators } from "@nestjs/common"
import { ApiCookieAuth } from "@nestjs/swagger"
import { SWAGGER_COOKIE_SCHEME } from "../constants"

/**
 * Marks a controller or route as requiring authentication.
 * Shows the lock icon in Swagger UI and wires the cookie security scheme.
 * Apply to every controller that is NOT decorated with `@Public()`.
 */
export const ApiAuth = () => applyDecorators(ApiCookieAuth(SWAGGER_COOKIE_SCHEME))
