import { Controller, Get, HttpCode, Param, Post } from "@nestjs/common"

import { ApiAuth, CurrentUser } from "../../common/decorators"
import { errorHandler } from "../../common/helpers/error-handler.helper"
import { IRequestUser } from "../../common/types"

import { GetSessionDto } from "./dtos"
import { SessionsService } from "./sessions.service"

@ApiAuth()
@Controller("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * Retrieves all active sessions for the authenticated user with a flag
   * indicating which one is the current session.
   */
  @Get("all")
  @HttpCode(200)
  async getAll(@CurrentUser() user: IRequestUser): Promise<GetSessionDto[]> {
    const result = await this.sessionsService.getAllUserSessions(user.userId)
    const sessions = errorHandler(result)

    return sessions.map((session) => ({
      id: session.id,
      isCurrent: session.id === user.sessionId,
      lastActiveAt: session.lastActiveAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }))
  }

  @Post("/:sessionId/revoke")
  async revokeSession(
    @Param("sessionId") sessionId: string,
    @CurrentUser("userId") userId: string,
  ) {
    return errorHandler(await this.sessionsService.revokeSession(sessionId, userId))
  }

  @Post("revoke-others")
  async revokeOthers(
    @CurrentUser("sessionId") sessionId: string,
    @CurrentUser("userId") userId: string,
  ) {
    return errorHandler(await this.sessionsService.revokeOthers(sessionId, userId))
  }
}
