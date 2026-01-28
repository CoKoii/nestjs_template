import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import winston from "winston";
import {
  utilities,
  WinstonModule,
  type WinstonModuleOptions,
} from "nest-winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Console } from "winston/lib/winston/transports";
import { LogEnum } from "../enum/config";
const createDailyTransport = (level: string, filename: string) =>
  new DailyRotateFile({
    level,
    dirname: "logs",
    filename,
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple(),
    ),
  });
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const consoleTransports = new Console({
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
            consoleTransports,
            ...(isLogOn
              ? [
                  createDailyTransport("info", "application-%DATE%.log"),
                  createDailyTransport("warn", "warn-%DATE%.log"),
                ]
              : []),
          ],
        } as WinstonModuleOptions;
      },
    }),
  ],
})
export class LogsModule {}
