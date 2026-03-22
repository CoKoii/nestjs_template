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

最小环境变量示例：

```env
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_DATABASE=nestjs_demo
DB_SYNC=false

JWT_ACCESS_SECRET=access-secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
REDIS_KEY_PREFIX=nest:
CACHE_TTL_MS=60000
CACHE_NAMESPACE=cache

MAIL_ENABLED=false
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_IGNORE_TLS=false
MAIL_USER=
MAIL_PASS=
MAIL_FROM_NAME=NestJS Template
MAIL_FROM_ADDRESS=no-reply@example.com

LOG_ON=true
LOG_LEVEL=info
```

## 集成功能最小示例

下面的示例只保留核心写法，`import` 路径按你自己的文件位置调整即可。

项目默认已经在 `AppModule` 里接好这些基础设施：

- 全局登录守卫 `JwtAuthGuard`
- 全局角色守卫 `RolesGuard`
- 全局缓存模块 `AppCacheModule`
- 全局邮件模块 `AppMailerModule`

### `@Public()`：公开接口

默认所有接口都要先通过登录校验。给方法加 `@Public()`，就会跳过全局 `JwtAuthGuard`。

```ts
@Controller("auth")
export class AuthController {
  @Public()
  @Post("login")
  login() {
    return { accessToken: "...", refreshToken: "..." };
  }
}
```

适合放在登录、注册、健康检查、验证码发送这类接口上。

### `@Roles()`：角色限制

`@Roles()` 是在“已登录”的基础上再做一层角色判断。当前用户的 `roles` 里命中任意一个角色就能通过。

```ts
@Controller("users")
export class UsersController {
  @Roles("admin")
  @Get()
  list() {
    return ["user-1", "user-2"];
  }
}
```

如果整个控制器都只允许某个角色访问，也可以直接写在类上：

```ts
@Roles("admin")
@Controller("roles")
export class RolesController {
  @Get()
  list() {
    return ["admin", "editor"];
  }
}
```

写在类上以后，这个控制器里的所有接口都会生效。

### `@CurrentUser()`：拿当前登录用户

JWT 解析成功后，用户信息会挂到 `request.user` 上。业务代码直接用 `@CurrentUser()` 取，不用手动读 `req.user`。

```ts
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

### `JwtRefreshGuard`：刷新令牌接口

刷新 token 不是走普通 access token，而是单独挂 `JwtRefreshGuard`。

```ts
@Controller("auth")
export class AuthController {
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  refresh(@CurrentUser() user: RefreshTokenUser) {
    return {
      userId: user.userId,
      sessionId: user.sessionId,
      refreshToken: user.refreshToken,
    };
  }
}
```

### 邮件发送：最小模板示例

先打开邮件配置：

```env
MAIL_ENABLED=true
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-account
MAIL_PASS=your-password
MAIL_FROM_ADDRESS=no-reply@example.com
```

然后在业务服务里直接注入 `AppMailerService`：

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
      },
    });
  }
}
```

说明：

- `template: "welcome"` 对应 `src/common/mailer/templates/welcome.hbs`
- `nest build` 会自动复制模板文件，`nest-cli.json` 里已经配好 `assets`
- 如果 `MAIL_ENABLED=false`，应用可以启动，但真正调用发信时会抛出 `邮件服务未启用`

### 缓存操作：最小读写示例

缓存模块已经是全局模块，不用在业务模块重复注册。直接注入 `CACHE_MANAGER` 即可。

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

常用环境变量：

```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
REDIS_KEY_PREFIX=nest:
CACHE_TTL_MS=60000
CACHE_NAMESPACE=cache
```

如果你想把“查不到就回源再写缓存”也写得更短，可以直接用 `wrap`：

```ts
return this.cache.wrap(`user:${id}:permissions`, async () => {
  return ["user:list", "user:update"];
});
```

### 分页 DTO：列表接口复用

列表查询 DTO 直接继承 `PageQueryDto`，服务层统一拿 `page`、`pageSize`、`skip`。

```ts
export class QueryUsersDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  nickname?: string;
}
```

```ts
const { page, pageSize, skip } = resolvePageQuery(query);
```

## 统一响应格式

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
