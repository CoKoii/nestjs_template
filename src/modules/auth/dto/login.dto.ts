import { Equals, IsBoolean, IsOptional } from "class-validator";

export class LoginDto {
  username: string;
  password: string;
  @IsOptional()
  @IsBoolean({ message: "captcha 必须为布尔值" })
  @Equals(true, { message: "请先完成人机验证" })
  captcha?: boolean;
}
