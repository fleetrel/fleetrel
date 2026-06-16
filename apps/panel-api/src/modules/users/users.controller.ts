import { Body, Controller, Post } from "@nestjs/common"
import { UsersService } from "./users.service"
import { CreateUserDto } from "./dtos"
import { ApiCreatedResponse } from "@nestjs/swagger"
import { UserResponseModel } from "./models"
import { errorHandler } from "../../common/helpers"

@Controller("users")
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiCreatedResponse({
    type: UserResponseModel,
  })
  @Post("create")
  async create(@Body() dto: CreateUserDto): Promise<UserResponseModel> {
    const result = await this.userService.createUser(dto)
    return errorHandler(result)
  }
}
