import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  private signToken = (user: User) =>
    this.jwtService.signAsync({ sub: user.id, username: user.username });
  /**
   * 用户注册
   * @param registerUserDto 用户注册数据
   */
  async signup(registerUserDto: RegisterUserDto) {
    if (registerUserDto.password !== registerUserDto.confirmPassword)
      throw new UnauthorizedException("两次输入的密码不一致");
    const existingUser = await this.userRepository.findOneBy({
      username: registerUserDto.username,
    });
    if (existingUser) throw new UnauthorizedException("当前用户名已被注册");
    const user = await this.userRepository.save(
      this.userRepository.create(registerUserDto),
    );
    return { token: await this.signToken(user) };
  }
  /**
   * 用户登录
   * @param loginUserDto 用户登录数据
   */
  async signin(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOneBy({
      username: loginUserDto.username,
    });
    if (!user || user.password !== loginUserDto.password)
      throw new UnauthorizedException("用户名或密码错误");
    return { token: await this.signToken(user) };
  }
}
