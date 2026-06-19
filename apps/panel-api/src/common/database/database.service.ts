import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { Client } from "pg"

import { getDatabaseConfig } from "../config"

import { PrismaClient } from "./generated/client"
import { formatPgError, getConnectionString } from "./helpers"

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name)
  private readonly connectionString: string

  constructor(private configService: ConfigService) {
    const { username, password, host, port, database } = getDatabaseConfig(configService)

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
    this.logger.debug(`Database target: ${username}@${host}:${port}/${database}`)
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
