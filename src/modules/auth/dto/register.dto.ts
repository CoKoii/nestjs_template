import { Equals, IsString, Length } from "class-validator";

export class RegisterDto {
  @IsString()
  @Length(6, 20, { message: "用户名长度应在$constraint1到$constraint2之间" })
  username: string;
  @IsString()
  @Length(6, 20, { message: "密码长度应在$constraint1到$constraint2之间" })
  password: string;
  @IsString()
  @Length(6, 20, { message: "确认密码长度应在$constraint1到$constraint2之间" })
  confirmPassword: string;
  @Equals(true, { message: "请同意用户协议和隐私政策" })
  agreePolicy: boolean;
}
