import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  type LoggerService,
} from "@nestjs/common";
import type { HttpAdapterHost } from "@nestjs/core";
import type { Request, Response } from "express";
import {
  buildExceptionLog,
  buildExceptionResponse,
  resolveExceptionMessage,
} from "./exception.utils";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = resolveExceptionMessage(exception);
    const error = exception instanceof Error ? exception : undefined;
    const path = request.originalUrl ?? request.url;
    this.logger.error(
      `[${path}]`,
      buildExceptionLog(request, httpStatus, message, error),
    );
    httpAdapter.reply(
      response,
      buildExceptionResponse(httpStatus, message, path),
      httpStatus,
    );
  }
}
