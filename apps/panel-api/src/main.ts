import { Logger } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { setupSwagger } from "./common/setup-swagger"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const globalPrefix = "/api"
  app.setGlobalPrefix(globalPrefix)

  const swagPath = setupSwagger(app, globalPrefix)

  const port = process.env.PORT || 3000
  await app.listen(port)
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  )

  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}${swagPath}`,
  )
}

bootstrap()
