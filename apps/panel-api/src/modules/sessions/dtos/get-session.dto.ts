import { createZodDto } from "nestjs-zod"

import { sessionItemSchema } from "@fleetrel/contract"

/** NestJS Swagger wrapper over the contract's session item schema (GET /sessions/all). */
export class GetSessionDto extends createZodDto(sessionItemSchema) {}
