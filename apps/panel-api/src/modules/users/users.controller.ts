import { Body, Controller, Get, Param, Patch } from "@nestjs/common"
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger"

import {
  ChangeRoleResponse,
  PERMISSIONS,
  UserListResponse,
  USERS_BASE,
  USERS_ROUTES,
} from "@fleetrel/contract"

import { ApiAuth, CurrentUser, RequirePermissions } from "../../common/decorators"
import { errorHandler } from "../../common/helpers"

import { ChangeRoleDto, UserResponseDto } from "./dtos"
import { toUserWire } from "./mappers"
import { UsersService } from "./users.service"

@ApiAuth()
@ApiTags("Users")
@Controller(USERS_BASE)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(USERS_ROUTES.list.segment)
  @RequirePermissions(PERMISSIONS.USERS_READ)
  @ApiOperation({ summary: USERS_ROUTES.list.summary })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  async list(): Promise<UserListResponse> {
    const users = errorHandler(await this.usersService.listUsers())
    return users.map(toUserWire)
  }

  @Patch(USERS_ROUTES.changeRole.segment)
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: USERS_ROUTES.changeRole.summary })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: "User not found." })
  @ApiConflictResponse({ description: "The last owner cannot be demoted." })
  async changeRole(
    @Param("userId") userId: string,
    @Body() dto: ChangeRoleDto,
    @CurrentUser("userId") actorId: string,
  ): Promise<ChangeRoleResponse> {
    const user = errorHandler(await this.usersService.changeRole(actorId, userId, dto.role))
    return toUserWire(user)
  }
}
