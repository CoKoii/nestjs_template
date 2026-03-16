import * as dotenv from "dotenv";
import * as Joi from "joi";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const DEFAULT_NODE_ENV = "development";

export const ENV = {
  NODE_ENV: "NODE_ENV",
  PORT: "PORT",
  CORS_ORIGINS: "CORS_ORIGINS",
  DB_TYPE: "DB_TYPE",
  DB_HOST: "DB_HOST",
  DB_PORT: "DB_PORT",
  DB_USERNAME: "DB_USERNAME",
  DB_PASSWORD: "DB_PASSWORD",
  DB_DATABASE: "DB_DATABASE",
  DB_SYNC: "DB_SYNC",
  JWT_SECRET: "JWT_SECRET",
  LOG_ON: "LOG_ON",
  LOG_LEVEL: "LOG_LEVEL",
} as const;

const readEnvFile = (filePath: string): Record<string, string> =>
  existsSync(filePath) ? dotenv.parse(readFileSync(filePath)) : {};

const readProcessEnvironment = (): Record<string, string> =>
  Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );

const resolveEnvFiles = (
  nodeEnv = process.env.NODE_ENV ?? DEFAULT_NODE_ENV,
) => [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), `.env.${nodeEnv}`),
];

export const resolveEnvFilePaths = (
  nodeEnv = process.env.NODE_ENV ?? DEFAULT_NODE_ENV,
) => [...resolveEnvFiles(nodeEnv)].reverse();

export const loadEnvironmentFiles = (
  nodeEnv = process.env.NODE_ENV ?? DEFAULT_NODE_ENV,
) => {
  const [baseEnvPath, environmentEnvPath] = resolveEnvFiles(nodeEnv);

  Object.assign(process.env, {
    ...readEnvFile(baseEnvPath),
    ...readEnvFile(environmentEnvPath),
    ...readProcessEnvironment(),
  });
};

export const validationSchema = Joi.object({
  [ENV.NODE_ENV]: Joi.string()
    .valid("development", "production", "test")
    .default(DEFAULT_NODE_ENV),
  [ENV.PORT]: Joi.number().port().default(3000),
  [ENV.CORS_ORIGINS]: Joi.string().allow("").optional(),
  [ENV.LOG_ON]: Joi.boolean().truthy("true").falsy("false").default(false),
  [ENV.LOG_LEVEL]: Joi.string()
    .valid("error", "warn", "info", "http", "verbose", "debug", "silly")
    .default("info"),
  [ENV.DB_TYPE]: Joi.string().valid("mysql").default("mysql"),
  [ENV.DB_HOST]: Joi.string().required(),
  [ENV.DB_PORT]: Joi.number().port().default(3306),
  [ENV.DB_USERNAME]: Joi.string().required(),
  [ENV.DB_PASSWORD]: Joi.string().required(),
  [ENV.DB_DATABASE]: Joi.string().required(),
  [ENV.DB_SYNC]: Joi.boolean().truthy("true").falsy("false").default(false),
  [ENV.JWT_SECRET]: Joi.string().required(),
});

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
