import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>, private readonly jwtService: JwtService) {}
  private signToken = (user: User) => this.jwtService.signAsync({ sub: user.id, username: user.username });
  async signup(dto: RegisterUserDto) {
    if (dto.password !== dto.confirmPassword) throw new UnauthorizedException("两次输入的密码不一致");
    if (await this.users.findOneBy({ username: dto.username })) throw new UnauthorizedException("当前用户名已被注册");
    const user = await this.users.save(this.users.create(dto));
    return { token: await this.signToken(user) };
  }
  async signin(dto: LoginUserDto) {
    const user = await this.users.findOneBy({ username: dto.username });
    if (!user || user.password !== dto.password) throw new UnauthorizedException("用户名或密码错误");
    return { token: await this.signToken(user) };
  }
}
