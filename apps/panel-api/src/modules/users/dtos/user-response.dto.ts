import { createZodDto } from "nestjs-zod"

import { userSchema } from "@fleetrel/contract"

/** NestJS Swagger wrapper over the contract's user wire schema. */
export class UserResponseDto extends createZodDto(userSchema) {}
