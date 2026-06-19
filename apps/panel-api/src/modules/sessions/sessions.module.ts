import { Module } from "@nestjs/common"

import { AuthSessionMapper } from "./mappers"
import { AuthSessionRepository } from "./repositories"
import { SessionsService } from "./sessions.service"

@Module({
  providers: [SessionsService, AuthSessionMapper, AuthSessionRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
