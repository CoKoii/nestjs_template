import { ConfigService } from "@nestjs/config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "node:path";
import type { DataSourceOptions } from "typeorm";
import type { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { DEFAULT_NODE_ENV, EnvKey } from "./env.keys";
import { parseBoolean, parseNumber } from "./env.utils";

const runtimeExtension = __filename.endsWith(".ts") ? "ts" : "js";

const resolveRuntimeRoot = () =>
  runtimeExtension === "ts"
    ? join(process.cwd(), "src")
    : join(process.cwd(), "dist", "src");

const entities = [
  join(resolveRuntimeRoot(), "**", `*.entity.${runtimeExtension}`),
];

const migrations = [
  join(resolveRuntimeRoot(), "migrations", `*.${runtimeExtension}`),
];

const getString = (
  get: (key: string) => unknown,
  key: string,
  fallback = "",
) => {
  const value = get(key);
  return typeof value === "string" ? value : fallback;
};

const createDatabaseOptions = (
  get: (key: string) => unknown,
): MysqlConnectionOptions => ({
  type: getString(
    get,
    EnvKey.DB_TYPE,
    "mysql",
  ) as MysqlConnectionOptions["type"],
  host: getString(get, EnvKey.DB_HOST),
  port: parseNumber(get(EnvKey.DB_PORT), 3306),
  username: getString(get, EnvKey.DB_USERNAME),
  password: getString(get, EnvKey.DB_PASSWORD),
  database: getString(get, EnvKey.DB_DATABASE),
  entities,
  synchronize: parseBoolean(get(EnvKey.DB_SYNC)),
  logging: getString(get, EnvKey.NODE_ENV, DEFAULT_NODE_ENV) === "development",
});

export const createTypeOrmModuleOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  ...createDatabaseOptions((key) => configService.get(key)),
  autoLoadEntities: true,
});

export const createDataSourceOptions = (): DataSourceOptions => ({
  ...createDatabaseOptions((key) => process.env[key]),
  migrations,
  subscribers: [],
});
