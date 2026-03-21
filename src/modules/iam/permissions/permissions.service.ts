import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  type PageResult,
  resolvePageQuery,
} from "../../../common/http/page-query.dto";
import { rethrowDatabaseError } from "../../../common/database/database-error.util";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import type { QueryPermissionsDto } from "./dto/query-permissions.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { Permission } from "./permission.entity";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      await this.permissionRepository.save(createPermissionDto);
      return "创建成功";
    } catch (error) {
      rethrowDatabaseError(error, {
        unique: `权限码 "${createPermissionDto.code}" 已存在`,
      });
    }
  }

  async list(query: QueryPermissionsDto): Promise<PageResult<Permission>> {
    const { page, pageSize, skip } = resolvePageQuery(query);
    const code = query.code?.trim();
    const queryBuilder = this.permissionRepository
      .createQueryBuilder("permission")
      .orderBy("permission.id", "DESC")
      .skip(skip)
      .take(pageSize);

    if (code) {
      queryBuilder.andWhere("permission.code LIKE :code", {
        code: `%${code}%`,
      });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    try {
      const permission = await this.permissionRepository.preload({
        id,
        ...updatePermissionDto,
      });
      if (!permission) throw new NotFoundException("权限不存在");
      await this.permissionRepository.save(permission);
      return "更新成功";
    } catch (error) {
      const duplicateMessage = updatePermissionDto.code
        ? `权限码 "${updatePermissionDto.code}" 已存在`
        : "权限码已存在";
      rethrowDatabaseError(error, {
        unique: duplicateMessage,
      });
    }
  }

  listMine(permissions: string[] = []) {
    return Array.from(new Set(permissions)).sort((left, right) =>
      left.localeCompare(right),
    );
  }
}
