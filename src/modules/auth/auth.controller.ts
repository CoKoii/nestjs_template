import { Body, Controller, Post } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post("login")
  signin(@Body() dto: LoginUserDto) { return this.authService.signin(dto); }
  @Public()
  @Post("register")
  signup(@Body() dto: RegisterUserDto) { return this.authService.signup(dto); }
}
