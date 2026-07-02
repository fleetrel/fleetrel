import { createZodDto } from "nestjs-zod"

import { signUpBodySchema } from "@fleetrel/contract"

/** NestJS validation/Swagger wrapper over the contract's sign-up body schema. */
export class SignUpDto extends createZodDto(signUpBodySchema) {}
