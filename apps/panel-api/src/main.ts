import { Logger } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ZodValidationPipe } from "nestjs-zod"
import { setupSwagger } from "./common/utils"
import { CatchAllExceptionFilter, HttpExceptionFilter } from "./common/exceptions"

const globalPrefix = "/api"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT || 3000

  app.setGlobalPrefix(globalPrefix)
  app.useGlobalPipes(new ZodValidationPipe())
  // app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalFilters(new CatchAllExceptionFilter())

  const swagPath = await setupSwagger(app, globalPrefix)

  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}${globalPrefix}`)
  Logger.log(`📚 Swagger documentation available at: http://localhost:${port}${swagPath}`)
}

bootstrap()
