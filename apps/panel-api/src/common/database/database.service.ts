import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/client"
import { getConnectionString, formatPgError } from "./helpers"
import { Client } from "pg"

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name)
  private readonly connectionString: string

  constructor(private configService: ConfigService) {
    const host = configService.get<string>("DATABASE_HOST")!
    const port = configService.get<number>("DATABASE_PORT")!
    const database = configService.get<string>("DATABASE_NAME")!
    const username = configService.get<string>("DATABASE_USER")!
    const password = configService.get<string>("DATABASE_PASSWORD")!

    const connectionString = getConnectionString({
      username,
      password,
      host,
      port,
      database,
    })

    const adapter = new PrismaPg({ connectionString })
    super({ adapter })

    this.connectionString = connectionString
    this.logger.debug(
      `Database target: ${username}@${host}:${port}/${database}`,
    )
  }

  async onModuleInit(): Promise<void> {
    await this.testConnection()
    await this.$connect()
    this.logger.log("Database ready")
  }

  private async testConnection(): Promise<void> {
    const client = new Client({ connectionString: this.connectionString })

    try {
      this.logger.log("Connecting to database...")
      await client.connect()
      this.logger.log("Connection successful")
    } catch (error) {
      this.logger.error(`Cannot connect to database: ${formatPgError(error)}`)
      process.exit(1)
    } finally {
      await client.end().catch(() => null)
    }
  }
}
