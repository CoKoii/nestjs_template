# NestJS Template 后端模板说明手册

这是一个基于 NestJS 的通用后端模板，已经内置常见后端基础能力：环境配置、数据库、统一响应、统一异常、JWT 登录、刷新令牌、会话管理、角色权限、Redis 缓存、邮件、日志、参数校验和分页查询。

适合用来快速开始一个管理后台、业务 API、课程项目或中小型服务端项目。

## 目录

- [1. 项目能力概览](#1-项目能力概览)
- [2. 快速启动](#2-快速启动)
- [3. 项目结构](#3-项目结构)
- [4. 请求处理流程](#4-请求处理流程)
- [5. 环境配置](#5-环境配置)
- [6. 基础设施模块](#6-基础设施模块)
- [7. IAM 身份与权限模块](#7-iam-身份与权限模块)
- [8. 接口清单](#8-接口清单)
- [9. 常见开发示例](#9-常见开发示例)
- [10. 开发命令](#10-开发命令)

## 1. 项目能力概览

| 功能 | 已实现内容 | 常见使用场景 |
| --- | --- | --- |
| 环境配置 | `.env`、`.env.development`、`.env.production`、Joi 校验 | 不同环境使用不同数据库、Redis、JWT 密钥 |
| 启动配置 | 全局前缀、CORS、参数校验、关闭钩子 | 统一 API 入口和请求校验 |
| 数据库 | TypeORM、MySQL、PostgreSQL、实体自动扫描、数据库错误转换 | 保存用户、角色、权限等业务数据 |
| 统一响应 | 成功响应统一包裹为 `{ code, data, timestamp }` | 前端统一处理接口返回 |
| 统一异常 | 错误响应统一包裹为 `{ code, message, data, timestamp }` | 前端统一显示错误信息 |
| 日志 | Winston 控制台日志、按日期滚动文件日志 | 线上排查错误、记录异常上下文 |
| Redis | 全局 Redis 客户端、启动连接检测、关闭释放连接 | 缓存、限流、验证码、队列等 |
| 缓存 | 基于 `@nestjs/cache-manager` 和 Redis 的全局缓存 | 缓存热点数据、减少数据库查询 |
| 邮件 | Nodemailer、Handlebars 模板邮件、全局邮件服务 | 注册欢迎邮件、找回密码、通知邮件 |
| 登录认证 | 注册、登录、Access Token、Refresh Token | 用户登录后访问受保护接口 |
| 会话管理 | `auth_sessions` 表、Refresh Token 哈希存储、退出当前/全部会话 | 多设备登录、主动失效登录态 |
| 角色控制 | `@Roles()`、全局角色守卫 | 管理员接口、后台管理权限 |
| 权限码 | 权限表、角色绑定权限、查询当前用户权限码 | 前端菜单按钮控制、后续扩展权限守卫 |
| 用户资料 | 当前用户资料查询、用户资料与账号一对一 | 个人中心、后台用户管理 |
| 分页查询 | `PageQueryDto`、`PageResult` | 列表接口统一分页 |

## 2. 快速启动

### 2.1 安装依赖

```bash
pnpm install
```

### 2.2 准备环境变量

在项目根目录创建或修改 `.env.development`。开发环境至少需要数据库、Redis、JWT 配置。

```env
NODE_ENV=development
PORT=3000

DB_TYPE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_DATABASE=nestjs_demo
DB_SYNC=true

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
REDIS_KEY_PREFIX=nest:

CACHE_TTL_MS=60000
CACHE_NAMESPACE=cache

JWT_ACCESS_SECRET=replace-with-access-secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=replace-with-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

MAIL_ENABLED=false

LOG_ON=true
LOG_LEVEL=info
```

说明：

- 开发时可以设置 `DB_SYNC=true`，让 TypeORM 自动同步表结构。
- 生产环境建议设置 `DB_SYNC=false`，改用迁移或手动 SQL。
- Redis 是必需配置，因为缓存模块和 Redis 模块会在启动时连接 Redis。

### 2.3 启动开发服务

```bash
pnpm dev
```

默认监听：

```text
http://localhost:3000
```

当前模板没有启用接口版本前缀，因此内置接口路径是：

```text
/api/auth/login
/api/profiles/me
/api/users
```

### 2.4 生产构建

```bash
pnpm build
pnpm prod
```

## 3. 项目结构

```text
src
├── main.ts                         # 应用入口
├── app.module.ts                   # 根模块，注册全局模块、守卫、拦截器、过滤器
├── common
│   ├── auth                        # 登录守卫、角色守卫、装饰器、登录用户类型
│   ├── cache                       # Redis 客户端和全局缓存模块
│   ├── config                      # 环境变量读取、校验、启动配置
│   ├── database                    # TypeORM 配置、数据库驱动、数据库错误转换
│   ├── http                        # 统一响应、统一异常、分页 DTO
│   ├── logging                     # Winston 日志
│   └── mailer                      # 邮件模块、模板邮件服务
└── modules
    └── iam
        ├── auth                    # 注册、登录、刷新令牌、退出登录、会话清理
        ├── users                   # 用户管理
        ├── profiles                # 用户资料
        ├── roles                   # 角色管理
        └── permissions             # 权限码管理
```

项目按两层组织：

- `common`：通用基础能力。比如数据库、缓存、登录守卫、统一异常。
- `modules`：业务模块。当前内置的是 `iam`，用于身份认证和权限管理。

## 4. 请求处理流程

一次普通请求大致会经过这些步骤：

```text
请求进入
  ↓
全局前缀 /api
  ↓
ValidationPipe 参数校验和类型转换
  ↓
JwtAuthGuard 判断是否登录
  ↓
RolesGuard 判断角色是否满足 @Roles()
  ↓
Controller 接收请求
  ↓
Service 执行业务逻辑
  ↓
ResponseInterceptor 统一成功响应
  ↓
返回给前端
```

如果中间抛出异常：

```text
异常抛出
  ↓
AllExceptionFilter 统一捕获
  ↓
记录日志并隐藏敏感字段
  ↓
返回统一错误响应
```

## 5. 环境配置

### 5.1 环境文件

支持这些环境文件：

```text
.env
.env.development
.env.production
```

推荐用法：

- `.env`：放通用默认值。
- `.env.development`：放本地开发配置。
- `.env.production`：放生产配置。

最终优先级可以理解为：

```text
系统环境变量 > .env.{NODE_ENV} > .env
```

### 5.2 应用配置

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `NODE_ENV` | 运行环境，可选 `development`、`production`、`test` | `development` |
| `PORT` | HTTP 服务端口 | `3000` |
| `CORS_ORIGINS` | 生产环境允许跨域的来源，多个用英文逗号分隔 | 空 |

生产环境 CORS 规则：

- `CORS_ORIGINS` 有值时，只允许这些来源。
- `CORS_ORIGINS` 为空时，关闭跨域。
- 开发环境默认允许跨域，方便本地前端调试。

示例：

```env
CORS_ORIGINS=https://admin.example.com,https://www.example.com
```

### 5.3 数据库配置

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `DB_TYPE` | 数据库类型，可选 `mysql`、`postgres` | `mysql` |
| `DB_HOST` | 数据库地址 | 必填 |
| `DB_PORT` | 数据库端口 | MySQL `3306`，PostgreSQL `5432` |
| `DB_USERNAME` | 数据库用户名 | 必填 |
| `DB_PASSWORD` | 数据库密码 | 必填，可为空字符串 |
| `DB_DATABASE` | 数据库名 | 必填 |
| `DB_SYNC` | 是否自动同步表结构 | `false` |

MySQL 示例：

```env
DB_TYPE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_DATABASE=nestjs_demo
DB_SYNC=true
```

PostgreSQL 示例：

```env
DB_TYPE=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=nestjs_demo
DB_SYNC=true
```

### 5.4 Redis 和缓存配置

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `REDIS_HOST` | Redis 地址 | 必填 |
| `REDIS_PORT` | Redis 端口 | `6379` |
| `REDIS_USERNAME` | Redis 用户名 | 空 |
| `REDIS_PASSWORD` | Redis 密码 | 空 |
| `REDIS_DB` | Redis DB 编号 | `0` |
| `REDIS_KEY_PREFIX` | Redis key 前缀 | 空 |
| `CACHE_TTL_MS` | 默认缓存时间，单位毫秒 | `60000` |
| `CACHE_NAMESPACE` | cache-manager 命名空间 | `cache` |

示例：

```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
REDIS_KEY_PREFIX=nest:
CACHE_TTL_MS=60000
CACHE_NAMESPACE=cache
```

### 5.5 JWT 配置

| 变量 | 说明 |
| --- | --- |
| `JWT_ACCESS_SECRET` | Access Token 签名密钥 |
| `JWT_ACCESS_EXPIRES_IN` | Access Token 过期时间，例如 `15m`、`1d` |
| `JWT_REFRESH_SECRET` | Refresh Token 签名密钥 |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token 过期时间，例如 `7d` |

示例：

```env
JWT_ACCESS_SECRET=replace-with-access-secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=replace-with-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

### 5.6 邮件配置

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `MAIL_ENABLED` | 是否启用真实发信 | `false` |
| `MAIL_HOST` | SMTP 地址 | 启用邮件时必填 |
| `MAIL_PORT` | SMTP 端口 | `587` |
| `MAIL_SECURE` | 是否使用 SSL/TLS | `false` |
| `MAIL_IGNORE_TLS` | 是否忽略 TLS | `false` |
| `MAIL_USER` | SMTP 用户名 | 空 |
| `MAIL_PASS` | SMTP 密码 | 空 |
| `MAIL_FROM_NAME` | 发件人名称 | `NestJS Template` |
| `MAIL_FROM_ADDRESS` | 发件人邮箱 | 启用邮件时必填 |

示例：

```env
MAIL_ENABLED=true
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_IGNORE_TLS=false
MAIL_USER=your-account
MAIL_PASS=your-password
MAIL_FROM_NAME=NestJS Template
MAIL_FROM_ADDRESS=no-reply@example.com
```

`MAIL_ENABLED=false` 时，项目可以正常启动，但调用 `AppMailerService.sendMail()` 会抛出 `邮件服务未启用`。

### 5.7 日志配置

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `LOG_ON` | 是否写入日志文件 | `false` |
| `LOG_LEVEL` | 日志级别 | `info` |

支持的日志级别：

```text
error, warn, info, http, verbose, debug, silly
```

示例：

```env
LOG_ON=true
LOG_LEVEL=info
```

## 6. 基础设施模块

### 6.1 启动配置模块

位置：

```text
src/common/config
```

这个模块负责：

- 读取和校验环境变量。
- 设置全局路由前缀 `/api`。
- 根据环境启用 CORS。
- 启用全局参数校验。
- 启用应用关闭钩子。
- 使用 Winston 作为 Nest 日志器。

参数校验规则：

- 自动把 query、params 中的值转换成 DTO 需要的类型。
- 移除 DTO 中没有声明的字段。
- 遇到第一个校验错误就返回。
- 返回 DTO 中配置的中文错误信息。

示例：

```ts
export class QueryDto {
  @Type(() => Number)
  @IsInt({ message: "id 必须为整数" })
  id!: number;
}
```

请求：

```text
GET /api/example?id=1
```

控制器里拿到的 `id` 会是数字 `1`，不是字符串 `"1"`。

### 6.2 统一响应模块

位置：

```text
src/common/http/response.interceptor.ts
```

所有成功响应会被统一包裹。

业务代码：

```ts
@Get("hello")
hello() {
  return { message: "ok" };
}
```

实际响应：

```json
{
  "code": 0,
  "data": {
    "message": "ok"
  },
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```

适合场景：

- 前端统一判断 `code === 0` 表示成功。
- 所有接口返回格式一致，降低联调成本。

### 6.3 统一异常模块

位置：

```text
src/common/http/exception.filter.ts
src/common/http/exception.util.ts
```

所有异常会被统一处理。

业务代码：

```ts
throw new NotFoundException("用户不存在");
```

实际响应：

```json
{
  "code": 404,
  "message": "用户不存在",
  "data": null,
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```

日志会记录：

- 请求方法和路径。
- IP、params、query、body。
- 当前登录用户。
- 异常名和堆栈。

这些敏感字段会自动脱敏：

```text
password, confirmPassword, authorization, token, accessToken, refreshToken
```

适合场景：

- 业务代码只需要抛出 Nest 标准异常。
- 日志保留排查信息，同时避免泄露密码和 token。

### 6.4 分页查询模块

位置：

```text
src/common/http/page-query.dto.ts
```

内置分页参数：

| 参数 | 默认值 | 规则 |
| --- | --- | --- |
| `page` | `1` | 最小 `1` |
| `pageSize` | `10` | 最小 `1`，最大 `100` |

返回结构：

```ts
export interface PageResult<T> {
  items: T[];
  total: number;
}
```

使用示例：

```ts
export class QueryArticlesDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  title?: string;
}

async list(query: QueryArticlesDto): Promise<PageResult<Article>> {
  const { pageSize, skip } = resolvePageQuery(query);

  const [items, total] = await this.articleRepository.findAndCount({
    skip,
    take: pageSize,
    order: { id: "DESC" },
  });

  return { items, total };
}
```

适合场景：

- 用户列表、角色列表、权限列表、文章列表等所有列表查询。

说明：下面的代码示例主要展示核心写法。实际开发时，请按当前文件位置补齐 `import`，例如 `@Controller`、`@Get` 来自 `@nestjs/common`，`PageQueryDto` 来自 `src/common/http/page-query.dto`。

### 6.5 数据库模块

位置：

```text
src/common/database
```

这个模块负责：

- 使用 TypeORM 连接数据库。
- 支持 MySQL 和 PostgreSQL。
- 根据 `DB_TYPE` 自动选择数据库驱动配置。
- 自动扫描实体文件。
- 提供 TypeORM CLI 使用的 `ormconfig.ts`。
- 把常见数据库错误转换成业务异常。

实体扫描规则：

- TypeScript 开发环境扫描 `src/**/*.entity.ts`。
- 构建后生产环境扫描 `dist/**/*.entity.js`。

数据库错误转换示例：

```ts
try {
  await this.permissionRepository.save(dto);
} catch (error) {
  rethrowDatabaseError(error, {
    unique: `权限码 "${dto.code}" 已存在`,
    foreignKeyConstraint: "关联数据不存在",
  });
}
```

支持转换的错误类型：

| 错误类型 | 返回异常 |
| --- | --- |
| 唯一键冲突 | `409 Conflict` |
| 外键不存在 | `400 Bad Request` |
| 数据仍被引用 | `400 Bad Request` |
| 字段过长 | `400 Bad Request` |
| 非空字段为空 | `400 Bad Request` |
| 没有默认值 | `400 Bad Request` |
| 字段值非法 | `400 Bad Request` |

适合场景：

- 用户名重复时返回“当前用户名已被注册”。
- 绑定不存在的角色时返回“角色不存在”。
- 创建重复权限码时返回“权限码已存在”。

TypeORM CLI 示例：

```bash
pnpm typeorm migration:generate ./src/migrations/Init -d ./ormconfig.ts
pnpm typeorm migration:run -d ./ormconfig.ts
pnpm typeorm migration:revert -d ./ormconfig.ts
```

### 6.6 Redis 模块

位置：

```text
src/common/cache/redis.module.ts
```

这个模块是全局模块，提供 `REDIS` 注入令牌。

启动时会：

- 创建 Redis 客户端。
- 连接 Redis。
- 执行 `ping()` 检查连接。
- 监听 `ready`、`reconnecting`、`error` 事件。
- 应用关闭时自动 `quit()`，失败时 `disconnect()`。

使用示例：

```ts
@Injectable()
export class CaptchaService {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async saveCode(phone: string, code: string) {
    await this.redis.set(`captcha:${phone}`, code, "EX", 300);
  }

  async getCode(phone: string) {
    return this.redis.get(`captcha:${phone}`);
  }
}
```

适合场景：

- 验证码。
- 登录限制。
- 分布式锁。
- 临时状态保存。

### 6.7 缓存模块

位置：

```text
src/common/cache/cache.module.ts
src/common/cache/keyv-redis.store.ts
```

这个模块是全局模块，基于 Redis 实现 Nest 缓存。

使用示例：

```ts
@Injectable()
export class UserCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async getUser(id: number) {
    const key = `user:${id}`;

    const cached = await this.cache.get<{ id: number; username: string }>(key);
    if (cached) return cached;

    const user = { id, username: `user-${id}` };
    await this.cache.set(key, user, 60_000);

    return user;
  }

  async clearUser(id: number) {
    await this.cache.del(`user:${id}`);
  }
}
```

也可以用 `wrap()` 简化“先查缓存，未命中再回源”的逻辑：

```ts
return this.cache.wrap(`user:${id}:permissions`, async () => {
  return ["user:list", "user:update"];
});
```

适合场景：

- 缓存用户资料。
- 缓存菜单权限。
- 缓存配置项。
- 缓存读取频繁、变化较少的数据。

### 6.8 邮件模块

位置：

```text
src/common/mailer
```

这个模块是全局模块，提供 `AppMailerService`。

内置模板：

```text
src/common/mailer/templates/welcome.hbs
```

构建时 Nest 会自动复制模板文件，配置在：

```text
nest-cli.json
```

发送模板邮件示例：

```ts
@Injectable()
export class NoticeService {
  constructor(private readonly mailer: AppMailerService) {}

  async sendWelcomeMail(to: string) {
    await this.mailer.sendTemplateMail({
      to,
      subject: "Welcome",
      template: "welcome",
      context: {
        title: "Welcome to NestJS Template",
        message: "Your account is ready.",
        actionUrl: "https://example.com/login",
        actionLabel: "Go to Login",
      },
    });
  }
}
```

普通邮件示例：

```ts
await this.mailer.sendMail({
  to: "user@example.com",
  subject: "通知",
  text: "这是一封普通文本邮件",
});
```

适合场景：

- 注册欢迎邮件。
- 找回密码。
- 登录提醒。
- 系统通知。

### 6.9 日志模块

位置：

```text
src/common/logging
```

这个模块使用 `nest-winston` 和 `winston`。

默认行为：

- 控制台始终输出 Nest 风格日志。
- `LOG_ON=true` 时写入 `logs` 目录。
- 日志文件按天切分。
- 单文件最大 `20m`。
- 最多保留 `7d`。
- 旧日志会压缩。

日志文件：

```text
logs/application-YYYY-MM-DD.log
logs/warning-YYYY-MM-DD.log
```

使用示例：

```ts
@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);

  run() {
    this.logger.log("任务开始");
    this.logger.warn("这是一个警告");
  }
}
```

适合场景：

- 记录定时任务执行结果。
- 排查接口异常。
- 线上问题定位。

## 7. IAM 身份与权限模块

位置：

```text
src/modules/iam
```

IAM 是 Identity and Access Management 的缩写，负责“谁登录了”和“他能访问什么”。

当前 IAM 模块包含：

- `auth`：注册、登录、刷新令牌、退出登录、会话清理。
- `users`：用户列表和用户更新。
- `profiles`：当前用户资料。
- `roles`：角色管理。
- `permissions`：权限码管理。

### 7.1 数据模型

核心关系：

```text
User 1 -- 1 Profile
User N -- N Role
Role N -- N Permission
User 1 -- N AuthSession
```

含义：

- 一个用户有一份资料。
- 一个用户可以有多个角色。
- 一个角色可以有多个权限码。
- 一个用户可以有多个登录会话，比如电脑登录一次、手机登录一次。

#### User 用户

表名：

```text
users
```

主要字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 用户 ID |
| `username` | 用户名，唯一 |
| `password` | 密码哈希，默认查询不返回 |
| `status` | 账号状态，`false` 表示禁用 |
| `createdAt` | 创建时间 |
| `updatedAt` | 更新时间 |

#### Profile 用户资料

表名：

```text
profiles
```

主要字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 资料 ID |
| `nickname` | 昵称 |
| `userId` | 关联用户 |

注册用户时会自动创建 profile，默认昵称等于用户名。

#### Role 角色

表名：

```text
roles
```

主要字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 角色 ID |
| `roleName` | 角色名称，唯一 |
| `description` | 角色描述 |
| `status` | 角色状态 |

常见角色：

```text
admin
editor
user
```

#### Permission 权限码

表名：

```text
permissions
```

主要字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 权限 ID |
| `code` | 权限码，唯一 |
| `description` | 权限描述 |
| `status` | 权限状态 |

常见权限码：

```text
user:list
user:update
role:create
permission:update
```

当前项目会把用户拥有的权限码放进 `CurrentUser.permissions`，并提供 `/api/permissions/me` 查询。项目暂时没有内置“权限码守卫”，如果需要按权限码拦截接口，可以基于 `user.permissions` 扩展一个 guard。

#### AuthSession 登录会话

表名：

```text
auth_sessions
```

主要字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 会话 ID，也就是 JWT 里的 `sid` |
| `userId` | 用户 ID |
| `refreshTokenHash` | Refresh Token 哈希，默认查询不返回 |
| `expiresAt` | 会话过期时间 |
| `lastUsedAt` | 最近使用时间 |
| `ip` | 最近登录 IP |
| `userAgent` | 设备标识 |

安全设计：

- 数据库不保存明文 Refresh Token，只保存 Argon2 哈希。
- Access Token 和 Refresh Token 都带有 `type`，避免互相混用。
- Access Token 校验时会检查会话是否存在、是否过期、用户是否启用。
- Access Token 校验会按 `5` 分钟间隔刷新 `lastUsedAt`，避免每次请求都写数据库。
- Refresh Token 校验时会检查 JWT、会话、过期时间、用户状态和 token 哈希。
- Refresh Token 每次刷新都会原子轮换，旧 token 同时并发刷新时只有一个请求能成功。

### 7.2 注册

接口：

```text
POST /api/auth/register
```

是否公开：

```text
公开接口，不需要 token
```

请求体：

```json
{
  "username": "student001",
  "password": "123456",
  "confirmPassword": "123456"
}
```

规则：

- `username` 长度 `6` 到 `50`。
- `password` 长度 `6` 到 `20`。
- `confirmPassword` 可选，传了就必须和 `password` 一致。
- 用户名不能重复。

响应：

```json
{
  "code": 0,
  "data": {
    "accessToken": "xxx",
    "refreshToken": "yyy"
  },
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```

使用场景：

- 新用户创建账号。
- 注册后立即登录。

### 7.3 登录

接口：

```text
POST /api/auth/login
```

是否公开：

```text
公开接口，不需要 token
```

请求体：

```json
{
  "username": "student001",
  "password": "123456"
}
```

规则：

- 用户名和密码必须正确。
- 用户 `status=false` 时不能登录。

响应：

```json
{
  "code": 0,
  "data": {
    "accessToken": "xxx",
    "refreshToken": "yyy"
  },
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```

使用场景：

- 用户登录系统。
- 登录成功后前端保存 `accessToken` 和 `refreshToken`。

前端请求受保护接口时携带：

```http
Authorization: Bearer <accessToken>
```

### 7.4 刷新令牌

接口：

```text
POST /api/auth/refresh
```

是否公开：

```text
公开接口，但必须携带 refreshToken
```

请求头：

```http
Authorization: Bearer <refreshToken>
```

响应：

```json
{
  "code": 0,
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  },
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```

使用场景：

- Access Token 过期后，前端用 Refresh Token 换一组新 token。
- 用户无需重新输入用户名密码。

### 7.5 退出登录

退出当前会话：

```text
POST /api/auth/logout
```

请求头：

```http
Authorization: Bearer <accessToken>
```

响应：

```json
{
  "code": 0,
  "data": "退出成功",
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```

退出全部会话：

```text
POST /api/auth/logout-all
```

使用场景：

- `logout`：退出当前设备。
- `logout-all`：修改密码后踢掉所有设备，或用户手动退出全部登录。

### 7.6 会话清理

位置：

```text
src/modules/iam/auth/auth-session-cleanup.service.ts
```

功能：

- 每 `10` 分钟清理一次过期登录会话。
- 每批最多删除 `500` 条。
- 删除后记录日志。

使用场景：

- 避免 `auth_sessions` 表长期积累过期数据。
- 保持登录会话表体积可控。

### 7.7 登录守卫和装饰器

项目已经在 `AppModule` 注册了两个全局守卫：

```ts
{ provide: APP_GUARD, useClass: JwtAuthGuard }
{ provide: APP_GUARD, useClass: RolesGuard }
```

这意味着：

- 默认所有接口都需要登录。
- 只有加了 `@Public()` 的接口才不需要登录。
- 加了 `@Roles()` 的接口需要登录，并且用户必须拥有指定角色。

#### `@Public()`

用途：

```text
声明公开接口，跳过登录校验
```

适合场景：

- 登录。
- 注册。
- 刷新令牌。
- 健康检查。
- 公开资源。

示例：

```ts
@Public()
@Post("login")
login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

#### `@Roles()`

用途：

```text
限制接口只能由指定角色访问
```

示例：

```ts
@Roles("admin")
@Controller("users")
export class UsersController {
  @Get()
  list() {
    return this.usersService.list();
  }
}
```

如果用户角色数组里有任意一个匹配，就允许访问。

```ts
@Roles("admin", "editor")
@Post("articles")
create() {
  return this.articlesService.create();
}
```

#### `@CurrentUser()`

用途：

```text
在控制器方法中获取当前登录用户
```

返回结构：

```ts
export interface AuthUser {
  userId: number;
  sessionId: string;
  username: string;
  roles: string[];
  permissions: string[];
}
```

示例：

```ts
@Get("me")
getMe(@CurrentUser() user: AuthUser) {
  return {
    id: user.userId,
    username: user.username,
    roles: user.roles,
    permissions: user.permissions,
  };
}
```

#### `JwtRefreshGuard`

用途：

```text
专门校验 Refresh Token
```

示例：

```ts
@Public()
@UseGuards(JwtRefreshGuard)
@Post("refresh")
refresh(@CurrentUser() user: RefreshTokenUser) {
  return this.authService.refresh(user);
}
```

注意：

- 普通接口使用 Access Token。
- `/api/auth/refresh` 使用 Refresh Token。
- 两类 token 的密钥、过期时间和 payload type 都不同。

### 7.8 当前用户资料

接口：

```text
GET /api/profiles/me
```

请求头：

```http
Authorization: Bearer <accessToken>
```

响应示例：

```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "student001",
    "status": true,
    "profile": {
      "id": 1,
      "nickname": "student001",
      "createdAt": "2026-06-08T10:00:00.000Z",
      "updatedAt": "2026-06-08T10:00:00.000Z"
    },
    "roles": ["admin"],
    "permissions": ["user:list", "user:update"],
    "createdAt": "2026-06-08T10:00:00.000Z",
    "updatedAt": "2026-06-08T10:00:00.000Z"
  },
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```

使用场景：

- 前端进入系统后获取当前用户信息。
- 渲染用户昵称、角色、菜单和按钮权限。

### 7.9 权限码管理

权限码代表一个可控制的功能点。

示例：

```text
user:list
user:update
role:create
permission:update
```

#### 查询当前用户权限码

接口：

```text
GET /api/permissions/me
```

请求头：

```http
Authorization: Bearer <accessToken>
```

响应：

```json
{
  "code": 0,
  "data": ["role:create", "user:list", "user:update"],
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```

说明：

- 返回值会去重。
- 返回值会按字母顺序排序。
- 只包含启用状态的角色和权限。

#### 创建权限码

接口：

```text
POST /api/permissions
```

要求：

```text
必须登录，并拥有 admin 角色
```

请求体：

```json
{
  "code": "user:list",
  "description": "查看用户列表",
  "status": true
}
```

规则：

- `code` 不能为空。
- `code` 不能包含空格。
- `code` 长度 `1` 到 `50`。
- `code` 唯一。
- `description` 最长 `255`。

#### 查询权限列表

接口：

```text
GET /api/permissions?page=1&pageSize=10&code=user
```

要求：

```text
必须登录，并拥有 admin 角色
```

说明：

- 支持分页。
- 支持按 `code` 模糊查询。
- 按 `id` 倒序返回。

#### 更新权限码

接口：

```text
PUT /api/permissions/:id
```

要求：

```text
必须登录，并拥有 admin 角色
```

请求体：

```json
{
  "description": "查看用户列表和详情",
  "status": true
}
```

使用场景：

- 后台配置系统权限点。
- 前端根据权限码控制菜单或按钮显示。

### 7.10 角色管理

角色是一组权限码的集合。

示例：

```text
admin  拥有所有后台管理权限
editor 拥有内容编辑权限
user   普通用户
```

#### 创建角色

接口：

```text
POST /api/roles
```

要求：

```text
必须登录，并拥有 admin 角色
```

请求体：

```json
{
  "roleName": "admin",
  "description": "系统管理员",
  "status": true,
  "permissions": [1, 2, 3]
}
```

规则：

- `roleName` 不能为空。
- `roleName` 不能包含空格。
- `roleName` 长度 `2` 到 `50`。
- `roleName` 唯一。
- `permissions` 是权限 ID 数组，可选。
- 传入重复权限 ID 会自动去重。

#### 查询角色列表

接口：

```text
GET /api/roles?page=1&pageSize=10&roleName=admin
```

要求：

```text
必须登录，并拥有 admin 角色
```

说明：

- 支持分页。
- 支持按 `roleName` 模糊查询。
- 返回角色绑定的权限列表。

#### 更新角色

接口：

```text
PUT /api/roles/:id
```

要求：

```text
必须登录，并拥有 admin 角色
```

请求体：

```json
{
  "description": "系统超级管理员",
  "status": true,
  "permissions": [1, 2, 3, 4]
}
```

使用场景：

- 创建管理员、运营、审核员等角色。
- 给角色绑定权限码。
- 禁用某个角色。

### 7.11 用户管理

用户创建由注册接口完成，用户管理模块负责后台查询和更新。

#### 查询用户列表

接口：

```text
GET /api/users?page=1&pageSize=10&nickname=student
```

要求：

```text
必须登录，并拥有 admin 角色
```

说明：

- 支持分页。
- 支持按 profile.nickname 模糊查询。
- 返回用户资料和角色列表。
- 按用户 ID 倒序返回。

#### 更新用户

接口：

```text
PUT /api/users/:id
```

要求：

```text
必须登录，并拥有 admin 角色
```

请求体：

```json
{
  "profile": {
    "nickname": "新昵称"
  },
  "roles": [1, 2],
  "status": true
}
```

规则：

- `profile.nickname` 长度 `1` 到 `20`。
- `roles` 是角色 ID 数组。
- 传入重复角色 ID 会自动去重。
- 绑定不存在的角色会返回 `角色不存在`。
- `status=false` 会禁用账号，禁用后不能登录。

使用场景：

- 后台修改用户昵称。
- 给用户分配角色。
- 禁用违规账号。

### 7.12 首次管理员说明

项目内置了管理员接口，但没有内置初始化管理员脚本。

首次使用时，一般流程是：

1. 通过 `/api/auth/register` 注册第一个用户。
2. 在数据库中创建 `admin` 角色。
3. 把第一个用户绑定到 `admin` 角色。
4. 用该用户登录，之后就可以访问角色、权限、用户管理接口。

如果你准备把这个模板用于正式项目，建议补一个 seed 脚本，自动创建：

- 默认管理员用户。
- `admin` 角色。
- 初始权限码。
- 管理员和角色的绑定关系。

## 8. 接口清单

当前内置接口统一使用 `/api` 前缀。

### 8.1 公开接口

| 方法 | 路径 | 功能 | Token |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | 注册 | 不需要 |
| `POST` | `/api/auth/login` | 登录 | 不需要 |
| `POST` | `/api/auth/refresh` | 刷新 token | 需要 Refresh Token |

### 8.2 登录后可访问

| 方法 | 路径 | 功能 | 角色 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/logout` | 退出当前会话 | 不限制 |
| `POST` | `/api/auth/logout-all` | 退出全部会话 | 不限制 |
| `GET` | `/api/profiles/me` | 当前用户资料 | 不限制 |
| `GET` | `/api/permissions/me` | 当前用户权限码 | 不限制 |

### 8.3 管理员接口

这些接口都需要：

```http
Authorization: Bearer <accessToken>
```

并且当前用户必须拥有：

```text
admin
```

| 方法 | 路径 | 功能 |
| --- | --- | --- |
| `GET` | `/api/users` | 用户列表 |
| `PUT` | `/api/users/:id` | 更新用户 |
| `POST` | `/api/roles` | 创建角色 |
| `GET` | `/api/roles` | 角色列表 |
| `PUT` | `/api/roles/:id` | 更新角色 |
| `POST` | `/api/permissions` | 创建权限码 |
| `GET` | `/api/permissions` | 权限码列表 |
| `PUT` | `/api/permissions/:id` | 更新权限码 |

## 9. 常见开发示例

### 9.1 新增一个公开接口

适合场景：

- 健康检查。
- 公开配置。
- 不需要登录的回调接口。

示例：

```ts
@Controller("health")
export class HealthController {
  @Public()
  @Get()
  check() {
    return "ok";
  }
}
```

请求：

```text
GET /api/health
```

响应：

```json
{
  "code": 0,
  "data": "ok",
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```

### 9.2 新增一个需要登录的接口

默认不加 `@Public()` 就需要登录。

```ts
@Controller("orders")
export class OrdersController {
  @Get("mine")
  listMine(@CurrentUser() user: AuthUser) {
    return this.ordersService.listByUser(user.userId);
  }
}
```

请求：

```http
GET /api/orders/mine
Authorization: Bearer <accessToken>
```

适合场景：

- 我的订单。
- 我的收藏。
- 我的消息。

### 9.3 新增一个管理员接口

```ts
@Roles("admin")
@Controller("admin/reports")
export class AdminReportsController {
  @Get()
  list() {
    return this.reportsService.list();
  }
}
```

适合场景：

- 后台管理。
- 数据统计。
- 用户审核。

### 9.4 新增一个分页列表接口

DTO：

```ts
export class QueryArticlesDto extends PageQueryDto {
  @IsOptional()
  @IsString({ message: "标题必须为字符串" })
  title?: string;
}
```

Service：

```ts
async list(query: QueryArticlesDto): Promise<PageResult<Article>> {
  const { pageSize, skip } = resolvePageQuery(query);
  const title = query.title?.trim();

  const queryBuilder = this.articleRepository
    .createQueryBuilder("article")
    .orderBy("article.id", "DESC")
    .skip(skip)
    .take(pageSize);

  if (title) {
    queryBuilder.andWhere("article.title LIKE :title", {
      title: `%${title}%`,
    });
  }

  const [items, total] = await queryBuilder.getManyAndCount();
  return { items, total };
}
```

Controller：

```ts
@Get()
list(@Query() query: QueryArticlesDto) {
  return this.articlesService.list(query);
}
```

### 9.5 新增一个实体

```ts
@Entity({ name: "articles", comment: "文章" })
export class Article {
  @PrimaryGeneratedColumn({ comment: "文章ID" })
  id!: number;

  @Column({ length: 100, comment: "标题" })
  title!: string;

  @Column({ type: "text", comment: "内容" })
  content!: string;

  @Column({ default: true, comment: "状态" })
  status!: boolean;

  @CreateDateColumn({ comment: "创建时间" })
  createdAt!: Date;

  @UpdateDateColumn({ comment: "更新时间" })
  updatedAt!: Date;
}
```

然后在模块里注册：

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
```

最后在 `AppModule` 或业务聚合模块中导入 `ArticlesModule`。

### 9.6 在业务中发送邮件

```ts
@Injectable()
export class AccountService {
  constructor(private readonly mailer: AppMailerService) {}

  async sendResetPasswordMail(email: string, resetUrl: string) {
    await this.mailer.sendTemplateMail({
      to: email,
      subject: "重置密码",
      template: "welcome",
      context: {
        title: "重置密码",
        message: "请点击下方按钮重置密码。",
        actionUrl: resetUrl,
        actionLabel: "重置密码",
      },
    });
  }
}
```

适合场景：

- 注册欢迎邮件。
- 找回密码邮件。
- 账号安全提醒。

### 9.7 在业务中使用缓存

```ts
@Injectable()
export class SettingsService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async getPublicSettings() {
    return this.cache.wrap("settings:public", async () => {
      return {
        siteName: "NestJS Template",
        allowRegister: true,
      };
    });
  }
}
```

适合场景：

- 配置项读取。
- 菜单权限读取。
- 字典数据读取。

### 9.8 扩展权限码守卫

当前项目已经有权限码数据，但只内置了角色守卫。如果你希望接口按权限码控制，可以新增一个类似 `@Permissions()` 的装饰器和 guard。

示例思路：

```ts
export const PERMISSIONS_KEY = "permissions";
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

Guard 核心逻辑：

```ts
const required = this.reflector.getAllAndOverride<string[]>(
  PERMISSIONS_KEY,
  [context.getHandler(), context.getClass()],
);

if (!required?.length) return true;

const request = context.switchToHttp().getRequest<RequestWithUser>();
return required.some((permission) =>
  request.user.permissions.includes(permission),
);
```

使用：

```ts
@Permissions("user:update")
@Put("users/:id")
updateUser() {
  return this.usersService.update();
}
```

适合场景：

- 不只是区分 `admin`，还要细分按钮级权限。
- 同一个角色下不同用户拥有不同权限组合。

## 10. 开发命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 开发模式启动，监听文件变化 |
| `pnpm start` | 普通启动 |
| `pnpm build` | 生产构建，输出到 `dist` |
| `pnpm prod` | 运行构建后的生产代码 |
| `pnpm lint` | ESLint 检查并自动修复 |
| `pnpm format` | Prettier 格式化 `src/**/*.ts` |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:watch` | 监听模式运行测试 |
| `pnpm test:cov` | 生成测试覆盖率 |
| `pnpm test:e2e` | 运行 e2e 测试配置 |
| `pnpm typeorm` | 运行 TypeORM CLI |

推荐提交前执行：

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## 总结

这个模板已经完成了后端项目最常用的骨架：

- 基础设施：配置、数据库、Redis、缓存、邮件、日志。
- HTTP 规范：统一响应、统一异常、参数校验、分页。
- 身份权限：注册登录、JWT、Refresh Token、会话、角色、权限码、用户资料。
- 管理接口：用户、角色、权限码的后台管理能力。

开发新业务时，优先复用已有模式：

1. 新建 `module/controller/service/entity/dto`。
2. DTO 中写清楚参数校验。
3. Service 中处理业务和数据库异常。
4. Controller 中用 `@Public()`、`@Roles()`、`@CurrentUser()` 控制访问。
5. 列表接口统一继承 `PageQueryDto`，返回 `{ items, total }`。
6. 需要性能优化时使用缓存，需要通知时使用邮件，需要排查问题时看日志。
