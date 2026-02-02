import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}
  create(dto: CreateUserDto) {
    return `This action adds a new user, ${JSON.stringify(dto)}`;
  }
  async findAll() {
    return {
      items: await this.users.find(),
      total: await this.users.count(),
    };
  }
  findOne(id: number) {
    return this.users.findOneBy({ id });
  }
  update(id: number, dto: UpdateUserDto) {
    return `This action updates a #${id} user, ${JSON.stringify(dto)}`;
  }
  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
