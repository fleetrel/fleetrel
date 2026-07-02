import { z } from "zod"

import { userSchema } from "../../shared/domain"

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./auth.constants"

/** Request body of POST /auth/sign-in. */
export const signInBodySchema = z.object({
  email: z.email(),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
})

/** Request body type of POST /auth/sign-in. */
export type SignInBody = z.infer<typeof signInBodySchema>

/**
 * Request body of POST /auth/sign-up. Same shape as sign-in today, declared
 * separately so the two can evolve independently.
 */
export const signUpBodySchema = z.object({
  email: z.email(),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
})

/** Request body type of POST /auth/sign-up. */
export type SignUpBody = z.infer<typeof signUpBodySchema>

/**
 * Acknowledgement body returned by cookie-setting auth endpoints; the token
 * pair itself travels only in HTTP-only cookies.
 */
export const authOkResponseSchema = z.object({ ok: z.literal(true) })

/** Response type of cookie-setting auth endpoints. */
export type AuthOkResponse = z.infer<typeof authOkResponseSchema>

/** Response of GET /auth/me — the domain user shape as-is. */
export const meResponseSchema = userSchema

/** Response type of GET /auth/me. */
export type MeResponse = z.infer<typeof meResponseSchema>
