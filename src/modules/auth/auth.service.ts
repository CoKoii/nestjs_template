import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import type { SigninUserDto } from "./dto/signin-user.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  /**
   * 用户注册
   * @param createUserDto 用户数据
   */
  async signup(signinUserDto: SigninUserDto) {
    const user = this.userRepository.create(signinUserDto);
    await this.userRepository.save(user);
    return {
      code: 201,
      message: "用户注册成功",
      data: null,
    };
  }
  /**
   * 用户登录
   * @param signinUserDto 用户数据
   */
  async signin(signinUserDto: SigninUserDto) {
    await this.userRepository.findOneByOrFail({
      username: signinUserDto.username,
      password: signinUserDto.password,
    });
    return {
      code: 200,
      message: "用户登录成功",
      data: null,
    };
  }
}
