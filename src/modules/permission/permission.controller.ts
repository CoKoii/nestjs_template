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
import { FindAllPermissionDto } from "./dto/find-all-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { PermissionService } from "./permission.service";

@Controller("permission")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  // ----------------------------------------------------------------------
  // 根据token返回用户权限列表
  @Get("token")
  getPermissionsByToken(@Req() req: { user: { userId: number } }) {
    return this.permissionService.getPermissionsByToken(req.user.userId);
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
  findAll(@Query() query: FindAllPermissionDto) {
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
