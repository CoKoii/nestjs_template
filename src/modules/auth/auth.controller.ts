import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post("/signin")
  signin(@Body() createUserDto: CreateUserDto) {
    return this.authService.signin(createUserDto);
  }
  @Post("/signup")
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }
}
