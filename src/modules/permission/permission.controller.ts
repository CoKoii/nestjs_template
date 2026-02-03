import {
  Body,
  Controller,
  Delete,
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
  // 根据token返回用户权限列表
  @Get("token")
  getPermissionsByToken(@Req() req: { user: { userId: number } }) {
    return this.permissionService.getPermissionsByToken(req.user.userId);
  }
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  findAll(@Query() query: FindAllPermissionDto) {
    return this.permissionService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.permissionService.findOne(+id);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(+id, updatePermissionDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.permissionService.remove(+id);
  }
}
