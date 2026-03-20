import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCacheModuleOptions } from "./cache.config";
import { REDIS_CLIENT } from "./redis/redis.constants";
import { RedisModule } from "./redis/redis.module";

@Global()
@Module({
  imports: [
    RedisModule,
    NestCacheModule.registerAsync({
      inject: [ConfigService, REDIS_CLIENT],
      useFactory: createCacheModuleOptions,
    }),
  ],
  exports: [NestCacheModule],
})
export class ApplicationCacheModule {}
