import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../role/entities/role.entity";
import { FindAllUserDto } from "./dto/find-all-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: FindAllUserDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.pageSize) || 10);
    const nickname = query.nickname?.trim();
    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .select(["user.id", "user.username"])
      .leftJoinAndSelect("user.profile", "profile")
      .leftJoinAndSelect("user.roles", "role")
      .leftJoinAndSelect("role.permissions", "permission")
      .orderBy("user.id", "DESC")
      .skip((page - 1) * pageSize)
      .take(pageSize);
    if (nickname) {
      queryBuilder.andWhere("profile.nickname LIKE :nickname", {
        nickname: `%${nickname}%`,
      });
    }
    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["profile", "roles"],
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    if (user.profile) {
      user.profile.nickname = updateUserDto.profile.nickname;
    }

    user.roles = updateUserDto.roles.map((roleId) => ({ id: roleId }) as Role);
    await this.userRepository.save(user);
    return "更新成功";
  }
}
