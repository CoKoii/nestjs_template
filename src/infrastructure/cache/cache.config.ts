import type { CacheModuleOptions } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import type { Redis } from "ioredis";
import { ENV, parseNumber, parseString } from "../../config/env.config";
import { IoredisKeyvStore } from "./ioredis-keyv.store";

const DEFAULT_CACHE_TTL_MS = 60_000;
const DEFAULT_CACHE_NAMESPACE = "cache";

export const createCacheModuleOptions = (
  configService: ConfigService,
  redisClient: Redis,
): CacheModuleOptions => ({
  ttl: parseNumber(configService.get(ENV.CACHE_TTL_MS), DEFAULT_CACHE_TTL_MS),
  namespace: parseString(
    configService.get(ENV.CACHE_NAMESPACE),
    DEFAULT_CACHE_NAMESPACE,
  ),
  stores: new IoredisKeyvStore(
    redisClient,
    parseString(configService.get(ENV.REDIS_KEY_PREFIX)),
  ),
});
