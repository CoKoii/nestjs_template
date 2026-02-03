import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { FindAllRoleDto } from "./dto/find-all-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RoleService } from "./role.service";

@Controller("role")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll(@Query() query: FindAllRoleDto) {
    return this.roleService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.roleService.findOne(+id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }
}
