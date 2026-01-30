import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as dotenv from "dotenv";

import { connectionParams, validationSchema } from "../ormconfig";
import { LoggerModule } from "./common/logger/logger.module";
import { JwtAuthGuard } from "./common/auth/jwt-auth.guard";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
const envFilePath = `.env.${process.env.NODE_ENV || "development"}`;
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      load: [() => dotenv.config({ path: ".env" })],
      validationSchema,
    }),
    TypeOrmModule.forRoot(connectionParams),
    LoggerModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [Logger, { provide: APP_GUARD, useClass: JwtAuthGuard }],
  exports: [Logger],
})
export class AppModule {}
