import { z } from "zod"

/** Wire shape of a user as it appears in API payloads across all transports. */
export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

/** Wire type of a user. */
export type User = z.infer<typeof userSchema>
