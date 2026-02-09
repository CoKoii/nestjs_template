# NestJS Template

基于 NestJS + TypeORM + MySQL 的后台模板项目，包含登录注册、用户、角色、权限、个人资料模块。

## 技术栈

- NestJS 11
- TypeORM 0.3
- MySQL
- Passport JWT
- Winston

## 项目结构

```text
src/
  common/
    constants/
    database/
    decorators/
    filters/
    guards/
    interceptors/
    logger/
    types/
    utils/
  modules/
    auth/
    users/
    roles/
    permissions/
    profiles/
```

## 运行要求

- Node.js >= 20
- pnpm >= 9
- 可访问的 MySQL 实例

项目使用以下环境文件：

- `.env`：通用配置
- `.env.development`：开发环境
- `.env.production`：生产环境

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

## 代码检查与测试

```bash
# lint
pnpm lint

# unit test
pnpm test

# e2e test
pnpm test:e2e
```

## API 前缀

全局前缀：`/api/v1`

## 主要接口

### Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`

### Users

- `GET /api/v1/users`
- `PUT /api/v1/users/:id`

### Roles

- `POST /api/v1/roles`
- `GET /api/v1/roles`
- `PUT /api/v1/roles/:id`

### Permissions

- `GET /api/v1/permissions/me`
- `POST /api/v1/permissions`
- `GET /api/v1/permissions`
- `PUT /api/v1/permissions/:id`

### Profiles

- `GET /api/v1/profiles/me`

## 响应约定

成功响应：

```json
{
  "code": 0,
  "data": {},
  "timestamp": "2026/02/09 10:00:00"
}
```

异常响应：

```json
{
  "code": 400,
  "message": "参数校验失败",
  "data": null,
  "timestamp": "2026/02/09 10:00:00"
}
```

## 约定

- 保留分隔注释格式：`// ----------------------------------------------------------------------`
- 路由资源命名统一使用复数：`users/roles/permissions/profiles`
