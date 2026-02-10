import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "页码必须为整数" })
  @Min(1, { message: "页码最小为1" })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "每页条数必须为整数" })
  @Min(1, { message: "每页条数最小为1" })
  @Max(100, { message: "每页条数最大为100" })
  pageSize?: number;

  @IsOptional()
  @IsString({ message: "昵称必须为字符串" })
  nickname?: string;
}
