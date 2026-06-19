import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common"
import { Request, Response } from "express"
import { ZodValidationException } from "nestjs-zod"

import { BaseAppException } from "../types"

import { HttpExceptionWithErrorCodeType } from "./http-exception-with-error-code.type"

@Catch(HttpExceptionWithErrorCodeType, ZodValidationException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpExceptionWithErrorCodeType | ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    if (exception instanceof HttpException && exception.getStatus) {
      status = exception.getStatus()
    }

    let errorMessage: string | string[]
    let errorCode = "E000"
    if (status === HttpStatus.FORBIDDEN) {
      errorMessage = "Forbidden"
    } else {
      errorMessage = exception.message
      if (exception instanceof HttpExceptionWithErrorCodeType) {
        errorCode = exception.errorCode
      }
    }

    if (exception instanceof ZodValidationException) {
      this.logger.warn(`[ZodValidation] ${request.method} ${request.url}`)
      response.removeHeader("x-powered-by")
      response.status(status).json(exception.getResponse())
    } else {
      const data: BaseAppException = {
        timestamp: new Date().toISOString(),
        code: errorCode,
        path: request.url,
        message: errorMessage,
      }

      if (status >= 500) {
        this.logger.error(`[HTTP ${status}] ${request.method} ${request.url} — ${errorMessage}`)
      } else {
        this.logger.warn(`[HTTP ${status}] ${request.method} ${request.url}`)
      }
      response.status(status).json(data)
    }
  }
}
