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
      .select(["user.id", "user.username"])
      .leftJoinAndSelect("user.roles", "role")
      .leftJoinAndSelect("role.permissions", "permission")
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
    await this.users.save({
      id,
      username: updateUserDto.username,
      roles: updateUserDto.roles.map((rid) => ({ id: rid })),
    });
    return "更新成功";
  }
  async remove(id: number) {
    const user = await this.users.findOne({ where: { id } });
    await this.users.remove(user);
    return "删除成功";
  }
}
