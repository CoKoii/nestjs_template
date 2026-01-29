import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as dotenv from "dotenv";

import { connectionParams, validationSchema } from "../ormconfig";
import { LoggerModule } from "./common/logger/logger.module";
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
  providers: [Logger],
  exports: [Logger],
})
export class AppModule {}
