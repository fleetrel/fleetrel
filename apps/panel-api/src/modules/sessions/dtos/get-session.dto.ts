import { createZodDto } from "nestjs-zod"
import z from "zod"

/**
 * GetSessionDto. Represents a single session in the response with a flag
 * indicating if it is the current session.
 */
export class GetSessionDto extends createZodDto(
  z.object({
    id: z.string().uuid(),
    isCurrent: z.boolean(),
    lastActiveAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
) {}
