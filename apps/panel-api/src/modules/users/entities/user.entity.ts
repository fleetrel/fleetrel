import { User } from "../../../common/database"

export class UserEntity implements User {
  public id!: string
  public email!: string
  public password!: string
  public createdAt!: Date
  public updatedAt!: Date

  constructor(entity: UserEntity) {
    Object.assign(this, entity)
  }
}
