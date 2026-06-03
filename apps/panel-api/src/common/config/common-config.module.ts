import { Global, Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { validateEnvConfig } from "../utils"
import { configSchema, Env } from "./app-config"

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ".env",
      validate: (config) => validateEnvConfig<Env>(configSchema, config),
    }),
  ],
})
export class CommonConfigModule {}
