# NestJS Template

## 启动

```bash
pnpm install
pnpm dev
```

```bash
pnpm build
pnpm prod
```

## 环境文件

- `.env`
- `.env.development`
- `.env.production`

常用项：

```env
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_DATABASE=nestjs_demo
DB_SYNC=false

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
REDIS_KEY_PREFIX=nest:

CACHE_TTL_MS=60000
CACHE_NAMESPACE=cache

JWT_ACCESS_SECRET=access-secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

LOG_ON=true
LOG_LEVEL=info
```

## 功能示例

### 缓存怎么配

缓存模块已经是全局模块，只要在 `AppModule` 引一次 `AppCacheModule`，后面的业务模块里直接注入 `CACHE_MANAGER` 即可，不用重复注册。

默认缓存配置等价于：

```ts
return {
  ttl: cacheEnvironment.ttl,
  namespace: cacheEnvironment.namespace,
  stores: new KeyvRedisStore(redisClient, redisEnvironment.keyPrefix ?? ""),
};
```

对应环境变量主要是：

- `CACHE_TTL_MS`
- `CACHE_NAMESPACE`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_DB`
- `REDIS_KEY_PREFIX`

### cache-manager 怎么用

```ts
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import type { Cache } from "cache-manager";

@Injectable()
export class DemoService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async getUser(id: number) {
    const key = `user:${id}`;

    const cached = await this.cache.get<{ id: number; username: string }>(key);
    if (cached) {
      return cached;
    }

    const user = { id, username: "admin001" };
    await this.cache.set(key, user, 5 * 60_000);

    return user;
  }

  async getUserPermissions(userId: number) {
    return this.cache.wrap(`user:${userId}:permissions`, async () => [
      "user:list",
      "user:update",
    ]);
  }

  async clearUserCache(id: number) {
    await this.cache.del(`user:${id}`);
  }
}
```

### 公开接口 `@Public`

`@Public()` 会跳过全局 `JwtAuthGuard`，适合登录、注册、健康检查这类不需要登录的接口。

```ts
import { Controller, Get } from "@nestjs/common";
import { Public } from "./common/auth/public.decorator";

@Controller("demo")
export class DemoController {
  @Public()
  @Get("ping")
  ping() {
    return "pong";
  }
}
```

### 角色控制 `@Roles`

`@Roles()` 配合全局 `RolesGuard` 使用，只要当前用户的 `roles` 里命中任意一个角色就能通过。

```ts
import { Controller, Get } from "@nestjs/common";
import { Roles } from "./common/auth/roles.decorator";

@Controller("admin")
export class AdminController {
  @Roles("admin", "super-admin")
  @Get("users")
  listUsers() {
    return "ok";
  }
}
```

### 当前登录用户 `@CurrentUser`

`@CurrentUser()` 直接从请求里取出已经解析好的用户信息，常用字段有 `userId`、`sessionId`、`username`、`roles`、`permissions`。

```ts
import { Controller, Get } from "@nestjs/common";
import { type AuthUser } from "./common/auth/auth-user";
import { CurrentUser } from "./common/auth/current-user.decorator";

@Controller("me")
export class MeController {
  @Get()
  profile(@CurrentUser() user: AuthUser) {
    return {
      userId: user.userId,
      username: user.username,
      roles: user.roles,
      permissions: user.permissions,
    };
  }
}
```

### 刷新令牌守卫

刷新接口不是走普通 access token，而是单独挂 `JwtRefreshGuard`。

```ts
import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { type RefreshTokenUser } from "./common/auth/auth-user";
import { CurrentUser } from "./common/auth/current-user.decorator";
import { JwtRefreshGuard } from "./common/auth/jwt-refresh.guard";
import { Public } from "./common/auth/public.decorator";

@Controller("auth")
export class AuthController {
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  refresh(@CurrentUser() user: RefreshTokenUser, @Req() request: Request) {
    return { user, ip: request.ip };
  }
}
```

### 分页 DTO 怎么复用

列表查询 DTO 直接继承 `PageQueryDto`，服务层用 `resolvePageQuery()` 统一拿 `page`、`pageSize`、`skip`。

```ts
import { IsOptional, IsString } from "class-validator";
import { PageQueryDto } from "./common/http/page-query.dto";

export class QueryUsersDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  nickname?: string;
}
```

```ts
const { page, pageSize, skip } = resolvePageQuery(query);
```

### 统一响应格式

成功响应：

```json
{
  "code": 0,
  "data": {},
  "timestamp": "2026-03-21T14:00:00.000Z"
}
```

失败响应：

```json
{
  "code": 400,
  "message": "参数校验失败",
  "data": null,
  "timestamp": "2026-03-21T14:00:00.000Z"
}
```
