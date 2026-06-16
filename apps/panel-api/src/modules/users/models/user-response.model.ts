import { ApiProperty } from "@nestjs/swagger"

export class UserResponseModel {
  @ApiProperty({
    description: "Уникальный идентификатор пользователя",
  })
  public readonly id: string

  @ApiProperty({
    description: "Email пользователя",
  })
  public readonly email: string

  @ApiProperty({
    description: "Дата создания записи",
  })
  public readonly createdAt: Date

  @ApiProperty({
    description: "Дата последнего обновления записи",
  })
  public readonly updatedAt: Date

  constructor(data: UserResponseModel) {
    this.id = data.id
    this.email = data.email
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }
}
