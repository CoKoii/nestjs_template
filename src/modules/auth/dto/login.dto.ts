import { Equals, IsBoolean, IsOptional, IsString } from "class-validator";

export class LoginDto {
  @IsString({ message: "用户名必须为字符串" })
  username: string;

  @IsString({ message: "密码必须为字符串" })
  password: string;

  @IsOptional()
  @IsBoolean({ message: "captcha 必须为布尔值" })
  @Equals(true, { message: "请先完成人机验证" })
  captcha?: boolean;
}
