import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { resolveEnvFilePaths, validationSchema } from "./config/env.config";
import { CoreModule } from "./core/core.module";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { UserSystemModule } from "./modules/user-system/user-system.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: resolveEnvFilePaths(),
      validationSchema,
    }),
    ScheduleModule.forRoot(),
    InfrastructureModule,
    CoreModule,
    UserSystemModule,
  ],
})
export class AppModule {}
