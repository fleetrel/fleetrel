import { Injectable } from "@nestjs/common"
import { User } from "../../../common/database"
import { UserEntity } from "../entities"
import { UniversalMapper } from "../../../common/mappers"

const modelToEntity = (model: User): UserEntity => {
  return new UserEntity(model)
}

const entityToModel = (entity: UserEntity): User => {
  return {
    id: entity.id,
    email: entity.email,
    password: entity.password,

    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  }
}

@Injectable()
export class UserMapper extends UniversalMapper<UserEntity, User> {
  constructor() {
    super(modelToEntity, entityToModel)
  }
}
