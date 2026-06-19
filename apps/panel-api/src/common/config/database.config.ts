import { ConfigService } from "@nestjs/config"

export const getDatabaseConfig = (cfg: ConfigService) => ({
  host: cfg.getOrThrow<string>("DATABASE_HOST"),
  port: cfg.getOrThrow<number>("DATABASE_PORT"),
  database: cfg.getOrThrow<string>("DATABASE_NAME"),
  username: cfg.getOrThrow<string>("DATABASE_USER"),
  password: cfg.getOrThrow<string>("DATABASE_PASSWORD"),
})
