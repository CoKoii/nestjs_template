import { ConfigService } from "@nestjs/config";
import { utilities, type WinstonModuleOptions } from "nest-winston";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Console } from "winston/lib/winston/transports";
import { ENV, parseBoolean } from "../../config/env.config";

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.prettyPrint(),
);

const createDailyTransport = (filename: string, level: string) =>
  new DailyRotateFile({
    dirname: "logs",
    filename,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "7d",
    level,
    format: fileFormat,
  });

export const createWinstonLoggerOptions = (
  configService: ConfigService,
): WinstonModuleOptions => {
  const level = configService.get<string>(ENV.LOG_LEVEL) ?? "info";
  const logEnabled = parseBoolean(configService.get(ENV.LOG_ON));

  return {
    level,
    transports: [
      new Console({
        level,
        format: winston.format.combine(
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          utilities.format.nestLike(),
        ),
      }),
      ...(logEnabled
        ? [
            createDailyTransport("application-%DATE%.log", level),
            createDailyTransport("warning-%DATE%.log", "warn"),
          ]
        : []),
    ],
  };
};
