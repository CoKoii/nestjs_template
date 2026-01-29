import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as Joi from "joi";
import { DataSource, type DataSourceOptions } from "typeorm";
import { ConfigEnum } from "./src/enum/config";

const entitiesDir =
  process.env.NODE_ENV === "test"
    ? [__dirname + "/**/*.entity{.ts}"]
    : [__dirname + "/**/*.entity{.ts,.js}"];
const getEnv = (env: string) => {
  if (fs.existsSync(env)) {
    return dotenv.parse(fs.readFileSync(env));
  }
  return {};
};
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production")
    .default("development"),
  DB_TYPE: Joi.string().default("mysql"),
  DB_HOST: Joi.string().ip(),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNC: Joi.boolean().default(false),
});
const buildConnectionOptions = () => {
  const defaultConfig = getEnv(".env");
  const envConfig = getEnv(`.env.${process.env.NODE_ENV}`);
  const config = { ...defaultConfig, ...envConfig };
  return {
    type: config[ConfigEnum.DB_TYPE],
    host: config[ConfigEnum.DB_HOST],
    port: Number(config[ConfigEnum.DB_PORT]),
    username: config[ConfigEnum.DB_USERNAME],
    password: config[ConfigEnum.DB_PASSWORD],
    database: config[ConfigEnum.DB_DATABASE],
    entities: entitiesDir,
    synchronize: true,
    logging: process.env.NODE_ENV === "development",
  } as TypeOrmModuleOptions;
};
export const connectionParams = buildConnectionOptions();

export default new DataSource({
  ...connectionParams,
  migrations: ["src/migration/**"],
  subscribers: [],
} as DataSourceOptions);
