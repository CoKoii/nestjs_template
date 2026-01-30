import { HttpException } from "@nestjs/common";
import type { Request } from "express";
import { QueryFailedError } from "typeorm";

const DEFAULT_MESSAGE = "Internal Server Error";

export const resolveExceptionMessage = (err: unknown): string => {
  if (err instanceof QueryFailedError) return err.message;
  if (!(err instanceof HttpException)) {
    return err instanceof Error ? err.message : DEFAULT_MESSAGE;
  }
  const responseBody = err.getResponse();
  const raw =
    typeof responseBody === "string"
      ? responseBody
      : responseBody && typeof responseBody === "object"
        ? (responseBody as { message?: unknown }).message
        : undefined;
  return raw == null
    ? DEFAULT_MESSAGE
    : typeof raw === "string"
      ? raw
      : (JSON.stringify(raw) ?? DEFAULT_MESSAGE);
};

export const buildExceptionLog = (
  request: Request,
  statusCode: number,
  message: string,
  error?: Error,
) => ({
  method: request.method,
  path: request.originalUrl ?? request.url,
  ip: request.ip,
  statusCode,
  message,
  exception: error?.name ?? "UnknownException",
  stack: error?.stack,
});

export const buildExceptionResponse = (
  statusCode: number,
  message: string,
) => ({
  code: statusCode,
  message,
  data: null,
  timestamp: Date.now(),
});
