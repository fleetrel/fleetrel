import { createZodDto } from "nestjs-zod"

import { changeRoleBodySchema } from "@fleetrel/contract"

/** NestJS wrapper over the contract's PATCH /users/:userId/role request body. */
export class ChangeRoleDto extends createZodDto(changeRoleBodySchema) {}
