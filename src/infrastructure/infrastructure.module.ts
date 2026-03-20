import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationCacheModule } from "./cache/cache.module";
import { createMySqlTypeOrmModuleOptions } from "./persistence/mysql/mysql.config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createMySqlTypeOrmModuleOptions,
    }),
    ApplicationCacheModule,
  ],
})
export class InfrastructureModule {}
