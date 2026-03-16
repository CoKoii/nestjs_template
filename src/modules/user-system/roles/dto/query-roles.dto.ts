import { IsOptional, IsString } from "class-validator";

export class QueryRolesDto {
  @IsOptional()
  @IsString({ message: "角色名称必须为字符串" })
  roleName?: string;
}
