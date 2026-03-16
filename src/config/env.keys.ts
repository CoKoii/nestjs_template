export const DEFAULT_NODE_ENV = "development";

export enum EnvKey {
  NODE_ENV = "NODE_ENV",
  PORT = "PORT",
  CORS_ORIGINS = "CORS_ORIGINS",
  DB_TYPE = "DB_TYPE",
  DB_HOST = "DB_HOST",
  DB_PORT = "DB_PORT",
  DB_USERNAME = "DB_USERNAME",
  DB_PASSWORD = "DB_PASSWORD",
  DB_DATABASE = "DB_DATABASE",
  DB_SYNC = "DB_SYNC",
  JWT_SECRET = "JWT_SECRET",
}

export enum LogKey {
  LOG_ON = "LOG_ON",
  LOG_LEVEL = "LOG_LEVEL",
}
