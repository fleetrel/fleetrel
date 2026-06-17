import { createZodDto } from "nestjs-zod"
import z from "zod"

export class CreateSessionDto extends createZodDto(
  z.object({
    userId: z.uuid(),
    sessionId: z.uuid(),
    refreshToken: z.string(),
  }),
) {}
