# NestJS Template

一个面向后台管理系统的 NestJS 模板，保留登录注册、用户、角色、权限、个人资料这些基础模块，同时把运行配置、全局契约和业务模块边界拆清楚，方便后续直接在 `src/modules` 内继续开发。

## 技术栈

- NestJS 11
- TypeORM 0.3
- MySQL
- Passport JWT
- Winston

## 目录结构

```text
src/
  config/          # 启动配置与环境装配
  core/            # 框架运行时能力：鉴权、HTTP 过滤器、拦截器、CoreModule
  infrastructure/  # 数据库、日志等基础设施实现
  shared/          # 纯共享 DTO / utils，不依赖业务模块
  modules/         # 后续业务开发主目录
    user-system/   # 模板内置用户体系模块
      user-system.module.ts
      auth/
      users/
      roles/
      permissions/
      profiles/
ormconfig.ts     # TypeORM CLI 入口，仅负责桥接配置
```

## 架构约定

- `src/config` 只处理启动期配置。
- `src/core` 放 Nest 运行时横切能力，不放业务逻辑。
- `src/infrastructure` 放日志、数据库这类实现细节。
- `src/shared` 只放可复用且不依赖业务模块的契约与工具。
- `src/modules` 保持为业务边界目录；模板内置能力收敛在 `src/modules/user-system`，并通过 `UserSystemModule` 聚合，方便你继续新增自己的业务模块。

## 环境配置

项目支持三层环境配置：

- `.env`：所有环境共享的基础配置
- `.env.development`：开发环境覆盖
- `.env.production`：生产环境覆盖

建议从示例文件开始：

```bash
cp .env.example .env
cp .env.development.example .env.development
cp .env.production.example .env.production
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

## 开发建议

- 新增业务优先放在 `src/modules/<domain>`，不要把业务逻辑塞进 `core` / `shared` / `infrastructure`。
- 新的全局能力优先检查是否真的跨模块复用，否则保持在业务模块内部。
- 生产环境默认关闭 `DB_SYNC`，数据结构演进建议逐步切换到 migration。
