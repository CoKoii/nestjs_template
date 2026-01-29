import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import type { CreateUserDto } from "../user/dto/create-user.dto";
import { User } from "../user/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  /**
   * 用户注册
   * @param createUserDto 用户数据
   */
  async signup(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      return {
        code: 201,
        message: "用户注册成功",
        data: null,
      };
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === "ER_DUP_ENTRY") {
        throw new HttpException("用户名已存在，请更换", 400);
      }
      if (err.code === "ER_NO_DEFAULT_FOR_FIELD") {
        throw new HttpException("缺少必填字段", 400);
      }
      throw error;
    }
  }
  /**
   * 用户登录
   * @param createUserDto 用户数据
   */
  async signin(createUserDto: CreateUserDto) {
    try {
      await this.userRepository.findOneByOrFail({
        username: createUserDto.username,
        password: createUserDto.password,
      });
      return {
        code: 200,
        message: "用户登录成功",
        data: null,
      };
    } catch (error) {
      const err = error as { code?: string; name?: string };
      if (err.code === "ER_NO_DEFAULT_FOR_FIELD") {
        throw new HttpException("缺少必填字段", 400);
      }
      if (err.code === "ER_LOCK_DEADLOCK" || err.name === "EntityNotFound") {
        throw new HttpException("用户名或密码错误", 400);
      }
      throw error;
    }
  }
}
