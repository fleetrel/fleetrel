import { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { cleanupOpenApiDoc } from "nestjs-zod"

export const setupSwagger = (app: INestApplication, path: string) => {
  const swagPath = `${path}/swagger`

  const config = new DocumentBuilder()
    .setTitle("Panel API")
    .setDescription("API documentation for the Panel API service")
    // .setVersion() // todo: Make automatic version detection from the release status
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(swagPath, app, cleanupOpenApiDoc(document))

  return swagPath
}
