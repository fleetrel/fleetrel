import { InternalServerErrorException } from "@nestjs/common"
import { TResult } from "../utils"
import { ERRORS } from "@fleetrel/contracts"
import { HttpExceptionWithErrorCodeType } from "../exceptions"

export function errorHandler<T>(response: TResult<T>): T {
  // Используем строгое сравнение с литералом false
  if (response.isOk === false) {
    // TypeScript точно сузил тип до { isOk: false; code?: string; message?: string }

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

  // Если дошли до сюда, значит response.isOk === true
  // TypeScript сузил тип до { isOk: true; response: T }
  return response.response
}
