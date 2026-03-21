import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCacheModuleOptions } from "./cache.config";
import { RedisModule } from "./redis.module";
import { REDIS } from "./redis.token";

@Global()
@Module({
  imports: [
    RedisModule,
    NestCacheModule.registerAsync({
      inject: [ConfigService, REDIS],
      useFactory: createCacheModuleOptions,
    }),
  ],
  exports: [NestCacheModule],
})
export class AppCacheModule {}
