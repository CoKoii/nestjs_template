import { IsNotEmpty, Length, Matches } from "class-validator";

export class CreateRoleDto {
  @IsNotEmpty({ message: "角色名称不能为空" })
  @Matches(/^\S+$/, { message: "角色名称不能包含空格" })
  @Length(2, 20, { message: "角色名称长度必须在2到20个字符之间" })
  roleName: string;
  description?: string;
  status?: boolean;
  permissions?: number[];
}
