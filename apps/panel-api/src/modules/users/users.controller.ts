import { Controller, Get } from "@nestjs/common"
import { UsersService } from "./users.service"
import { CurrentUser } from "../../common/decorators"
import { errorHandler } from "../../common/helpers"

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Returns the profile of the currently authenticated user. */
  @Get("me")
  async getMe(@CurrentUser("userId") userId: string) {
    return errorHandler(await this.usersService.findUserById(userId))
  }
}
