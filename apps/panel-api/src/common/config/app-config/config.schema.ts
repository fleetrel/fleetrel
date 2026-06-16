import { createZodDto } from "nestjs-zod"
import z from "zod"

export const configSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  DATABASE_HOST: z.string().nonempty("DATABASE_HOST is required"),
  DATABASE_PORT: z
    .string()
    .nonempty("DATABASE_PORT is required")
    .transform((value) => Number(value))
    .pipe(z.number().int().positive().max(65535)),
  DATABASE_USER: z.string().nonempty("DATABASE_USER is required"),
  DATABASE_PASSWORD: z.string().nonempty("DATABASE_PASSWORD is required"),
  DATABASE_NAME: z.string().nonempty("DATABASE_NAME is required"),
})

export type ConfigSchema = z.infer<typeof configSchema>
export class Env extends createZodDto(configSchema) {}
