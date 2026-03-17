import {
  Global,
  Inject,
  Logger,
  Module,
  OnApplicationShutdown,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import type { Redis as RedisClient } from "ioredis";
import { REDIS_CLIENT } from "./redis.constants";
import { createRedisOptions } from "./redis.config";
import { RedisService } from "./redis.service";

const redisLogger = new Logger("RedisModule");

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisClient> => {
        const client = new Redis(createRedisOptions(configService));

        client.on("ready", () => {
          redisLogger.log("Redis connection established");
        });
        client.on("reconnecting", () => {
          redisLogger.warn("Redis reconnecting");
        });
        client.on("error", (error) => {
          redisLogger.error(error.message, error.stack);
        });

        try {
          await client.connect();
          await client.ping();
        } catch (error) {
          client.disconnect();
          throw error;
        }

        return client;
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}

  async onApplicationShutdown() {
    if (this.redisClient.status === "end") {
      return;
    }

    try {
      await this.redisClient.quit();
    } catch {
      this.redisClient.disconnect();
    }
  }
}
