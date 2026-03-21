import { ConfigService } from "@nestjs/config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "node:path";
import type { DataSourceOptions } from "typeorm";
import type { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import {
  DEFAULT_NODE_ENV,
  getAppEnvironment,
  getAppEnvironmentFromProcess,
  getDatabaseEnvironment,
  getDatabaseEnvironmentFromProcess,
} from "../config/env";

const isTypeScriptRuntime = __filename.endsWith(".ts");
const runtimeExtension = isTypeScriptRuntime ? "ts" : "js";
const runtimeRoot = isTypeScriptRuntime
  ? join(process.cwd(), "src")
  : join(process.cwd(), "dist");
const entities = [join(runtimeRoot, "**", `*.entity.${runtimeExtension}`)];
const migrations = [join(runtimeRoot, "migrations", `*.${runtimeExtension}`)];

const createDatabaseOptions = (
  databaseEnvironment: ReturnType<typeof getDatabaseEnvironment>,
  nodeEnv: string,
): MysqlConnectionOptions => ({
  type: "mysql",
  host: databaseEnvironment.host,
  port: databaseEnvironment.port,
  username: databaseEnvironment.username,
  password: databaseEnvironment.password,
  database: databaseEnvironment.database,
  entities,
  synchronize: databaseEnvironment.synchronize,
  logging: nodeEnv === DEFAULT_NODE_ENV,
});

export const createTypeOrmOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  ...createDatabaseOptions(
    getDatabaseEnvironment(configService),
    getAppEnvironment(configService).nodeEnv,
  ),
  autoLoadEntities: true,
});

export const createDataSourceOptions = (): DataSourceOptions => ({
  ...createDatabaseOptions(
    getDatabaseEnvironmentFromProcess(),
    getAppEnvironmentFromProcess().nodeEnv,
  ),
  migrations,
  subscribers: [],
});
