import { z } from "zod"

/** Wire shape of an auth session as it appears in API payloads across all transports. */
export const sessionSchema = z.object({
  id: z.uuid(),
  lastActiveAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

/** Wire type of an auth session. */
export type Session = z.infer<typeof sessionSchema>
