import { Module } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { UserRepository } from "./repositories"
import { UserMapper } from "./mappers"

@Module({
  controllers: [UsersController],
  providers: [UserRepository, UsersService, UserMapper],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
