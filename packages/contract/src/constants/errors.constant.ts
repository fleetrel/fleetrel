export const ERRORS = {
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
} as const satisfies Record<string, { code: string; message: string; httpCode: number }>
