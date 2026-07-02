import { z } from "zod"

/**
 * Wire format of every domain error response produced by the panel API
 * exception filters.
 */
export const errorResponseSchema = z.object({
  timestamp: z.iso.datetime(),
  path: z.string(),
  message: z.string(),
  code: z.string(),
})

/** Wire type of a domain error response body. */
export type ErrorResponse = z.infer<typeof errorResponseSchema>
