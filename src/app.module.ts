import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { resolveEnvFilePaths } from "./config/env.utils";
import { validationSchema } from "./config/env.validation";
import { createTypeOrmModuleOptions } from "./config/typeorm.config";
import { CoreModule } from "./core/core.module";
import { UserSystemModule } from "./modules/user-system/user-system.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: resolveEnvFilePaths(),
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createTypeOrmModuleOptions,
    }),
    CoreModule,
    UserSystemModule,
  ],
})
export class AppModule {}
