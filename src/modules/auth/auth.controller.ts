import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SigninUserDto } from "./dto/signin-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post("/signin")
  signin(@Body() signinUserDto: SigninUserDto) {
    return this.authService.signin(signinUserDto);
  }
  @Post("/signup")
  signup(@Body() signinUserDto: SigninUserDto) {
    return this.authService.signup(signinUserDto);
  }
}
