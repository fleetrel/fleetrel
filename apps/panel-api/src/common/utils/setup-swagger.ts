import { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { cleanupOpenApiDoc } from "nestjs-zod"
import { readPackageJSON } from "pkg-types"

export const setupSwagger = async (app: INestApplication, path: string) => {
  const swagPath = `${path}/swagger`

  const pkg = await readPackageJSON()

  const config = new DocumentBuilder()
    .setTitle("Panel API")
    .setDescription("API documentation for the Panel API service")
    .setVersion(pkg.version ?? "0.0.1")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(swagPath, app, cleanupOpenApiDoc(document))

  return swagPath
}
