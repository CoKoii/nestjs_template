import { HttpException } from "@nestjs/common";
import type { Request } from "express";
import { QueryFailedError } from "typeorm";

const DEFAULT_MESSAGE = "Internal Server Error";
const DATABASE_ERROR_MESSAGE = "数据库操作失败";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const SENSITIVE_KEYS = new Set([
  "password",
  "confirmPassword",
  "authorization",
  "token",
  "accessToken",
  "refreshToken",
]);

const maskString = (value: string) =>
  value.length <= 8
    ? "[REDACTED]"
    : `${value.slice(0, 4)}...${value.slice(-4)}`;

const toMessage = (raw: unknown) =>
  raw == null
    ? DEFAULT_MESSAGE
    : typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? raw.map((item) => String(item)).join(", ")
        : (JSON.stringify(raw) ?? DEFAULT_MESSAGE);

export const resolveExceptionMessage = (err: unknown): string => {
  if (err instanceof QueryFailedError) {
    return DATABASE_ERROR_MESSAGE;
  }

  if (err instanceof HttpException) {
    const responseBody = err.getResponse();
    const raw = isRecord(responseBody) ? responseBody["message"] : responseBody;
    return toMessage(raw);
  }

  return err instanceof Error ? err.message : DEFAULT_MESSAGE;
};

const sanitizeValue = (
  value: unknown,
  seen = new WeakSet<object>(),
): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen));
  }
  if (!isRecord(value)) {
    return value;
  }
  if (seen.has(value)) {
    return "[Circular]";
  }

  seen.add(value);
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.has(key) ? "[REDACTED]" : sanitizeValue(item, seen),
    ]),
  );
};

const sanitizeToken = (authorization: string | string[] | null | undefined) => {
  const token =
    typeof authorization === "string" ? authorization : authorization?.[0];
  return token ? maskString(token) : null;
};

export const buildExceptionLog = (
  request: Request & { user?: unknown },
  statusCode: number,
  message: string,
  error?: Error,
) => ({
  method: request.method,
  path: request.originalUrl ?? request.url,
  ip: request.ip,
  params: sanitizeValue(request.params ?? null),
  query: sanitizeValue(request.query ?? null),
  body: sanitizeValue((request.body as unknown) ?? null),
  user: sanitizeValue(request.user ?? null),
  token: sanitizeToken(request.headers["authorization"] ?? null),
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
  timestamp: new Date().toISOString(),
});
