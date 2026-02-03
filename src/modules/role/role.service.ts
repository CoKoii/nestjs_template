import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateRoleDto } from "./dto/create-role.dto";
import { FindAllRoleDto } from "./dto/find-all-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Role } from "./entities/role.entity";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  // ----------------------------------------------------------------------
  // 创建角色
  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = {
        roleName: createRoleDto.roleName,
        description: createRoleDto.description,
        status: createRoleDto.status,
        permissions: createRoleDto.permissions?.map((pid) => ({ id: pid })),
      };
      await this.roleRepository.save(role);
      return "创建成功";
    } catch (err) {
      const error = err as { code?: string; errno?: number };
      if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
        throw new ConflictException("角色名称已存在");
      }
      throw err;
    }
  }
  // ----------------------------------------------------------------------
  // 获取角色列表 - roleName 模糊搜索
  async findAll(query: FindAllRoleDto) {
    const roleName = query.roleName?.trim();
    const queryBuilder = this.roleRepository
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.permissions", "permission")
      .orderBy("role.id", "DESC");
    if (roleName) {
      queryBuilder.andWhere("role.roleName LIKE :roleName", {
        roleName: `%${roleName}%`,
      });
    }
    const [items, total] = await queryBuilder.getManyAndCount();
    return {
      items,
      total,
    };
  }
  // ----------------------------------------------------------------------
  // 更新角色
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      const role = {
        id,
        roleName: updateRoleDto.roleName,
        description: updateRoleDto.description,
        status: updateRoleDto.status,
        permissions: updateRoleDto.permissions?.map((pid) => ({ id: pid })),
      };
      await this.roleRepository.save(role);
      return "更新成功";
    } catch (err) {
      const error = err as { code?: string; errno?: number };
      if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
        throw new ConflictException("角色名称已存在");
      }
      throw err;
    }
  }
  // ----------------------------------------------------------------------
}
