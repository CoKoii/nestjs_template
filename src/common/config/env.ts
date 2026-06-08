import type { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";
import type { ValidationResult } from "joi";
import * as Joi from "joi";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const DEVELOPMENT_NODE_ENV = "development";
export const SUPPORTED_NODE_ENVS = [
  DEVELOPMENT_NODE_ENV,
  "production",
  "test",
] as const;
export type NodeEnv = (typeof SUPPORTED_NODE_ENVS)[number];
export const SUPPORTED_DATABASE_TYPES = ["mysql", "postgres"] as const;
export type DatabaseType = (typeof SUPPORTED_DATABASE_TYPES)[number];

export type DatabaseEnvironment = {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
};

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
  REDIS_HOST: "REDIS_HOST",
  REDIS_PORT: "REDIS_PORT",
  REDIS_USERNAME: "REDIS_USERNAME",
  REDIS_PASSWORD: "REDIS_PASSWORD",
  REDIS_DB: "REDIS_DB",
  REDIS_KEY_PREFIX: "REDIS_KEY_PREFIX",
  MAIL_ENABLED: "MAIL_ENABLED",
  MAIL_HOST: "MAIL_HOST",
  MAIL_PORT: "MAIL_PORT",
  MAIL_SECURE: "MAIL_SECURE",
  MAIL_IGNORE_TLS: "MAIL_IGNORE_TLS",
  MAIL_USER: "MAIL_USER",
  MAIL_PASS: "MAIL_PASS",
  MAIL_FROM_NAME: "MAIL_FROM_NAME",
  MAIL_FROM_ADDRESS: "MAIL_FROM_ADDRESS",
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

const getRequiredString = (value: unknown, key: string): string => {
  if (typeof value === "string") {
    return value;
  }

  throw new Error(`${key} is required`);
};

const getRequiredBoolean = (value: unknown, key: string): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  throw new Error(`${key} must be a boolean`);
};

const getRequiredNumber = (value: unknown, key: string): number => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  throw new Error(`${key} must be a number`);
};

const getExplicitOptionalString = (
  value: unknown,
  key: string,
): string | undefined => {
  const parsed = getRequiredString(value, key);
  return parsed ? parsed : undefined;
};

const parseCommaSeparatedValue = (value: unknown, key: string): string[] =>
  getRequiredString(value, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const isNodeEnv = (value: unknown): value is NodeEnv =>
  typeof value === "string" && SUPPORTED_NODE_ENVS.includes(value as NodeEnv);

const getRequiredNodeEnv = (value: unknown, key: string): NodeEnv => {
  if (isNodeEnv(value)) {
    return value;
  }

  throw new Error(`${key} must be one of ${SUPPORTED_NODE_ENVS.join(", ")}`);
};

const resolveRuntimeNodeEnv = (nodeEnv = process.env.NODE_ENV): NodeEnv =>
  getRequiredNodeEnv(nodeEnv, ENV.NODE_ENV);

const resolveEnvFiles = (nodeEnv = resolveRuntimeNodeEnv()) => [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), `.env.${nodeEnv}`),
];

const isDatabaseType = (value: unknown): value is DatabaseType =>
  typeof value === "string" &&
  SUPPORTED_DATABASE_TYPES.includes(value as DatabaseType);

const getRequiredDatabaseType = (value: unknown, key: string): DatabaseType => {
  if (isDatabaseType(value)) {
    return value;
  }

  throw new Error(
    `${key} must be one of ${SUPPORTED_DATABASE_TYPES.join(", ")}`,
  );
};

const createAppEnvironment = (get: EnvironmentGetter) => ({
  nodeEnv: getRequiredNodeEnv(get(ENV.NODE_ENV), ENV.NODE_ENV),
  port: getRequiredNumber(get(ENV.PORT), ENV.PORT),
  corsOrigins: parseCommaSeparatedValue(
    get(ENV.CORS_ORIGINS),
    ENV.CORS_ORIGINS,
  ),
});

const createDatabaseEnvironment = (
  get: EnvironmentGetter,
): DatabaseEnvironment => {
  const type = getRequiredDatabaseType(get(ENV.DB_TYPE), ENV.DB_TYPE);

  return {
    type,
    host: getRequiredString(get(ENV.DB_HOST), ENV.DB_HOST),
    port: getRequiredNumber(get(ENV.DB_PORT), ENV.DB_PORT),
    username: getRequiredString(get(ENV.DB_USERNAME), ENV.DB_USERNAME),
    password: getRequiredString(get(ENV.DB_PASSWORD), ENV.DB_PASSWORD),
    database: getRequiredString(get(ENV.DB_DATABASE), ENV.DB_DATABASE),
    synchronize: getRequiredBoolean(get(ENV.DB_SYNC), ENV.DB_SYNC),
  };
};

const createRedisEnvironment = (get: EnvironmentGetter) => ({
  host: getRequiredString(get(ENV.REDIS_HOST), ENV.REDIS_HOST),
  port: getRequiredNumber(get(ENV.REDIS_PORT), ENV.REDIS_PORT),
  username: getExplicitOptionalString(
    get(ENV.REDIS_USERNAME),
    ENV.REDIS_USERNAME,
  ),
  password: getExplicitOptionalString(
    get(ENV.REDIS_PASSWORD),
    ENV.REDIS_PASSWORD,
  ),
  db: getRequiredNumber(get(ENV.REDIS_DB), ENV.REDIS_DB),
  keyPrefix: getExplicitOptionalString(
    get(ENV.REDIS_KEY_PREFIX),
    ENV.REDIS_KEY_PREFIX,
  ),
});

const createMailEnvironment = (get: EnvironmentGetter) => ({
  enabled: getRequiredBoolean(get(ENV.MAIL_ENABLED), ENV.MAIL_ENABLED),
  host: getExplicitOptionalString(get(ENV.MAIL_HOST), ENV.MAIL_HOST),
  port: getRequiredNumber(get(ENV.MAIL_PORT), ENV.MAIL_PORT),
  secure: getRequiredBoolean(get(ENV.MAIL_SECURE), ENV.MAIL_SECURE),
  ignoreTls: getRequiredBoolean(get(ENV.MAIL_IGNORE_TLS), ENV.MAIL_IGNORE_TLS),
  user: getExplicitOptionalString(get(ENV.MAIL_USER), ENV.MAIL_USER),
  pass: getExplicitOptionalString(get(ENV.MAIL_PASS), ENV.MAIL_PASS),
  fromName: getRequiredString(get(ENV.MAIL_FROM_NAME), ENV.MAIL_FROM_NAME),
  fromAddress: getExplicitOptionalString(
    get(ENV.MAIL_FROM_ADDRESS),
    ENV.MAIL_FROM_ADDRESS,
  ),
});

const createAuthEnvironment = (get: EnvironmentGetter) => ({
  accessTokenSecret: getRequiredString(
    get(ENV.JWT_ACCESS_SECRET),
    ENV.JWT_ACCESS_SECRET,
  ),
  accessTokenExpiresIn: getRequiredString(
    get(ENV.JWT_ACCESS_EXPIRES_IN),
    ENV.JWT_ACCESS_EXPIRES_IN,
  ),
  refreshTokenSecret: getRequiredString(
    get(ENV.JWT_REFRESH_SECRET),
    ENV.JWT_REFRESH_SECRET,
  ),
  refreshTokenExpiresIn: getRequiredString(
    get(ENV.JWT_REFRESH_EXPIRES_IN),
    ENV.JWT_REFRESH_EXPIRES_IN,
  ),
});

const createLoggingEnvironment = (get: EnvironmentGetter) => ({
  enabled: getRequiredBoolean(get(ENV.LOG_ON), ENV.LOG_ON),
  level: getRequiredString(get(ENV.LOG_LEVEL), ENV.LOG_LEVEL),
});

const withConfigService =
  (configService: Pick<ConfigService, "get">) =>
  (key: string): unknown =>
    configService.get(key);

let validatedProcessEnvironment: Record<string, unknown> | null = null;

export const resolveEnvFilePaths = (nodeEnv = resolveRuntimeNodeEnv()) =>
  [...resolveEnvFiles(nodeEnv)].reverse();

export const loadEnvironmentFiles = (nodeEnv = resolveRuntimeNodeEnv()) => {
  const [baseEnvPath, environmentEnvPath] = resolveEnvFiles(nodeEnv);

  Object.assign(process.env, {
    ...readEnvFile(baseEnvPath),
    ...readEnvFile(environmentEnvPath),
    ...readProcessEnvironment(),
  });
};

export const validationSchema = Joi.object({
  [ENV.NODE_ENV]: Joi.string()
    .valid(...SUPPORTED_NODE_ENVS)
    .required(),
  [ENV.PORT]: Joi.number().port().required(),
  [ENV.CORS_ORIGINS]: Joi.string().allow("").required(),
  [ENV.DB_TYPE]: Joi.string()
    .valid(...SUPPORTED_DATABASE_TYPES)
    .required(),
  [ENV.LOG_ON]: Joi.boolean().truthy("true").falsy("false").required(),
  [ENV.LOG_LEVEL]: Joi.string()
    .valid("error", "warn", "info", "http", "verbose", "debug", "silly")
    .required(),
  [ENV.DB_HOST]: Joi.string().required(),
  [ENV.DB_PORT]: Joi.number().port().required(),
  [ENV.DB_USERNAME]: Joi.string().required(),
  [ENV.DB_PASSWORD]: Joi.string().allow("").required(),
  [ENV.DB_DATABASE]: Joi.string().required(),
  [ENV.DB_SYNC]: Joi.when(ENV.NODE_ENV, {
    is: "production",
    then: Joi.boolean()
      .truthy("true")
      .falsy("false")
      .valid(false)
      .required()
      .messages({ "any.only": "生产环境禁止开启 DB_SYNC=true" }),
    otherwise: Joi.boolean().truthy("true").falsy("false").required(),
  }),
  [ENV.REDIS_HOST]: Joi.string().required(),
  [ENV.REDIS_PORT]: Joi.number().port().required(),
  [ENV.REDIS_USERNAME]: Joi.string().allow("").required(),
  [ENV.REDIS_PASSWORD]: Joi.string().allow("").required(),
  [ENV.REDIS_DB]: Joi.number().integer().min(0).required(),
  [ENV.REDIS_KEY_PREFIX]: Joi.string().allow("").required(),
  [ENV.MAIL_ENABLED]: Joi.boolean().truthy("true").falsy("false").required(),
  [ENV.MAIL_HOST]: Joi.when(ENV.MAIL_ENABLED, {
    is: true,
    then: Joi.string().trim().required(),
    otherwise: Joi.string().allow("").required(),
  }),
  [ENV.MAIL_PORT]: Joi.number().port().required(),
  [ENV.MAIL_SECURE]: Joi.boolean().truthy("true").falsy("false").required(),
  [ENV.MAIL_IGNORE_TLS]: Joi.boolean().truthy("true").falsy("false").required(),
  [ENV.MAIL_USER]: Joi.string().allow("").required(),
  [ENV.MAIL_PASS]: Joi.string().allow("").required(),
  [ENV.MAIL_FROM_NAME]: Joi.string().trim().required(),
  [ENV.MAIL_FROM_ADDRESS]: Joi.when(ENV.MAIL_ENABLED, {
    is: true,
    then: Joi.string()
      .trim()
      .email({ tlds: { allow: false } })
      .required(),
    otherwise: Joi.string().allow("").required(),
  }),
  [ENV.JWT_ACCESS_SECRET]: Joi.string().required(),
  [ENV.JWT_ACCESS_EXPIRES_IN]: Joi.string().trim().required(),
  [ENV.JWT_REFRESH_SECRET]: Joi.string().required(),
  [ENV.JWT_REFRESH_EXPIRES_IN]: Joi.string().trim().required(),
});

export const validateEnvironment = (
  environment: Record<string, unknown>,
): Record<string, unknown> => {
  const result: ValidationResult<Record<string, unknown>> =
    validationSchema.validate(environment, {
      abortEarly: false,
      allowUnknown: true,
    });

  if (result.error) {
    throw result.error;
  }

  return result.value;
};

const withProcessEnvironment = (key: string): unknown => {
  validatedProcessEnvironment ??= validateEnvironment(readProcessEnvironment());
  return validatedProcessEnvironment[key];
};

export const getAppEnvironment = (configService: Pick<ConfigService, "get">) =>
  createAppEnvironment(withConfigService(configService));

export const getAppEnvironmentFromProcess = () =>
  createAppEnvironment(withProcessEnvironment);

export const getDatabaseEnvironment = (
  configService: Pick<ConfigService, "get">,
) => createDatabaseEnvironment(withConfigService(configService));

export const getDatabaseEnvironmentFromProcess = () =>
  createDatabaseEnvironment(withProcessEnvironment);

export const getRedisEnvironment = (
  configService: Pick<ConfigService, "get">,
) => createRedisEnvironment(withConfigService(configService));

export const getMailEnvironment = (configService: Pick<ConfigService, "get">) =>
  createMailEnvironment(withConfigService(configService));

export const getAuthEnvironment = (configService: Pick<ConfigService, "get">) =>
  createAuthEnvironment(withConfigService(configService));

export const getLoggingEnvironment = (
  configService: Pick<ConfigService, "get">,
) => createLoggingEnvironment(withConfigService(configService));
