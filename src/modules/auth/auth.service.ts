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
  /**
   * 用户注册
   * @param registerUserDto 用户注册数据
   */
  async signup(registerUserDto: RegisterUserDto) {
    if (registerUserDto.password !== registerUserDto.confirmPassword) {
      throw new UnauthorizedException("两次输入的密码不一致");
    }
    const user = this.userRepository.create(registerUserDto);
    await this.userRepository.save(user);
    return {
      code: 201,
      message: "用户注册成功",
      data: null,
    };
  }
  /**
   * 用户登录
   * @param loginUserDto 用户登录数据
   */
  async signin(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOneBy({
      username: loginUserDto.username,
    });
    if (user && user.password === loginUserDto.password) {
      const token = await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
      });
      return { token };
    }
    throw new UnauthorizedException("用户名或密码错误");
  }
}
