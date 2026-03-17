import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { throwMySqlError } from "../../../infrastructure/persistence/mysql/mysql-error.util";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import type { QueryPermissionsDto } from "./dto/query-permissions.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { Permission } from "./entities/permission.entity";

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
      throwMySqlError(error, {
        unique: `权限码 "${createPermissionDto.code}" 已存在`,
      });
    }
  }

  async findAll(query: QueryPermissionsDto) {
    const code = query.code?.trim();
    const queryBuilder = this.permissionRepository
      .createQueryBuilder("permission")
      .orderBy("permission.id", "DESC");
    if (code) {
      queryBuilder.andWhere("permission.code LIKE :code", {
        code: `%${code}%`,
      });
    }
    const [items, total] = await queryBuilder.getManyAndCount();
    return {
      items,
      total,
    };
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
      throwMySqlError(error, {
        unique: duplicateMessage,
      });
    }
  }

  getPermissionsByToken(permissions: string[] = []) {
    return permissions;
  }
}
