import { createZodDto } from "nestjs-zod"

import { signInBodySchema } from "@fleetrel/contract"

/** NestJS validation/Swagger wrapper over the contract's sign-in body schema. */
export class SignInDto extends createZodDto(signInBodySchema) {}
