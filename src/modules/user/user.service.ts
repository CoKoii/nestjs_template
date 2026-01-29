import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 用户注册
   * @param createUserDto 注册用户数据
   */
  async create(createUserDto: CreateUserDto) {
    await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        username: createUserDto.username,
        password: createUserDto.password,
      })
      .execute();

    return {
      code: 201,
      message: "用户注册成功",
    };
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user, with data: ${JSON.stringify(
      updateUserDto,
    )}`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
