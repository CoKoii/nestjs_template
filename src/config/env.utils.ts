import * as dotenv from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_NODE_ENV } from "./env.keys";

const readEnvFile = (filePath: string): Record<string, string> =>
  existsSync(filePath) ? dotenv.parse(readFileSync(filePath)) : {};

const readProcessEnvironment = (): Record<string, string> =>
  Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );

const resolveMergeOrderEnvFiles = (
  nodeEnv = process.env.NODE_ENV ?? DEFAULT_NODE_ENV,
) => [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), `.env.${nodeEnv}`),
];

export const resolveEnvFilePaths = (
  nodeEnv = process.env.NODE_ENV ?? DEFAULT_NODE_ENV,
) => [...resolveMergeOrderEnvFiles(nodeEnv)].reverse();

export const loadEnvironmentFiles = (
  nodeEnv = process.env.NODE_ENV ?? DEFAULT_NODE_ENV,
) => {
  const [baseEnvPath, environmentEnvPath] = resolveMergeOrderEnvFiles(nodeEnv);
  Object.assign(process.env, {
    ...readEnvFile(baseEnvPath),
    ...readEnvFile(environmentEnvPath),
    ...readProcessEnvironment(),
  });
};

export const parseBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return fallback;
};

export const parseNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const parseCommaSeparatedValue = (value: unknown): string[] =>
  typeof value === "string"
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
