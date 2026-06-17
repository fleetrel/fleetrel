export const ERRORS = {
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
} as const satisfies Record<string, { code: string; message: string; httpCode: number }>
