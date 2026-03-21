import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { Roles } from "../../../common/auth/roles.decorator";
import { CreateRoleDto } from "./dto/create-role.dto";
import { QueryRolesDto } from "./dto/query-roles.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RolesService } from "./roles.service";

@Roles("admin")
@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // -------------------------
  // 创建角色
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }
  // -------------------------

  // -------------------------
  // 获取角色列表
  @Get()
  list(@Query() query: QueryRolesDto) {
    return this.rolesService.list(query);
  }
  // -------------------------

  // -------------------------
  // 更新角色
  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }
  // -------------------------
}
