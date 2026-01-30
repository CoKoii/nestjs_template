import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  utilities,
  WinstonModule,
  type WinstonModuleOptions,
} from "nest-winston";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Console } from "winston/lib/winston/transports";
import { LogEnum } from "../../enum/config";

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.prettyPrint(),
);
const createDailyTransport = (level: string) =>
  new DailyRotateFile({
    level,
    dirname: `logs/${level}`,
    filename: "%DATE%.log",
    datePattern: "YYYY/MM/DD/HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: fileFormat,
  });
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): WinstonModuleOptions => {
        const consoleTransport = new Console({
          level: "info",
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike(),
          ),
        });
        const isLogOn =
          configService.get<string>(LogEnum.LOG_ON)?.toLowerCase() === "true";
        return {
          transports: [
            consoleTransport,
            ...(isLogOn
              ? [createDailyTransport("info"), createDailyTransport("warn")]
              : []),
          ],
        };
      },
    }),
  ],
})
export class LoggerModule {}
