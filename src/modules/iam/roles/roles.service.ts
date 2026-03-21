import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  type PageResult,
  resolvePageQuery,
} from "../../../common/http/page-query.dto";
import { rethrowDatabaseError } from "../../../common/database/database-error.util";
import { CreateRoleDto } from "./dto/create-role.dto";
import { QueryRolesDto } from "./dto/query-roles.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Role } from "./role.entity";

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  private buildRolePayload(dto: CreateRoleDto | UpdateRoleDto): Partial<Role> {
    const payload: Partial<Role> = {};

    if (dto.roleName !== undefined) {
      payload.roleName = dto.roleName;
    }
    if (dto.description !== undefined) {
      payload.description = dto.description;
    }
    if (dto.status !== undefined) {
      payload.status = dto.status;
    }

    if (dto.permissions !== undefined) {
      payload.permissions = Array.from(new Set(dto.permissions)).map(
        (permissionId) => ({ id: permissionId }) as Role["permissions"][number],
      );
    }

    return payload;
  }

  async create(createRoleDto: CreateRoleDto) {
    try {
      await this.roleRepository.save(
        this.roleRepository.create(this.buildRolePayload(createRoleDto)),
      );
      return "创建成功";
    } catch (error) {
      rethrowDatabaseError(error, {
        unique: "角色名称已存在",
        foreignKeyConstraint: "权限不存在",
      });
    }
  }

  async list(query: QueryRolesDto): Promise<PageResult<Role>> {
    const { page, pageSize, skip } = resolvePageQuery(query);
    const roleName = query.roleName?.trim();
    const queryBuilder = this.roleRepository
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.permissions", "permission")
      .orderBy("role.id", "DESC")
      .skip(skip)
      .take(pageSize);

    if (roleName) {
      queryBuilder.andWhere("role.roleName LIKE :roleName", {
        roleName: `%${roleName}%`,
      });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      const role = await this.roleRepository.preload({
        id,
        ...this.buildRolePayload(updateRoleDto),
      });
      if (!role) throw new NotFoundException("角色不存在");
      await this.roleRepository.save(role);
      return "更新成功";
    } catch (error) {
      rethrowDatabaseError(error, {
        unique: "角色名称已存在",
        foreignKeyConstraint: "权限不存在",
      });
    }
  }
}
