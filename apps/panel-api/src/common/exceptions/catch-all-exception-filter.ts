import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from "@nestjs/common"
import { Request, Response } from "express"
import { ZodValidationException } from "nestjs-zod"

import { BaseAppException } from "../types"

import { HttpExceptionWithErrorCodeType } from "./http-exception-with-error-code.type"

@Catch()
export class CatchAllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CatchAllExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    if (exception instanceof HttpException) {
      status = exception.getStatus()
    }

    let errorMessage: string | string[] = "Internal server error"
    let errorCode = "E000"

    if (status === HttpStatus.FORBIDDEN) {
      errorMessage = "Forbidden"
    } else if (exception instanceof Error) {
      errorMessage = exception.message
    }

    if (exception instanceof HttpExceptionWithErrorCodeType) {
      errorCode = exception.errorCode
    } else if (exception instanceof UnauthorizedException) {
      errorCode = "E401"
    } else if (exception instanceof ForbiddenException) {
      errorCode = "E403"
    }

    if (exception instanceof ZodValidationException) {
      this.logger.warn(`[ZodValidation] ${request.method} ${request.url}`)
      response.status(status).json(exception.getResponse())
      return
    }

    if (exception instanceof HttpExceptionWithErrorCodeType || exception instanceof HttpException) {
      if (status >= 500) {
        this.logger.error(`[HTTP ${status}] ${request.method} ${request.url} — ${errorMessage}`)
      } else {
        this.logger.warn(`[HTTP ${status}] ${request.method} ${request.url}`)
      }
      response.status(status).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        message: errorMessage,
        code: errorCode,
      } as BaseAppException)
      return
    }

    this.logger.error(
      `[Unhandled] ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    )

    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      message: "Internal server error",
      code: "E500",
    } as BaseAppException)
  }
}
