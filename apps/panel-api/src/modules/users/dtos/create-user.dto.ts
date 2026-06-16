import { createZodDto } from "nestjs-zod"
import z from "zod"

export class CreateUserDto extends createZodDto(
  z.object({
    email: z.email(),
    password: z.string().min(6),
  }),
) {}
