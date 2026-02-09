import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from "@nestjs/common";
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
  getPermissionsByToken(@Req() req: { user: { permissions: string[] } }) {
    return this.permissionService.getPermissionsByToken(req.user.permissions);
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
    @Param("id") id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(+id, updatePermissionDto);
  }
  // ----------------------------------------------------------------------
}
