import { IsString, Length } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @Length(6, 20, { message: "用户名长度应在$constraint1到$constraint2之间" })
  username: string;
  @IsString()
  @Length(6, 20, { message: "密码长度应在$constraint1到$constraint2之间" })
  password: string;
  confirmPassword: string;
}
