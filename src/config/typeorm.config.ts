import { ConfigService } from "@nestjs/config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "node:path";
import type { DataSourceOptions } from "typeorm";
import type { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { DEFAULT_NODE_ENV, ENV, parseBoolean, parseNumber } from "./env.config";

const isTypeScriptRuntime = __filename.endsWith(".ts");
const runtimeExtension = isTypeScriptRuntime ? "ts" : "js";
const runtimeRoot = isTypeScriptRuntime
  ? join(process.cwd(), "src")
  : join(process.cwd(), "dist", "src");
const entities = [join(runtimeRoot, "**", `*.entity.${runtimeExtension}`)];
const migrations = [join(runtimeRoot, "migrations", `*.${runtimeExtension}`)];

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
  type: getString(get, ENV.DB_TYPE, "mysql") as MysqlConnectionOptions["type"],
  host: getString(get, ENV.DB_HOST),
  port: parseNumber(get(ENV.DB_PORT), 3306),
  username: getString(get, ENV.DB_USERNAME),
  password: getString(get, ENV.DB_PASSWORD),
  database: getString(get, ENV.DB_DATABASE),
  entities,
  synchronize: parseBoolean(get(ENV.DB_SYNC)),
  logging: getString(get, ENV.NODE_ENV, DEFAULT_NODE_ENV) === "development",
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
