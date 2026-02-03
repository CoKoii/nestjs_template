import { Body, Controller, Post } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //用户登录接口 不校验token
  @Public()
  @Post("login")
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  //用户注册接口 不校验token
  @Public()
  @Post("register")
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }
}
