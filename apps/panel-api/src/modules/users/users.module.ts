import { Module } from "@nestjs/common"

import { UserMapper } from "./mappers"
import { UserRepository } from "./repositories"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"

@Module({
  controllers: [UsersController],
  providers: [UserRepository, UsersService, UserMapper],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
