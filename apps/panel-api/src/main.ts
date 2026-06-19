import { Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import { ZodValidationPipe } from "nestjs-zod"

import { AppModule } from "./app.module"
import { CatchAllExceptionFilter } from "./common/exceptions"
import { setupSwagger } from "./common/utils"

const globalPrefix = "/api"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())

  const config = app.get(ConfigService)
  const port = config.get<number>("PORT", 3000)
  const isProduction = config.get("NODE_ENV") === "production"
  const isSwaggerEnabled = config.get<boolean>("SWAGGER_ENABLED")

  app.use(
    helmet({
      // HSTS is production-only — caching "HTTPS only" on localhost breaks local dev
      hsts: isProduction ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
      // CSP is disabled when Swagger is active — Swagger UI requires inline scripts
      contentSecurityPolicy: isSwaggerEnabled ? false : undefined,
    }),
  )

  app.setGlobalPrefix(globalPrefix)
  app.useGlobalPipes(new ZodValidationPipe())
  app.useGlobalFilters(new CatchAllExceptionFilter())

  if (isSwaggerEnabled) {
    const swagPath = await setupSwagger(app, globalPrefix)
    Logger.log(`📚 Swagger: http://localhost:${port}${swagPath}`)
  }

  await app.listen(port, () => {
    Logger.log(`🚀 Application running: http://localhost:${port}${globalPrefix}`)
  })
}

bootstrap()
