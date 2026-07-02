/** Shape of a single entry in the domain error registry. */
export interface ApiErrorDef<TCode extends string = string> {
  code: TCode
  message: string
  httpCode: number
}

/** Enforces at compile time that every registry key equals its entry's `code`. */
function defineErrors<const T extends { [K in keyof T & string]: ApiErrorDef<K> }>(errors: T): T {
  return errors
}

/**
 * Registry of all domain error codes the panel API can return. Every failure
 * produced by backend services must reference an entry from this registry;
 * clients match on `code` to handle specific errors.
 */
export const ERRORS = defineErrors({
  // USER
  USER_ALREADY_EXISTS: {
    code: "USER_ALREADY_EXISTS",
    message: "User already exists",
    httpCode: 409,
  },
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "User not found",
    httpCode: 404,
  },
  CREATE_USER_ERROR: {
    code: "CREATE_USER_ERROR",
    message: "Failed to create user",
    httpCode: 500,
  },

  // AUTH
  AUTH_SIGN_IN_ERROR: {
    code: "AUTH_SIGN_IN_ERROR",
    message: "Failed to authorization",
    httpCode: 400,
  },
  AUTH_INVALID_CREDENTIALS: {
    code: "AUTH_INVALID_CREDENTIALS",
    message: "Incorrect email or password",
    httpCode: 400,
  },
  AUTH_INVALID_TOKEN: {
    code: "AUTH_INVALID_TOKEN",
    message: "The token is not valid",
    httpCode: 400,
  },
  AUTH_FORBIDDEN: {
    code: "AUTH_FORBIDDEN",
    message: "Access Denied",
    httpCode: 400,
  },
  AUTH_REFRESH_ERROR: {
    code: "AUTH_REFRESH_ERROR",
    message: "An error occurred updating the token",
    httpCode: 400,
  },

  // SESSIONS
  SESSION_ERROR_CREATE: {
    code: "SESSION_ERROR_CREATE",
    message: "Session creation error",
    httpCode: 400,
  },
  SESSION_ERROR_REVOKE: {
    code: "SESSION_ERROR_REVOKE",
    message: "Revoke session error",
    httpCode: 400,
  },
  SESSION_NOT_FOUND: {
    code: "SESSION_NOT_FOUND",
    message: "Session not found",
    httpCode: 400,
  },
  SESSION_TOKEN_MISMATCH: {
    code: "SESSION_TOKEN_MISMATCH",
    message: "Refresh token does not match the active session",
    httpCode: 401,
  },
})

/** Union of all registered domain error codes. */
export type ErrorCode = keyof typeof ERRORS

/** Looks up a registry entry by its error code; `undefined` for unknown codes. */
export function getErrorByCode(code: string): ApiErrorDef | undefined {
  return (ERRORS as Record<string, ApiErrorDef>)[code]
}
