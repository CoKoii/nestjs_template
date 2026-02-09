import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../roles/entities/role.entity";
import { QueryUsersDto } from "./dto/query-users.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

type QueryUsersResponse = {
  items: User[];
  total: number;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  // ----------------------------------------------------------------------
  // 获取用户列表 - 分页查询 - nickname 模糊搜索
  async findAll(query: QueryUsersDto): Promise<QueryUsersResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.pageSize) || 10);
    const nickname = query.nickname?.trim();
    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .distinct(true)
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
  // ----------------------------------------------------------------------
  // 更新用户信息 包括关联的 profile 和 roles
  async update(id: number, updateUserDto: UpdateUserDto): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["profile", "roles"],
    });
    if (!user) throw new NotFoundException("用户不存在");
    if (user.profile && updateUserDto.profile) {
      Object.assign(user.profile, updateUserDto.profile);
    }
    if (Array.isArray(updateUserDto.roles)) {
      user.roles = updateUserDto.roles.map(
        (roleId) => ({ id: roleId }) as Role,
      );
    }
    await this.userRepository.save(user);
    return "更新成功";
  }
  // ----------------------------------------------------------------------
}
