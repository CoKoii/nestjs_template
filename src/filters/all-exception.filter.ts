import {
  Catch,
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
  type LoggerService,
  HttpStatus,
} from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';
import { Response, Request } from 'express';
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
    const exceptionName =
      exception instanceof Error ? exception.name : 'UnknownException';
    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';
    const responseBody = {
      headers: request.headers,
      query: request.query,
      body: request.body as unknown,
      params: request.params,
      timestamp: new Date().toISOString(),
      ip: request.ip,
      exception: exceptionName,
      error: errorResponse,
    };

    this.logger.error('[toimc]', responseBody);
    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
