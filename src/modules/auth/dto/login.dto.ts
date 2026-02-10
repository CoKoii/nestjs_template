import { Equals, IsOptional } from "class-validator";

export class LoginDto {
  username: string;
  password: string;
  @IsOptional()
  @Equals(true, { message: "请先完成人机验证" })
  captcha?: boolean;
}
