# NestJS Template

一个面向后台管理系统的 NestJS 模板，保留登录注册、用户、角色、权限、个人资料这些基础模块，同时把运行配置、全局契约和业务模块边界拆清楚，方便后续直接在 `src/modules` 内继续开发。

## 技术栈

- NestJS 11
- TypeORM 0.3
- MySQL
- Redis
- Cache Manager
- Passport JWT
- Winston

## 目录结构

```text
src/
  config/          # 应用级启动配置：环境变量、Bootstrap
  core/            # 框架运行时能力：鉴权、HTTP 过滤器、拦截器、CoreModule
  infrastructure/  # 外部系统接入：持久化、缓存、日志
    infrastructure.module.ts
    logging/
      logging.module.ts
    persistence/
      persistence.module.ts
      mysql/
    cache/
      redis/
  shared/          # 纯共享契约与工具，不依赖业务模块
    pagination/
  modules/         # 后续业务开发主目录
    user-system/   # 模板内置用户体系模块
      user-system.module.ts
      auth/
      users/
      roles/
      permissions/
      profiles/
ormconfig.ts     # TypeORM CLI 入口，仅桥接 MySQL 数据源配置
```

## 架构约定

- `src/config` 只保留应用级配置，不承载具体基础设施实现。
- `src/core` 放 Nest 运行时横切能力，不放业务逻辑。
- `src/infrastructure` 只放外部系统接入，并按能力边界拆分目录。
- `src/shared` 只放可复用且不依赖业务模块的契约与工具。
- `src/modules` 保持为业务边界目录；模板内置能力收敛在 `src/modules/user-system`，并通过 `UserSystemModule` 聚合，方便你继续新增自己的业务模块。

## 环境配置

项目支持三层环境配置：

- `.env`：所有环境共享的基础配置
- `.env.development`：开发环境覆盖
- `.env.production`：生产环境覆盖

缓存相关共享配置：

- `CACHE_TTL_MS`：默认缓存 TTL，单位毫秒
- `CACHE_NAMESPACE`：缓存 key 命名空间，默认 `cache`
- Redis 连接仍复用 `REDIS_*` 配置

项目当前未附带 `.env.example` 文件，请直接补齐这三个环境文件：

```bash
touch .env .env.development .env.production
```

## 安装与启动

```bash
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 生产模式
pnpm prod
```

## 代码检查

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

## API 约定

- 全局前缀：`/api`
- 默认版本：不在 URL 中显式出现
- 版本控制：默认接口直接走 `/api/...`；只有新增版本接口时再显式写 `@Version('2')`，路径才会变成 `/api/v2/...`
- 成功响应统一为 `{ code, data, timestamp }`
- 异常响应统一为 `{ code, message, data, timestamp }`

当前模板内置接口：

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/users`
- `PUT /api/users/:id`
- `POST /api/roles`
- `GET /api/roles`
- `PUT /api/roles/:id`
- `GET /api/permissions/me`
- `POST /api/permissions`
- `GET /api/permissions`
- `PUT /api/permissions/:id`
- `GET /api/profiles/me`

后续新增版本时示例：

```ts
@Version("2")
@Get("me")
findMeV2() {
  return this.profileService.findOneV2();
}
```

对应访问路径：

```text
GET /api/profiles/me
GET /api/v2/profiles/me
```

## 缓存用法

项目已经把 `cache-manager + ioredis` 注册为全局缓存模块，并复用了现有 `RedisModule` 的连接。业务里直接注入 `CACHE_MANAGER` 即可：

```ts
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import type { Cache } from "cache-manager";

@Injectable()
export class DemoService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async findOne(id: string) {
    return this.cache.wrap(`demo:${id}`, async () => {
      return { id };
    });
  }
}
```

`ttl` 单位统一为毫秒；如果不显式传入，会走 `CACHE_TTL_MS`。

## 开发建议

- 新增业务优先放在 `src/modules/<domain>`，不要把业务逻辑塞进 `core` / `shared` / `infrastructure`。
- 新的全局能力优先检查是否真的跨模块复用，否则保持在业务模块内部。
- 生产环境默认关闭 `DB_SYNC`，数据结构演进建议逐步切换到 migration。
