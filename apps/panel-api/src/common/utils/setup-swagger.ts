import { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { cleanupOpenApiDoc } from "nestjs-zod"
import { readPackageJSON } from "pkg-types"

export const setupSwagger = async (app: INestApplication, globalPrefix: string) => {
  const swagPath = `${globalPrefix}/swagger`
  const pkg = await readPackageJSON()

  const config = new DocumentBuilder()
    .setTitle("Fleetrel Panel API")
    .setDescription("Control plane for managing fleets of remote servers.")
    .setVersion(pkg.version ?? "0.0.0")
    .setLicense("MIT", "https://opensource.org/licenses/MIT")
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup(swagPath, app, cleanupOpenApiDoc(document), {
    swaggerOptions: {
      withCredentials: true,
      persistAuthorization: true,
      docExpansion: "list",
      filter: true,
      showRequestDuration: true,
    },
  })

  return swagPath
}
