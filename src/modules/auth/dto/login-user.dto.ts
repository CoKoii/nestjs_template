import { Equals } from "class-validator";

export class LoginUserDto {
  username: string;
  password: string;
  @Equals(true, { message: "请先完成人机验证" })
  captcha?: boolean;
}
