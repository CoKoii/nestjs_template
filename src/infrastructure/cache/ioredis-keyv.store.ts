import type { Redis } from "ioredis";
import type { KeyvStoreAdapter, StoredData } from "keyv";

const SCAN_COUNT = 100;

type CacheEntry = {
  key: string;
  value: string;
  ttl?: number;
};

export class IoredisKeyvStore implements KeyvStoreAdapter {
  opts = {};
  namespace?: string;

  constructor(
    private readonly redisClient: Redis,
    private readonly redisKeyPrefix = "",
  ) {}

  on(event: string, listener: (...arguments_: any[]) => void): this {
    void event;
    void listener;
    return this;
  }

  async get<Value>(key: string): Promise<StoredData<Value> | undefined> {
    const value = await this.redisClient.get(key);
    return value === null ? undefined : (value as StoredData<Value>);
  }

  async getMany<Value>(
    keys: string[],
  ): Promise<Array<StoredData<Value | undefined>>> {
    if (keys.length === 0) {
      return [];
    }

    const values = await this.redisClient.mget(keys);

    return values.map((value) =>
      value === null ? undefined : (value as StoredData<Value | undefined>),
    );
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (ttl === undefined) {
      await this.redisClient.set(key, value);
      return true;
    }

    await this.redisClient.set(key, value, "PX", ttl);
    return true;
  }

  async setMany(entries: CacheEntry[]): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    const pipeline = this.redisClient.pipeline();

    for (const { key, value, ttl } of entries) {
      if (ttl === undefined) {
        pipeline.set(key, value);
        continue;
      }

      pipeline.set(key, value, "PX", ttl);
    }

    const results = await pipeline.exec();

    if (!results) {
      return;
    }

    for (const [error] of results) {
      if (error) {
        throw error;
      }
    }
  }

  async delete(key: string): Promise<boolean> {
    await this.redisClient.del(key);
    return true;
  }

  async deleteMany(keys: string[]): Promise<boolean> {
    if (keys.length === 0) {
      return true;
    }

    await this.redisClient.del(...keys);
    return true;
  }

  async clear(): Promise<void> {
    let cursor = "0";
    const pattern = this.resolveScanPattern();

    do {
      // The Redis client is shared, so only clear keys under the cache namespace.
      const [nextCursor, keys] = await this.redisClient.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        SCAN_COUNT,
      );

      cursor = nextCursor;

      if (keys.length === 0) {
        continue;
      }

      await this.redisClient.del(
        ...keys.map((key) => this.stripRedisKeyPrefix(key)),
      );
    } while (cursor !== "0");
  }

  async has(key: string): Promise<boolean> {
    return (await this.redisClient.exists(key)) === 1;
  }

  private resolveScanPattern(): string {
    const namespacePrefix = this.namespace ? `${this.namespace}:` : "";
    return `${this.redisKeyPrefix}${namespacePrefix}*`;
  }

  private stripRedisKeyPrefix(key: string): string {
    if (!this.redisKeyPrefix || !key.startsWith(this.redisKeyPrefix)) {
      return key;
    }

    return key.slice(this.redisKeyPrefix.length);
  }
}
