import { Controller, Delete, Get, Param, Query } from "@nestjs/common";
import { FindAllUserDto } from "./dto/find-all-user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get() findAll(@Query() query: FindAllUserDto) {
    return this.userService.findAll(query);
  }
  @Get(":id") findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Delete(":id") remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
