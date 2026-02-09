import { Body, Controller, Get, Param, Put, Query } from "@nestjs/common";
import { QueryUsersDto } from "./dto/query-users.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  // ----------------------------------------------------------------------
  // 获取用户列表
  @Get()
  findAll(@Query() query: QueryUsersDto): ReturnType<UsersService["findAll"]> {
    return this.userService.findAll(query);
  }
  // ----------------------------------------------------------------------
  // 更新用户信息
  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): ReturnType<UsersService["update"]> {
    return this.userService.update(+id, updateUserDto);
  }
  // ----------------------------------------------------------------------
}
