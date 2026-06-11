import {
  ENV,
  SUPPORTED_DATABASE_TYPES,
  SUPPORTED_NODE_ENVS,
  type DatabaseType,
  type NodeEnv,
} from "./keys";

export type EnvironmentGetter = (key: string) => unknown;

export const getRequiredString = (value: unknown, key: string): string => {
  if (typeof value === "string") {
    return value;
  }

  throw new Error(`${key} is required`);
};

export const getRequiredBoolean = (value: unknown, key: string): boolean => {
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

export const getRequiredNumber = (value: unknown, key: string): number => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  throw new Error(`${key} must be a number`);
};

export const getExplicitOptionalString = (
  value: unknown,
  key: string,
): string | undefined => {
  const parsed = getRequiredString(value, key);
  return parsed ? parsed : undefined;
};

export const parseCommaSeparatedValue = (
  value: unknown,
  key: string,
): string[] =>
  getRequiredString(value, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const isNodeEnv = (value: unknown): value is NodeEnv =>
  typeof value === "string" && SUPPORTED_NODE_ENVS.includes(value as NodeEnv);

export const getRequiredNodeEnv = (
  value: unknown,
  key = ENV.NODE_ENV,
): NodeEnv => {
  if (isNodeEnv(value)) {
    return value;
  }

  throw new Error(`${key} must be one of ${SUPPORTED_NODE_ENVS.join(", ")}`);
};

const isDatabaseType = (value: unknown): value is DatabaseType =>
  typeof value === "string" &&
  SUPPORTED_DATABASE_TYPES.includes(value as DatabaseType);

export const getRequiredDatabaseType = (
  value: unknown,
  key: string,
): DatabaseType => {
  if (isDatabaseType(value)) {
    return value;
  }

  throw new Error(
    `${key} must be one of ${SUPPORTED_DATABASE_TYPES.join(", ")}`,
  );
};
