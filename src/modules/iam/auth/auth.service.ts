import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { JwtSignOptions } from "@nestjs/jwt";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { randomUUID } from "node:crypto";
import { Repository } from "typeorm";
import {
  ACCESS_TOKEN_TYPE,
  REFRESH_TOKEN_TYPE,
  type AuthTokenPayload,
  type AuthUser,
  type RefreshTokenPayload,
  type RefreshTokenUser,
} from "../../../common/auth/auth-user";
import { getAuthEnvironment } from "../../../common/config/env";
import { rethrowDatabaseError } from "../../../common/database/database-error.util";
import { User } from "../users/user.entity";
import type { AuthRequestContext, AuthTokens } from "./auth.types";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthSession } from "./auth-session.entity";

interface IssuedAuthTokens extends AuthTokens {
  sessionId: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession)
    private readonly authSessions: Repository<AuthSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // --------------------------------------------------------------------------------------------------
  // 创建用户认证查询构造器
  private createUserAuthQueryBuilder() {
    return this.users
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.roles", "role")
      .leftJoinAndSelect("role.permissions", "permission");
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 创建会话认证查询构造器
  private createSessionAuthQueryBuilder() {
    return this.authSessions
      .createQueryBuilder("session")
      .leftJoinAndSelect("session.user", "user")
      .leftJoinAndSelect("user.roles", "role")
      .leftJoinAndSelect("role.permissions", "permission");
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 获取访问令牌签名配置
  private getAccessTokenOptions(): JwtSignOptions {
    const authEnvironment = getAuthEnvironment(this.configService);

    return {
      secret: authEnvironment.accessTokenSecret,
      expiresIn:
        authEnvironment.accessTokenExpiresIn as JwtSignOptions["expiresIn"],
    };
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 获取刷新令牌签名配置
  private getRefreshTokenOptions(): JwtSignOptions {
    const authEnvironment = getAuthEnvironment(this.configService);

    return {
      secret: authEnvironment.refreshTokenSecret,
      expiresIn:
        authEnvironment.refreshTokenExpiresIn as JwtSignOptions["expiresIn"],
    };
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 构建访问令牌载荷
  private buildAccessTokenPayload(
    user: User,
    sessionId: string,
  ): AuthTokenPayload {
    const activeRoles = user.roles?.filter((role) => role.status) ?? [];
    const roles = activeRoles.map((role) => role.roleName);
    const permissions = Array.from(
      new Set(
        activeRoles
          .flatMap((role) => role.permissions ?? [])
          .filter((permission) => permission?.status)
          .map((permission) => permission.code),
      ),
    );
    return {
      type: ACCESS_TOKEN_TYPE,
      sub: user.id,
      sid: sessionId,
      username: user.username,
      roles,
      permissions,
    };
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 构建刷新令牌载荷
  private buildRefreshTokenPayload(
    userId: number,
    sessionId: string,
  ): RefreshTokenPayload {
    return {
      type: REFRESH_TOKEN_TYPE,
      sub: userId,
      sid: sessionId,
    };
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 抛出登录凭证无效异常
  private throwInvalidCredentials(): never {
    throw new ForbiddenException("用户名或密码错误");
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 抛出刷新令牌无效异常
  private throwInvalidRefreshToken(): never {
    throw new ForbiddenException("刷新令牌无效或已过期");
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 校验用户状态
  private ensureUserIsActive(user: Pick<User, "status">): void {
    if (!user.status) {
      throw new ForbiddenException("账户已被禁用");
    }
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 提取令牌过期时间
  private extractTokenExpiration(token: string): Date {
    const payload: unknown = this.jwtService.decode(token);
    if (!payload || typeof payload !== "object" || payload === null) {
      throw new ForbiddenException("刷新令牌生成失败");
    }

    const exp = (payload as { exp?: unknown }).exp;
    if (typeof exp !== "number") {
      throw new ForbiddenException("刷新令牌生成失败");
    }

    return new Date(exp * 1000);
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 签发访问令牌和刷新令牌
  private async issueTokens(
    user: User,
    sessionId: string = randomUUID(),
  ): Promise<IssuedAuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        this.buildAccessTokenPayload(user, sessionId),
        this.getAccessTokenOptions(),
      ),
      this.jwtService.signAsync(
        this.buildRefreshTokenPayload(user.id, sessionId),
        this.getRefreshTokenOptions(),
      ),
    ]);

    return {
      sessionId,
      accessToken,
      refreshToken,
      refreshTokenHash: await argon2.hash(refreshToken),
      refreshTokenExpiresAt: this.extractTokenExpiration(refreshToken),
    };
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 构建会话持久化数据
  private buildSessionPersistencePayload(
    userId: number,
    tokens: IssuedAuthTokens,
    context: AuthRequestContext,
  ) {
    return {
      id: tokens.sessionId,
      userId,
      refreshTokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
      lastUsedAt: new Date(),
      ip: context.ip,
      userAgent: context.userAgent,
    };
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 查询登录用户
  private findUserForLogin(username: string) {
    return this.createUserAuthQueryBuilder()
      .addSelect("user.password")
      .where("user.username = :username", { username })
      .getOne();
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 查询刷新会话
  private findSessionForRefresh(userId: number, sessionId: string) {
    return this.createSessionAuthQueryBuilder()
      .addSelect("session.refreshTokenHash")
      .where("session.id = :sessionId", { sessionId })
      .andWhere("session.userId = :userId", { userId })
      .getOne();
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 保存登录会话
  private async saveSession(
    userId: number,
    tokens: IssuedAuthTokens,
    context: AuthRequestContext,
  ): Promise<void> {
    await this.authSessions.save(
      this.authSessions.create({
        ...this.buildSessionPersistencePayload(userId, tokens, context),
      }),
    );
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 签发并保存会话令牌
  private async issueSessionTokens(
    user: User,
    context: AuthRequestContext,
    sessionId?: string,
  ): Promise<AuthTokens> {
    const tokens = await this.issueTokens(user, sessionId);
    await this.saveSession(user.id, tokens, context);
    return this.toAuthTokens(tokens);
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 校验登录用户
  private async validateLoginUser(
    user: User | null,
    password: string,
  ): Promise<User> {
    if (!user || typeof user.password !== "string" || !user.password.trim()) {
      this.throwInvalidCredentials();
    }
    if (!(await argon2.verify(user.password, password))) {
      this.throwInvalidCredentials();
    }
    this.ensureUserIsActive(user);
    return user;
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 校验刷新会话
  private async validateRefreshSession(
    userId: number,
    sessionId: string,
    refreshToken: string,
  ): Promise<AuthSession> {
    const session = await this.findSessionForRefresh(userId, sessionId);
    if (!session?.refreshTokenHash) {
      this.throwInvalidRefreshToken();
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      this.throwInvalidRefreshToken();
    }
    this.ensureUserIsActive(session.user);
    if (!(await argon2.verify(session.refreshTokenHash, refreshToken))) {
      this.throwInvalidRefreshToken();
    }
    return session;
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 转换认证令牌返回结构
  private toAuthTokens(tokens: IssuedAuthTokens): AuthTokens {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 创建用户
  private async createUser(dto: RegisterDto): Promise<User> {
    try {
      return await this.users.save(
        this.users.create({
          username: dto.username,
          password: await argon2.hash(dto.password),
          profile: { nickname: dto.username },
        }),
      );
    } catch (error) {
      rethrowDatabaseError(error, { unique: "当前用户名已被注册" });
      throw error;
    }
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 用户注册
  async register(
    dto: RegisterDto,
    context: AuthRequestContext,
  ): Promise<AuthTokens> {
    if (dto.confirmPassword && dto.password !== dto.confirmPassword) {
      throw new BadRequestException("两次输入的密码不一致");
    }

    const user = await this.createUser(dto);
    return this.issueSessionTokens(user, context);
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 用户登录
  async login(dto: LoginDto, context: AuthRequestContext): Promise<AuthTokens> {
    const user = await this.validateLoginUser(
      await this.findUserForLogin(dto.username),
      dto.password,
    );
    return this.issueSessionTokens(user, context);
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 刷新登录令牌
  async refresh(
    user: RefreshTokenUser,
    context: AuthRequestContext,
  ): Promise<AuthTokens> {
    const session = await this.validateRefreshSession(
      user.userId,
      user.sessionId,
      user.refreshToken,
    );
    return this.issueSessionTokens(session.user, context, session.id);
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 退出当前登录
  async logout(user: AuthUser): Promise<string> {
    await this.authSessions.delete({ id: user.sessionId, userId: user.userId });
    return "退出成功";
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 退出全部登录会话
  async logoutAll(user: AuthUser): Promise<string> {
    await this.authSessions.delete({ userId: user.userId });
    return "退出成功";
  }
  // --------------------------------------------------------------------------------------------------
}
