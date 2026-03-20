import { HttpException } from "@nestjs/common";
import type { Request } from "express";
import { QueryFailedError } from "typeorm";
import { formatTimestamp } from "../../../shared/utils/timestamp.util";
import type { AuthTokenPayload } from "../../auth/types/auth-user.type";

const DEFAULT_MESSAGE = "Internal Server Error";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const SENSITIVE_KEYS = new Set([
  "password",
  "confirmPassword",
  "authorization",
  "token",
  "accessToken",
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
  if (err instanceof QueryFailedError) return err.message;
  if (err instanceof HttpException) {
    const responseBody = err.getResponse();
    const raw = isRecord(responseBody) ? responseBody["message"] : responseBody;
    return toMessage(raw);
  }
  return err instanceof Error ? err.message : DEFAULT_MESSAGE;
};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const parseJWT = (authorization: string | string[] | null | undefined) => {
  const token =
    typeof authorization === "string" ? authorization : authorization?.[0];
  if (!token) return null;
  try {
    const tokenStr = token.startsWith("Bearer ") ? token.slice(7) : token;
    const parts = tokenStr.split(".");
    if (parts.length < 2) return null;
    const payloadBase64 = parts[1].replaceAll("-", "+").replaceAll("_", "/");
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString("utf8"),
    ) as unknown;
    if (!isRecord(payload)) return null;
    const sub = payload["sub"];
    const username = payload["username"];
    if (typeof sub !== "number" || typeof username !== "string") return null;
    return {
      sub,
      username,
      roles: toStringArray(payload["roles"]),
      permissions: toStringArray(payload["permissions"]),
    } satisfies AuthTokenPayload;
  } catch {
    return null;
  }
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
  request: Request,
  statusCode: number,
  message: string,
  error?: Error,
) => ({
  method: request.method,
  path: request.originalUrl ?? request.url,
  ip: request.ip,
  body: sanitizeValue((request.body as unknown) ?? null),
  token: sanitizeToken(request.headers["authorization"] ?? null),
  tokenInfo: parseJWT(request.headers["authorization"] ?? null),
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
  timestamp: formatTimestamp(),
});
