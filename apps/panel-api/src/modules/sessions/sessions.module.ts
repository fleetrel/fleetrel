import { Module } from "@nestjs/common"

import { AuthSessionMapper } from "./mappers"
import { AuthSessionRepository } from "./repositories"
import { SessionsController } from "./sessions.controller"
import { SessionsService } from "./sessions.service"

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, AuthSessionMapper, AuthSessionRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
