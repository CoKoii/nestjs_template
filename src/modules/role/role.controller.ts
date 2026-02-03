import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { FindAllRoleDto } from "./dto/find-all-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RoleService } from "./role.service";

@Controller("role")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  // ----------------------------------------------------------------------
  // 创建角色
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  // ----------------------------------------------------------------------
  // 获取角色列表
  @Get()
  findAll(@Query() query: FindAllRoleDto) {
    return this.roleService.findAll(query);
  }

  // ----------------------------------------------------------------------
  // 更新角色
  @Put(":id")
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }
  // ----------------------------------------------------------------------
}
