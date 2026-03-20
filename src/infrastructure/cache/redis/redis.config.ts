import { ConfigService } from "@nestjs/config";
import type { RedisOptions } from "ioredis";
import {
  ENV,
  parseNumber,
  parseOptionalString,
  parseString,
} from "../../../config/env.config";

const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_REDIS_DB = 0;
const DEFAULT_REDIS_CONNECT_TIMEOUT = 10_000;
const MAX_RETRY_DELAY = 2_000;

export const createRedisOptions = (
  configService: ConfigService,
): RedisOptions => {
  const get = (key: string): unknown => configService.get<unknown>(key);

  return {
    host: parseString(get(ENV.REDIS_HOST)),
    port: parseNumber(get(ENV.REDIS_PORT), DEFAULT_REDIS_PORT),
    username: parseOptionalString(get(ENV.REDIS_USERNAME)),
    password: parseOptionalString(get(ENV.REDIS_PASSWORD)),
    db: parseNumber(get(ENV.REDIS_DB), DEFAULT_REDIS_DB),
    keyPrefix: parseOptionalString(get(ENV.REDIS_KEY_PREFIX)),
    connectTimeout: DEFAULT_REDIS_CONNECT_TIMEOUT,
    keepAlive: DEFAULT_REDIS_CONNECT_TIMEOUT,
    lazyConnect: true,
    enableReadyCheck: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => Math.min(times * 200, MAX_RETRY_DELAY),
  };
};
