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
import { type AuthUser } from "../../../common/auth/auth-user";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { Roles } from "../../../common/auth/roles.decorator";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { QueryPermissionsDto } from "./dto/query-permissions.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { PermissionsService } from "./permissions.service";

@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // -------------------------
  // 获取当前用户权限
  @Get("me")
  listMine(@CurrentUser() user: AuthUser) {
    return this.permissionsService.listMine(user.permissions);
  }
  // -------------------------

  // -------------------------
  // 创建权限
  @Roles("admin")
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }
  // -------------------------

  // -------------------------
  // 获取权限列表
  @Roles("admin")
  @Get()
  list(@Query() query: QueryPermissionsDto) {
    return this.permissionsService.list(query);
  }
  // -------------------------

  // -------------------------
  // 更新权限
  @Roles("admin")
  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }
  // -------------------------
}
