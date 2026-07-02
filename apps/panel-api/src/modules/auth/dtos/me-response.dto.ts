import { createZodDto } from "nestjs-zod"

import { meResponseSchema } from "@fleetrel/contract"

/** NestJS Swagger wrapper over the contract's GET /auth/me response schema. */
export class MeResponseDto extends createZodDto(meResponseSchema) {}
