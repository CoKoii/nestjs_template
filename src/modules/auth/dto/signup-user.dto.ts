import { Equals } from "class-validator";

export class SignupUserDto {
  username: string;

  password: string;

  @Equals(true, { message: "请同意用户协议和隐私政策" })
  agreePolicy: boolean;

  confirmPassword: string;
}
