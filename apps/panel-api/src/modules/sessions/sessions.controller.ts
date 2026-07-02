import { Controller, Get, HttpCode, Param, Post } from "@nestjs/common"
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger"

import { SessionListResponse, SESSIONS_BASE, SESSIONS_ROUTES } from "@fleetrel/contract"

import { ApiAuth, CurrentUser } from "../../common/decorators"
import { errorHandler } from "../../common/helpers/error-handler.helper"
import { IRequestUser } from "../../common/types"

import { GetSessionDto } from "./dtos"
import { SessionsService } from "./sessions.service"

@ApiAuth()
@Controller(SESSIONS_BASE)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * Retrieves all active sessions for the authenticated user with a flag
   * indicating which one is the current session.
   */
  @Get(SESSIONS_ROUTES.getAll.segment)
  @HttpCode(200)
  @ApiOperation({ summary: SESSIONS_ROUTES.getAll.summary })
  @ApiOkResponse({ type: GetSessionDto, isArray: true })
  async getAll(@CurrentUser() user: IRequestUser): Promise<SessionListResponse> {
    const result = await this.sessionsService.getAllUserSessions(user.userId)
    const sessions = errorHandler(result)

    return sessions.map((session) => ({
      id: session.id,
      isCurrent: session.id === user.sessionId,
      lastActiveAt: session.lastActiveAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    }))
  }

  @Post(SESSIONS_ROUTES.revoke.segment)
  @ApiOperation({ summary: SESSIONS_ROUTES.revoke.summary })
  async revokeSession(
    @Param("sessionId") sessionId: string,
    @CurrentUser("userId") userId: string,
  ) {
    return errorHandler(await this.sessionsService.revokeSession(sessionId, userId))
  }

  @Post(SESSIONS_ROUTES.revokeOthers.segment)
  @ApiOperation({ summary: SESSIONS_ROUTES.revokeOthers.summary })
  async revokeOthers(
    @CurrentUser("sessionId") sessionId: string,
    @CurrentUser("userId") userId: string,
  ) {
    return errorHandler(await this.sessionsService.revokeOthers(sessionId, userId))
  }
}
