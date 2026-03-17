import { Injectable } from "@nestjs/common";
import type { Redis } from "ioredis";
import { InjectRedis } from "./redis.decorator";

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly client: Redis) {}

  getClient(): Redis {
    return this.client;
  }
}
