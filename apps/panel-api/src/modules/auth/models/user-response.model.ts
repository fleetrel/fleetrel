import { ApiProperty } from "@nestjs/swagger"

export class UserResponseModel {
  @ApiProperty({
    description: "Unique user ID",
  })
  public readonly id: string

  @ApiProperty({
    description: "User email address",
  })
  public readonly email: string

  @ApiProperty({
    description: "Date the record was created",
  })
  public readonly createdAt: Date

  @ApiProperty({
    description: "Date of last record update",
  })
  public readonly updatedAt: Date

  constructor(data: UserResponseModel) {
    this.id = data.id
    this.email = data.email
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }
}
