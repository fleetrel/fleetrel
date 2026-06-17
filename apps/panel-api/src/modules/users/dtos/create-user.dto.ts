import { createZodDto } from "nestjs-zod"
import z from "zod"

export class CreateUserDto extends createZodDto(
  z.object({
    email: z.email(),
    // Already-hashed password produced at the auth boundary; raw-password
    // rules (length, etc.) are enforced there, not here.
    password: z.string().min(1),
  }),
) {}
