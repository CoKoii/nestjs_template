import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FindAllUserDto } from "./dto/find-all-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}
  async findAll(query: FindAllUserDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.pageSize) || 10);
    const username = query.username?.trim();
    const queryBuilder = this.users
      .createQueryBuilder("user")
      .orderBy("user.id", "DESC");
    if (username) {
      queryBuilder.andWhere("user.username LIKE :username", {
        username: `%${username}%`,
      });
    }
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await queryBuilder.getManyAndCount();
    return {
      items,
      total,
    };
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password !== updateUserDto.confirmPassword) {
      throw new Error("两次输入的密码不一致");
    }
    await this.users.update(id, {
      username: updateUserDto.username,
      password: updateUserDto.password,
    });
    return "更新成功";
  }
}
