import { IsNumber, IsString, Length } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @Length(6, 20, { message: "用户名长度应在$constraint1到$constraint2之间" })
  username: string;
  @IsNumber({}, { each: true, message: "角色ID必须为数字数组" })
  roles: number[];
}
