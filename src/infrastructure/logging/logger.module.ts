import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WinstonModule } from "nest-winston";
import { createLoggerOptions } from "../../config/logger.config";

@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createLoggerOptions,
    }),
  ],
})
export class LoggerModule {}
