import { Module } from "@nestjs/common"
import { UsersModule } from "./users"
import { AuthModule } from "./auth"
import { SessionsModule } from "./sessions"

@Module({
  imports: [UsersModule, AuthModule, SessionsModule],
})
export class PanelModules {}
