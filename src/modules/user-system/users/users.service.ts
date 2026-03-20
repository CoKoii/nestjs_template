import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  type PaginatedResult,
  resolvePagination,
} from "../../../shared/pagination/pagination-query.dto";
import { throwMySqlError } from "../../../infrastructure/persistence/mysql/mysql-error.util";
import { Role } from "../roles/entities/role.entity";
import { QueryUsersDto } from "./dto/query-users.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: QueryUsersDto): Promise<PaginatedResult<User>> {
    const { pageSize, skip } = resolvePagination(query);
    const nickname = query.nickname?.trim();
    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .distinct(true)
      .leftJoinAndSelect("user.profile", "profile")
      .leftJoinAndSelect("user.roles", "role")
      .leftJoinAndSelect("role.permissions", "permission")
      .orderBy("user.id", "DESC")
      .skip(skip)
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
    if (!user) throw new NotFoundException("用户不存在");

    const { profile, roles, ...rest } = updateUserDto;
    if (profile) {
      user.profile = { ...user.profile, ...profile } as User["profile"];
    }
    Object.assign(user, rest);
    if (roles !== undefined) {
      user.roles = roles.map((roleId) => ({ id: roleId }) as Role);
    }
    try {
      await this.userRepository.save(user);
    } catch (error) {
      throwMySqlError(error, { foreignKeyConstraint: "角色不存在" });
    }
    return "更新成功";
  }
}
