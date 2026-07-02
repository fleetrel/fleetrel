import { ApiProperty } from "@nestjs/swagger"

export interface BaseAppException {
  timestamp: string
  path: string
  message: string
  code: string
}

export class BaseAppExceptionModel {
  @ApiProperty({ format: "date-time" })
  timestamp: string

  @ApiProperty({ format: "uri-template" })
  path: string
  @ApiProperty()
  message: string
  @ApiProperty()
  code: string

  constructor() {
    this.timestamp = ""
    this.path = ""
    this.message = ""
    this.code = ""
  }
}
