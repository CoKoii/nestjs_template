import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { Repository } from "typeorm";
import type { JwtPayload } from "../../common/types/jwt-payload.type";
import { Profile } from "../profiles/entities/profile.entity";
import { User } from "../users/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

type AuthTokenResponse = { accessToken: string };

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Profile) private readonly profiles: Repository<Profile>,
    private readonly jwtService: JwtService,
  ) {}
  private signToken = async (user: User): Promise<string> => {
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
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      roles,
      permissions,
    };
    return this.jwtService.signAsync(payload);
  };
  // ----------------------------------------------------------------------
  // 用户注册 密码加密
  async register(dto: RegisterDto): Promise<AuthTokenResponse> {
    if (dto.password !== dto.confirmPassword)
      throw new BadRequestException("两次输入的密码不一致");
    if (await this.users.findOneBy({ username: dto.username }))
      throw new BadRequestException("当前用户名已被注册");
    const user = await this.users.save(
      this.users.create({
        username: dto.username,
        password: await argon2.hash(dto.password),
      }),
    );
    await this.profiles.save(
      this.profiles.create({ nickname: dto.username, user }),
    );
    user.roles = [];
    return { accessToken: await this.signToken(user) };
  }

  // ----------------------------------------------------------------------
  // 用户登录 密码验证
  async login(dto: LoginDto): Promise<AuthTokenResponse> {
    const user = await this.users.findOne({
      where: { username: dto.username },
      relations: ["roles", "roles.permissions"],
    });
    if (!user || !(await argon2.verify(user.password, dto.password)))
      throw new ForbiddenException("用户名或密码错误");
    return { accessToken: await this.signToken(user) };
  }
  // ----------------------------------------------------------------------
}
