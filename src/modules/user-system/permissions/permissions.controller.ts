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
import { CurrentUser } from "../../../core/auth/decorators/current-user.decorator";
import type { AuthUser } from "../../../core/auth/types/auth-user.type";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { QueryPermissionsDto } from "./dto/query-permissions.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { PermissionsService } from "./permissions.service";

@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}
  // ----------------------------------------------------------------------
  // 根据token返回用户权限列表
  @Get("me")
  getPermissionsByToken(@CurrentUser() user: AuthUser) {
    return this.permissionService.getPermissionsByToken(user.permissions);
  }
  // ----------------------------------------------------------------------
  // 创建权限
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }
  // ----------------------------------------------------------------------
  // 获取权限列表
  @Get()
  findAll(@Query() query: QueryPermissionsDto) {
    return this.permissionService.findAll(query);
  }
  // ----------------------------------------------------------------------
  // 更新权限
  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }
  // ----------------------------------------------------------------------
}
