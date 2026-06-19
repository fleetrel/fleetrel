import { InternalServerErrorException } from "@nestjs/common"

import { ERRORS } from "@fleetrel/contract"

import { HttpExceptionWithErrorCodeType } from "../exceptions"
import { TResult } from "../utils"

export function errorHandler<T>(response: TResult<T>): T {
  if (response.isOk === false) {
    if (!response.code) {
      throw new InternalServerErrorException("Unknown error")
    }

    const errorObject = Object.values(ERRORS).find((error) => error?.code === response.code)

    if (!errorObject) {
      throw new InternalServerErrorException("Unknown error")
    }

    throw new HttpExceptionWithErrorCodeType(
      response.message || errorObject.message,
      errorObject.code,
      errorObject.httpCode,
    )
  }

  return response.response
}
