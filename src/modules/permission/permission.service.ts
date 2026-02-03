import { Injectable } from "@nestjs/common";
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
  create(createPermissionDto: CreatePermissionDto) {
    return this.permissionRepository.save(createPermissionDto);
  }
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

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return this.permissionRepository.update(id, updatePermissionDto);
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
  getPermissionsByToken(userId: number) {
    return this.permissionRepository
      .createQueryBuilder("permission")
      .leftJoin("permission.roles", "role")
      .leftJoin("role.users", "user")
      .where("user.id = :userId", { userId })
      .getMany();
  }
}
