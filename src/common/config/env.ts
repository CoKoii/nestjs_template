import type { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";
import * as Joi from "joi";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const DEFAULT_NODE_ENV = "development";
export const DEFAULT_PORT = 3000;
export const DEFAULT_CACHE_TTL_MS = 60_000;
export const DEFAULT_CACHE_NAMESPACE = "cache";
export const DEFAULT_DB_PORT = 3306;
export const DEFAULT_REDIS_PORT = 6379;
export const DEFAULT_REDIS_DB = 0;

export const ENV = {
  NODE_ENV: "NODE_ENV",
  PORT: "PORT",
  CORS_ORIGINS: "CORS_ORIGINS",
  CACHE_TTL_MS: "CACHE_TTL_MS",
  CACHE_NAMESPACE: "CACHE_NAMESPACE",
  DB_HOST: "DB_HOST",
  DB_PORT: "DB_PORT",
  DB_USERNAME: "DB_USERNAME",
  DB_PASSWORD: "DB_PASSWORD",
  DB_DATABASE: "DB_DATABASE",
  DB_SYNC: "DB_SYNC",
  REDIS_HOST: "REDIS_HOST",
  REDIS_PORT: "REDIS_PORT",
  REDIS_USERNAME: "REDIS_USERNAME",
  REDIS_PASSWORD: "REDIS_PASSWORD",
  REDIS_DB: "REDIS_DB",
  REDIS_KEY_PREFIX: "REDIS_KEY_PREFIX",
  JWT_ACCESS_SECRET: "JWT_ACCESS_SECRET",
  JWT_ACCESS_EXPIRES_IN: "JWT_ACCESS_EXPIRES_IN",
  JWT_REFRESH_SECRET: "JWT_REFRESH_SECRET",
  JWT_REFRESH_EXPIRES_IN: "JWT_REFRESH_EXPIRES_IN",
  LOG_ON: "LOG_ON",
  LOG_LEVEL: "LOG_LEVEL",
} as const;

type EnvironmentGetter = (key: string) => unknown;

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

const parseBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return fallback;
};

const parseNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const parseOptionalString = (value: unknown): string | undefined => {
  const parsed = parseString(value);
  return parsed ? parsed : undefined;
};

const parseCommaSeparatedValue = (value: unknown): string[] =>
  typeof value === "string"
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const createAppEnvironment = (get: EnvironmentGetter) => ({
  nodeEnv: parseString(get(ENV.NODE_ENV), DEFAULT_NODE_ENV),
  port: parseNumber(get(ENV.PORT), DEFAULT_PORT),
  corsOrigins: parseCommaSeparatedValue(get(ENV.CORS_ORIGINS)),
});

const createCacheEnvironment = (get: EnvironmentGetter) => ({
  ttl: parseNumber(get(ENV.CACHE_TTL_MS), DEFAULT_CACHE_TTL_MS),
  namespace: parseString(get(ENV.CACHE_NAMESPACE), DEFAULT_CACHE_NAMESPACE),
});

const createDatabaseEnvironment = (get: EnvironmentGetter) => ({
  host: parseString(get(ENV.DB_HOST)),
  port: parseNumber(get(ENV.DB_PORT), DEFAULT_DB_PORT),
  username: parseString(get(ENV.DB_USERNAME)),
  password: parseString(get(ENV.DB_PASSWORD)),
  database: parseString(get(ENV.DB_DATABASE)),
  synchronize: parseBoolean(get(ENV.DB_SYNC)),
});

const createRedisEnvironment = (get: EnvironmentGetter) => ({
  host: parseString(get(ENV.REDIS_HOST)),
  port: parseNumber(get(ENV.REDIS_PORT), DEFAULT_REDIS_PORT),
  username: parseOptionalString(get(ENV.REDIS_USERNAME)),
  password: parseOptionalString(get(ENV.REDIS_PASSWORD)),
  db: parseNumber(get(ENV.REDIS_DB), DEFAULT_REDIS_DB),
  keyPrefix: parseOptionalString(get(ENV.REDIS_KEY_PREFIX)),
});

const createAuthEnvironment = (get: EnvironmentGetter) => ({
  accessTokenSecret: parseString(get(ENV.JWT_ACCESS_SECRET)),
  accessTokenExpiresIn: parseString(get(ENV.JWT_ACCESS_EXPIRES_IN)),
  refreshTokenSecret: parseString(get(ENV.JWT_REFRESH_SECRET)),
  refreshTokenExpiresIn: parseString(get(ENV.JWT_REFRESH_EXPIRES_IN)),
});

const createLoggingEnvironment = (get: EnvironmentGetter) => ({
  enabled: parseBoolean(get(ENV.LOG_ON)),
  level: parseString(get(ENV.LOG_LEVEL), "info"),
});

const withConfigService =
  (configService: Pick<ConfigService, "get">) =>
  (key: string): unknown =>
    configService.get(key);

const withProcessEnvironment = (key: string): unknown => process.env[key];

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
  [ENV.PORT]: Joi.number().port().default(DEFAULT_PORT),
  [ENV.CORS_ORIGINS]: Joi.string().allow("").optional(),
  [ENV.CACHE_TTL_MS]: Joi.number()
    .integer()
    .min(0)
    .default(DEFAULT_CACHE_TTL_MS),
  [ENV.CACHE_NAMESPACE]: Joi.string().trim().default(DEFAULT_CACHE_NAMESPACE),
  [ENV.LOG_ON]: Joi.boolean().truthy("true").falsy("false").default(false),
  [ENV.LOG_LEVEL]: Joi.string()
    .valid("error", "warn", "info", "http", "verbose", "debug", "silly")
    .default("info"),
  [ENV.DB_HOST]: Joi.string().required(),
  [ENV.DB_PORT]: Joi.number().port().default(DEFAULT_DB_PORT),
  [ENV.DB_USERNAME]: Joi.string().required(),
  [ENV.DB_PASSWORD]: Joi.string().required(),
  [ENV.DB_DATABASE]: Joi.string().required(),
  [ENV.DB_SYNC]: Joi.boolean().truthy("true").falsy("false").default(false),
  [ENV.REDIS_HOST]: Joi.string().required(),
  [ENV.REDIS_PORT]: Joi.number().port().default(DEFAULT_REDIS_PORT),
  [ENV.REDIS_USERNAME]: Joi.string().allow("").optional(),
  [ENV.REDIS_PASSWORD]: Joi.string().allow("").optional(),
  [ENV.REDIS_DB]: Joi.number().integer().min(0).default(DEFAULT_REDIS_DB),
  [ENV.REDIS_KEY_PREFIX]: Joi.string().allow("").optional(),
  [ENV.JWT_ACCESS_SECRET]: Joi.string().required(),
  [ENV.JWT_ACCESS_EXPIRES_IN]: Joi.string().trim().required(),
  [ENV.JWT_REFRESH_SECRET]: Joi.string().required(),
  [ENV.JWT_REFRESH_EXPIRES_IN]: Joi.string().trim().required(),
});

export const getAppEnvironment = (configService: Pick<ConfigService, "get">) =>
  createAppEnvironment(withConfigService(configService));

export const getAppEnvironmentFromProcess = () =>
  createAppEnvironment(withProcessEnvironment);

export const getCacheEnvironment = (
  configService: Pick<ConfigService, "get">,
) => createCacheEnvironment(withConfigService(configService));

export const getDatabaseEnvironment = (
  configService: Pick<ConfigService, "get">,
) => createDatabaseEnvironment(withConfigService(configService));

export const getDatabaseEnvironmentFromProcess = () =>
  createDatabaseEnvironment(withProcessEnvironment);

export const getRedisEnvironment = (
  configService: Pick<ConfigService, "get">,
) => createRedisEnvironment(withConfigService(configService));

export const getAuthEnvironment = (configService: Pick<ConfigService, "get">) =>
  createAuthEnvironment(withConfigService(configService));

export const getLoggingEnvironment = (
  configService: Pick<ConfigService, "get">,
) => createLoggingEnvironment(withConfigService(configService));
