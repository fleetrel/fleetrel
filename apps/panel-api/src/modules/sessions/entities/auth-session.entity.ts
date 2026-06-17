import { AuthSession } from "../../../common/database"

export class AuthSessionEntity implements AuthSession {
  public id!: string
  public userId!: string
  public refreshTokenHash!: string
  public lastActiveAt!: Date | null
  public createdAt!: Date
  public updatedAt!: Date

  constructor(entity: AuthSessionEntity) {
    Object.assign(this, entity)
  }
}
