import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class CreatePermissionDto {
  @IsString({ message: "权限代码必须为字符串" })
  @Length(1, 20, { message: "权限代码长度必须在1到20个字符之间" })
  code: string;
  description?: string;
  @IsOptional()
  @IsBoolean({ message: "状态必须为布尔值" })
  status?: boolean;
}
