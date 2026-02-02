import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { CreateRoleDto } from "./dto/create-role.dto";
import type { FindAllRoleDto } from "./dto/find-all-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Role } from "./entities/role.entity";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    try {
      await this.roleRepository.save(createRoleDto);
      return "创建成功";
    } catch (err) {
      const error = err as { code?: string; errno?: number };
      if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
        throw new ConflictException("角色名称已存在");
      }
      throw err;
    }
  }

  async findAll(query: FindAllRoleDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.pageSize) || 10);
    const roleName = query.roleName?.trim();
    const queryBuilder = this.roleRepository
      .createQueryBuilder("role")
      .orderBy("role.id", "DESC");
    if (roleName) {
      queryBuilder.andWhere("role.roleName LIKE :roleName", {
        roleName: `%${roleName}%`,
      });
    }
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await queryBuilder.getManyAndCount();
    return {
      items,
      total,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      await this.roleRepository.update(id, updateRoleDto);
      return "更新成功";
    } catch (err) {
      const error = err as { code?: string; errno?: number };
      if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
        throw new ConflictException("角色名称已存在");
      }
      throw err;
    }
  }

  async remove(id: number) {
    await this.roleRepository.delete(id);
    return "删除成功";
  }
}
