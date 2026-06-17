import { Module } from "@nestjs/common"
import { SessionsService } from "./sessions.service"
import { AuthSessionMapper } from "./mappers"
import { AuthSessionRepository } from "./repositories"

@Module({
  providers: [SessionsService, AuthSessionMapper, AuthSessionRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
