import { DataSource } from "typeorm";
import { loadEnvironmentFiles } from "./src/config/env.config";
import { createDataSourceOptions } from "./src/config/typeorm.config";

loadEnvironmentFiles();

export default new DataSource(createDataSourceOptions());
