import { InternalServerErrorException } from "@nestjs/common"

import { getErrorByCode } from "@fleetrel/contract"

import { HttpExceptionWithErrorCodeType } from "../exceptions"
import { TResult } from "../utils"

export function errorHandler<T>(response: TResult<T>): T {
  if (response.isOk === false) {
    const errorObject = response.code ? getErrorByCode(response.code) : undefined

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
