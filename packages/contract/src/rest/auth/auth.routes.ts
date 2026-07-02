import { defineRoute } from "../core"

import {
  authOkResponseSchema,
  meResponseSchema,
  signInBodySchema,
  signUpBodySchema,
} from "./auth.schemas"

/** Root path segment of the auth module. */
export const AUTH_BASE = "auth"

/** REST contract of the auth module. */
export const AUTH_ROUTES = {
  signUp: defineRoute({
    method: "POST",
    base: AUTH_BASE,
    segment: "sign-up",
    summary: "Register a new user and start a session (sets auth cookies)",
    request: { body: signUpBodySchema },
    responses: { 201: authOkResponseSchema },
    errors: ["USER_ALREADY_EXISTS", "CREATE_USER_ERROR"],
  }),
  signIn: defineRoute({
    method: "POST",
    base: AUTH_BASE,
    segment: "sign-in",
    summary: "Authenticate a user (sets auth cookies)",
    request: { body: signInBodySchema },
    responses: { 201: authOkResponseSchema },
    errors: ["AUTH_INVALID_CREDENTIALS", "AUTH_SIGN_IN_ERROR"],
  }),
  refresh: defineRoute({
    method: "POST",
    base: AUTH_BASE,
    segment: "refresh",
    summary: "Rotate the token pair using the refresh-token cookie",
    responses: { 200: authOkResponseSchema },
    errors: ["AUTH_INVALID_TOKEN", "AUTH_FORBIDDEN", "AUTH_REFRESH_ERROR"],
  }),
  signOut: defineRoute({
    method: "POST",
    base: AUTH_BASE,
    segment: "sign-out",
    summary: "Revoke the current session and clear auth cookies",
    responses: { 201: authOkResponseSchema },
  }),
  me: defineRoute({
    method: "GET",
    base: AUTH_BASE,
    segment: "me",
    summary: "Get the authenticated user's profile",
    responses: { 200: meResponseSchema },
    errors: ["USER_NOT_FOUND"],
  }),
} as const
