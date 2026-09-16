import { defineRoute } from "../core"

import {
  changeRoleBodySchema,
  changeRoleParamsSchema,
  changeRoleResponseSchema,
  userListResponseSchema,
} from "./users.schemas"

/** Root path segment of the users module. */
export const USERS_BASE = "users"

/** REST contract of the users module (operator management). */
export const USERS_ROUTES = {
  list: defineRoute({
    method: "GET",
    base: USERS_BASE,
    segment: "",
    summary: "List panel operators (requires users:read)",
    responses: { 200: userListResponseSchema },
    errors: ["PERMISSION_DENIED"],
  }),
  changeRole: defineRoute({
    method: "PATCH",
    base: USERS_BASE,
    segment: ":userId/role",
    summary: "Change an operator's role (requires users:manage)",
    request: { params: changeRoleParamsSchema, body: changeRoleBodySchema },
    responses: { 200: changeRoleResponseSchema },
    errors: [
      "PERMISSION_DENIED",
      "USER_NOT_FOUND",
      "USER_ROLE_CHANGE_FORBIDDEN",
      "USER_LAST_OWNER",
      "USER_ROLE_CHANGE_ERROR",
    ],
  }),
} as const
