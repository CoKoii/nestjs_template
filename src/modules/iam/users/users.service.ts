import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  type PageResult,
  resolvePageQuery,
} from "../../../common/http/page-query.dto";
import { rethrowDatabaseError } from "../../../common/database/database-error.util";
import { Role } from "../roles/role.entity";
import { QueryUsersDto } from "./dto/query-users.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  // --------------------------------------------------------------------------------------------------
  // 获取用户列表
  async list(query: QueryUsersDto): Promise<PageResult<User>> {
    const { page, pageSize, skip } = resolvePageQuery(query);
    const nickname = query.nickname?.trim();
    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .distinct(true)
      .leftJoinAndSelect("user.profile", "profile")
      .leftJoinAndSelect("user.roles", "role")
      .orderBy("user.id", "DESC")
      .skip(skip)
      .take(pageSize);

    if (nickname) {
      queryBuilder.andWhere("profile.nickname LIKE :nickname", {
        nickname: `%${nickname}%`,
      });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total, page, pageSize };
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 更新用户
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["profile", "roles"],
    });
    if (!user) throw new NotFoundException("用户不存在");

    const { profile, roles, ...rest } = updateUserDto;
    if (profile) {
      user.profile = {
        ...(user.profile ?? { nickname: user.username }),
        ...profile,
      } as User["profile"];
    }
    Object.assign(user, rest);
    if (roles !== undefined) {
      user.roles = Array.from(new Set(roles)).map(
        (roleId) => ({ id: roleId }) as Role,
      );
    }
    try {
      await this.userRepository.save(user);
    } catch (error) {
      rethrowDatabaseError(error, { foreignKeyConstraint: "角色不存在" });
    }
    return "更新成功";
  }
  // --------------------------------------------------------------------------------------------------
}
