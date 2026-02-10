import { IsOptional, IsString } from "class-validator";

export class QueryPermissionsDto {
  @IsOptional()
  @IsString({ message: "权限代码必须为字符串" })
  code?: string;
}
