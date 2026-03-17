import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RedisModule } from "./cache/redis/redis.module";
import { createMySqlTypeOrmModuleOptions } from "./persistence/mysql/mysql.config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createMySqlTypeOrmModuleOptions,
    }),
    RedisModule,
  ],
})
export class InfrastructureModule {}
