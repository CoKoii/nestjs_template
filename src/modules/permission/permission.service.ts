import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import type { FindAllPermissionDto } from "./dto/find-all-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { Permission } from "./entities/permission.entity";

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  // ----------------------------------------------------------------------
  // 创建权限
  async create(createPermissionDto: CreatePermissionDto) {
    try {
      await this.permissionRepository.save(createPermissionDto);
      return "创建成功";
    } catch (err) {
      const error = err as { code?: string; errno?: number };
      if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
        throw new ConflictException(
          `权限码 "${createPermissionDto.code}" 已存在`,
        );
      }
      throw err;
    }
  }
  // ----------------------------------------------------------------------
  // 获取权限列表 - code 模糊搜索
  async findAll(query: FindAllPermissionDto) {
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
  // ----------------------------------------------------------------------
  // 更新权限
  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    try {
      const payload: Partial<Permission> = { id };
      if (updatePermissionDto.code !== undefined) {
        payload.code = updatePermissionDto.code;
      }
      if (updatePermissionDto.description !== undefined) {
        payload.description = updatePermissionDto.description;
      }
      if (updatePermissionDto.status !== undefined) {
        payload.status = updatePermissionDto.status;
      }
      const permission = await this.permissionRepository.preload(payload);
      if (!permission) throw new NotFoundException("权限不存在");
      await this.permissionRepository.save(permission);
      return "更新成功";
    } catch (err) {
      const error = err as { code?: string; errno?: number };
      if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
        throw new ConflictException(
          `权限码 "${updatePermissionDto.code}" 已存在`,
        );
      }
      throw err;
    }
  }
  // ----------------------------------------------------------------------
  // 根据token获取权限列表
  getPermissionsByToken(permissions: string[] = []) {
    return permissions;
  }
  // ----------------------------------------------------------------------
}
