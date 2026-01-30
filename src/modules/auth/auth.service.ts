import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { SigninUserDto } from "./dto/signin-user.dto";
import { SignupUserDto } from "./dto/signup-user.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  /**
   * 用户注册
   * @param signupUserDto 用户数据
   */
  async signup(signupUserDto: SignupUserDto) {
    if (signupUserDto.password !== signupUserDto.confirmPassword) {
      throw new UnauthorizedException("两次输入的密码不一致");
    }
    const user = this.userRepository.create(signupUserDto);
    await this.userRepository.save(user);
    return {
      code: 201,
      message: "用户注册成功",
      data: null,
    };
  }
  /**
   * 用户登录
   * @param signupUserDto 用户数据
   */
  async signin(signinUserDto: SigninUserDto) {
    const user = await this.userRepository.findOneBy({
      username: signinUserDto.username,
    });
    if (user && user.password === signinUserDto.password) {
      const token = this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
      });
      return {
        token: await token,
      };
    }
    throw new UnauthorizedException("用户名或密码错误");
  }
}
