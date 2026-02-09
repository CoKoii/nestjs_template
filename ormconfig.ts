import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as Joi from "joi";
import { DataSource, type DataSourceOptions } from "typeorm";
import { ConfigEnum } from "./src/common/constants/config.enum";

const entitiesDir = [
  __dirname +
    (process.env.NODE_ENV === "test"
      ? "/**/*.entity{.ts}"
      : "/**/*.entity{.ts,.js}"),
];
const getEnv = (path: string) =>
  fs.existsSync(path) ? dotenv.parse(fs.readFileSync(path)) : {};
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
  JWT_SECRET: Joi.string().required(),
});
const buildConnectionOptions = (): TypeOrmModuleOptions => {
  const config = {
    ...getEnv(".env"),
    ...getEnv(`.env.${process.env.NODE_ENV}`),
  };
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
