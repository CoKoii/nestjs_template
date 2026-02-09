import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import { connectionParams, validationSchema } from "../ormconfig";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { LoggerModule } from "./common/logger/logger.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { ProfilesModule } from "./modules/profiles/profiles.module";
import { RolesModule } from "./modules/roles/roles.module";
import { UsersModule } from "./modules/users/users.module";

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
    UsersModule,
    AuthModule,
    ProfilesModule,
    RolesModule,
    PermissionsModule,
  ],
  providers: [
    Logger,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [Logger],
})
export class AppModule {}
