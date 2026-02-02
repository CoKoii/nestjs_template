import { Injectable } from "@nestjs/common";
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
    await this.roleRepository.save(createRoleDto);
    return "创建成功";
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
    await this.roleRepository.update(id, updateRoleDto);
    return "更新成功";
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
