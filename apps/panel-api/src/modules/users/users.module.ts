import { Module } from "@nestjs/common"

import { UserMapper } from "./mappers"
import { UserRepository } from "./repositories"
import { UsersService } from "./users.service"

@Module({
  providers: [UserRepository, UsersService, UserMapper],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
