import { DataSource } from "typeorm";
import { loadEnvironmentFiles } from "./src/config/env.config";
import { createMySqlDataSourceOptions } from "./src/infrastructure/persistence/mysql/mysql.config";

loadEnvironmentFiles();

export default new DataSource(createMySqlDataSourceOptions());
