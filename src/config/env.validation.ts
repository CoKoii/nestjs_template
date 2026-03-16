import * as Joi from "joi";
import { DEFAULT_NODE_ENV, EnvKey, LogKey } from "./env.keys";

export const validationSchema = Joi.object({
  [EnvKey.NODE_ENV]: Joi.string()
    .valid("development", "production", "test")
    .default(DEFAULT_NODE_ENV),
  [EnvKey.PORT]: Joi.number().port().default(3000),
  [EnvKey.CORS_ORIGINS]: Joi.string().allow("").optional(),
  [LogKey.LOG_ON]: Joi.boolean().truthy("true").falsy("false").default(false),
  [LogKey.LOG_LEVEL]: Joi.string()
    .valid("error", "warn", "info", "http", "verbose", "debug", "silly")
    .default("info"),
  [EnvKey.DB_TYPE]: Joi.string().valid("mysql").default("mysql"),
  [EnvKey.DB_HOST]: Joi.string().required(),
  [EnvKey.DB_PORT]: Joi.number().port().default(3306),
  [EnvKey.DB_USERNAME]: Joi.string().required(),
  [EnvKey.DB_PASSWORD]: Joi.string().required(),
  [EnvKey.DB_DATABASE]: Joi.string().required(),
  [EnvKey.DB_SYNC]: Joi.boolean().truthy("true").falsy("false").default(false),
  [EnvKey.JWT_SECRET]: Joi.string().required(),
});
