import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  type LoggerService,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import type { Request, Response } from "express";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import {
  buildExceptionLog,
  buildExceptionResponse,
  resolveExceptionMessage,
} from "./exception.util";

const isServerError = (statusCode: number) => statusCode >= 500;

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
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
    const log = {
      message: `[${request.originalUrl ?? request.url}]`,
      ...buildExceptionLog(
        AllExceptionFilter.name,
        request,
        httpStatus,
        message,
        error,
      ),
    };

    if (isServerError(httpStatus)) {
      this.logger.error(log);
    } else {
      this.logger.warn(log);
    }

    httpAdapter.reply(
      response,
      buildExceptionResponse(httpStatus, message),
      httpStatus,
    );
  }
}
