import { Equals, IsNotEmpty, IsString, Length } from "class-validator";

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, { message: "用户名长度应在$constraint1到$constraint2之间" })
  username: string;
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, { message: "密码长度应在$constraint1到$constraint2之间" })
  password: string;
  @Equals(true, { message: "请同意用户协议和隐私政策" })
  agreePolicy: boolean;
  confirmPassword: string;
}
