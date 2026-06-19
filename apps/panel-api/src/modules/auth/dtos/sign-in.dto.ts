import { createZodDto } from "nestjs-zod"
import z from "zod"

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../constants"

export class SignInDto extends createZodDto(
  z.object({
    email: z.email(),
    password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
  }),
) {}
