import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { Repository } from "typeorm";
import { Profile } from "../profile/entities/profile.entity";
import { User } from "../user/entities/user.entity";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Profile) private readonly profiles: Repository<Profile>,
    private readonly jwtService: JwtService,
  ) {}
  private signToken = (user: User) =>
    this.jwtService.signAsync({ sub: user.id, username: user.username });
  // ----------------------------------------------------------------------
  //用户注册 密码加密
  async register(dto: RegisterUserDto) {
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
    const profile = this.profiles.create({ nickname: dto.username, user });
    await this.profiles.save(profile);
    return { accessToken: await this.signToken(user) };
  }
  // ----------------------------------------------------------------------
  //用户登录 密码验证
  async login(dto: LoginUserDto) {
    const user = await this.users.findOneBy({ username: dto.username });
    if (!user || !(await argon2.verify(user.password, dto.password)))
      throw new ForbiddenException("用户名或密码错误");
    return { accessToken: await this.signToken(user) };
  }
  // ----------------------------------------------------------------------
}
