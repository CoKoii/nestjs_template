import type { CacheModuleOptions } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import type { Redis } from "ioredis";
import { getCacheEnvironment, getRedisEnvironment } from "../config/env";
import { KeyvRedisStore } from "./keyv-redis.store";

export const createCacheModuleOptions = (
  configService: ConfigService,
  redisClient: Redis,
): CacheModuleOptions => {
  const cacheEnvironment = getCacheEnvironment(configService);
  const redisEnvironment = getRedisEnvironment(configService);

  return {
    ttl: cacheEnvironment.ttl,
    namespace: cacheEnvironment.namespace,
    stores: new KeyvRedisStore(redisClient, redisEnvironment.keyPrefix ?? ""),
  };
};
