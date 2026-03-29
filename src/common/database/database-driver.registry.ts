import type { DatabaseType } from "../config/env";
import type { DatabaseDriver } from "./database.types";
import { createMysqlConnectionOptions } from "./drivers/mysql/config";
import { rethrowMySqlError } from "./drivers/mysql/errors";

const databaseDrivers = {
  mysql: {
    createConnectionOptions: createMysqlConnectionOptions,
    rethrowError: rethrowMySqlError,
  },
} satisfies Record<DatabaseType, DatabaseDriver>;

export const getDatabaseDriver = (type: DatabaseType): DatabaseDriver =>
  databaseDrivers[type];
