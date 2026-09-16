import { z } from "zod"

import { userSchema } from "../../shared/domain"
import { roleSchema } from "../../shared/rbac"

/** Response body of GET /users. */
export const userListResponseSchema = z.array(userSchema)

/** Response type of GET /users. */
export type UserListResponse = z.infer<typeof userListResponseSchema>

/** Path params of PATCH /users/:userId/role. */
export const changeRoleParamsSchema = z.object({ userId: z.uuid() })

/** Path params type of PATCH /users/:userId/role. */
export type ChangeRoleParams = z.infer<typeof changeRoleParamsSchema>

/** Request body of PATCH /users/:userId/role. */
export const changeRoleBodySchema = z.object({ role: roleSchema })

/** Request body type of PATCH /users/:userId/role. */
export type ChangeRoleBody = z.infer<typeof changeRoleBodySchema>

/** Response body of PATCH /users/:userId/role — the updated user. */
export const changeRoleResponseSchema = userSchema

/** Response type of PATCH /users/:userId/role. */
export type ChangeRoleResponse = z.infer<typeof changeRoleResponseSchema>
