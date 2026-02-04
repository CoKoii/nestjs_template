/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import { HttpException } from "@nestjs/common";
import type { Request } from "express";
import { QueryFailedError } from "typeorm";

const DEFAULT_MESSAGE = "Internal Server Error";
const toMessage = (raw: unknown) =>
  raw == null
    ? DEFAULT_MESSAGE
    : typeof raw === "string"
      ? raw
      : (JSON.stringify(raw) ?? DEFAULT_MESSAGE);

export const resolveExceptionMessage = (err: unknown): string => {
  if (err instanceof QueryFailedError) return err.message;
  if (err instanceof HttpException) {
    const responseBody = err.getResponse();
    const raw =
      typeof responseBody === "string"
        ? responseBody
        : responseBody && typeof responseBody === "object"
          ? (responseBody as { message?: unknown }).message
          : undefined;
    return toMessage(raw);
  }
  return err instanceof Error ? err.message : DEFAULT_MESSAGE;
};

const parseJWT = (token: string | null | undefined) => {
  if (!token) return null;
  try {
    const tokenStr = token.startsWith("Bearer ") ? token.slice(7) : token;
    const parts = tokenStr.split(".");
    const p = JSON.parse(Buffer.from(parts[1], "base64").toString());
    return {
      sub: p.sub,
      username: p.username,
      roles: (p.roles ?? []) as string[],
    };
  } catch {
    return null;
  }
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
  body: (request.body as unknown) ?? null,
  token: request.headers["authorization"] ?? null,
  tokenInfo: parseJWT(request.headers["authorization"]),
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
  timestamp: new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }),
});
