import { Body, Controller, Get, Param, Put, Query } from "@nestjs/common";
import { FindAllUserDto } from "./dto/find-all-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}
  // ----------------------------------------------------------------------
  // 获取用户列表
  @Get()
  findAll(@Query() query: FindAllUserDto) {
    return this.userService.findAll(query);
  }
  // ----------------------------------------------------------------------
  // 更新用户信息
  @Put(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }
  // ----------------------------------------------------------------------
}
