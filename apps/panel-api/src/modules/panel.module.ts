import { Module } from "@nestjs/common"

import { AuthModule } from "./auth"
import { SessionsModule } from "./sessions"
import { UsersModule } from "./users"

@Module({
  imports: [UsersModule, AuthModule, SessionsModule],
})
export class PanelModules {}
