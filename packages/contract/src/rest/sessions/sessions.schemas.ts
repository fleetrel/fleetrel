import { z } from "zod"

import { sessionSchema } from "../../shared/domain"

/**
 * Wire shape of a single session item in GET /sessions/all: the domain session
 * plus `isCurrent` — a view field relative to the caller, so it lives in the
 * REST layer rather than the domain.
 */
export const sessionItemSchema = sessionSchema.extend({ isCurrent: z.boolean() })

/** Wire type of a single session item. */
export type SessionItem = z.infer<typeof sessionItemSchema>

/** Response body of GET /sessions/all. */
export const sessionListResponseSchema = z.array(sessionItemSchema)

/** Response type of GET /sessions/all. */
export type SessionListResponse = z.infer<typeof sessionListResponseSchema>

/** Acknowledgement returned by session revocation endpoints. */
export const sessionRevokeResponseSchema = z.boolean()

/** Response type of session revocation endpoints. */
export type SessionRevokeResponse = z.infer<typeof sessionRevokeResponseSchema>
