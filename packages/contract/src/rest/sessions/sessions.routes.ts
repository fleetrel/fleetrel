import { z } from "zod"

import { defineRoute } from "../core"

import { sessionListResponseSchema, sessionRevokeResponseSchema } from "./sessions.schemas"

/** Root path segment of the sessions module. */
export const SESSIONS_BASE = "sessions"

/** REST contract of the sessions module. */
export const SESSIONS_ROUTES = {
  getAll: defineRoute({
    method: "GET",
    base: SESSIONS_BASE,
    segment: "all",
    summary: "List the authenticated user's active sessions",
    responses: { 200: sessionListResponseSchema },
  }),
  revoke: defineRoute({
    method: "POST",
    base: SESSIONS_BASE,
    segment: ":sessionId/revoke",
    summary: "Revoke a specific session of the authenticated user",
    request: { params: z.object({ sessionId: z.uuid() }) },
    responses: { 201: sessionRevokeResponseSchema },
    errors: ["SESSION_NOT_FOUND", "SESSION_ERROR_REVOKE"],
  }),
  revokeOthers: defineRoute({
    method: "POST",
    base: SESSIONS_BASE,
    segment: "revoke-others",
    summary: "Revoke all sessions except the current one",
    responses: { 201: sessionRevokeResponseSchema },
    errors: ["SESSION_NOT_FOUND", "SESSION_ERROR_REVOKE"],
  }),
} as const
