import { Injectable } from "@nestjs/common"

import { AuthSession } from "../../../common/database"
import { UniversalMapper } from "../../../common/mappers"
import { AuthSessionEntity } from "../entities"

const modelToEntity = (model: AuthSession): AuthSessionEntity => {
  return new AuthSessionEntity(model)
}

const entityToModel = (entity: AuthSessionEntity): AuthSession => {
  return {
    id: entity.id,
    userId: entity.userId,
    refreshTokenHash: entity.refreshTokenHash,
    lastActiveAt: entity.lastActiveAt,

    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  }
}

@Injectable()
export class AuthSessionMapper extends UniversalMapper<AuthSessionEntity, AuthSession> {
  constructor() {
    super(modelToEntity, entityToModel)
  }
}
