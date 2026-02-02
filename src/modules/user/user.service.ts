import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { FindAllUserDto } from "./dto/find-all-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}
  async findAll(body: FindAllUserDto) {
    const page = Math.max(1, Number(body.page) || 1);
    const pageSize = Math.max(1, Number(body.pageSize) || 10);
    const username = body.username?.trim();
    const query = this.users
      .createQueryBuilder("user")
      .orderBy("user.id", "DESC");
    if (username) {
      query.andWhere("user.username LIKE :username", {
        username: `%${username}%`,
      });
    }
    query.skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await query.getManyAndCount();
    return {
      items,
      total,
    };
  }
  findOne(id: number) {
    return this.users.findOneBy({ id });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
