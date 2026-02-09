import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { QueryRolesDto } from "./dto/query-roles.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RolesService } from "./roles.service";

@Controller("roles")
export class RolesController {
  constructor(private readonly roleService: RolesService) {}
  // ----------------------------------------------------------------------
  // 创建角色
  @Post()
  create(
    @Body() createRoleDto: CreateRoleDto,
  ): ReturnType<RolesService["create"]> {
    return this.roleService.create(createRoleDto);
  }

  // ----------------------------------------------------------------------
  // 获取角色列表
  @Get()
  findAll(@Query() query: QueryRolesDto): ReturnType<RolesService["findAll"]> {
    return this.roleService.findAll(query);
  }

  // ----------------------------------------------------------------------
  // 更新角色
  // @Roles("隐官")
  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): ReturnType<RolesService["update"]> {
    return this.roleService.update(+id, updateRoleDto);
  }
  // ----------------------------------------------------------------------
}
