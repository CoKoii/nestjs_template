import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../shared/pagination/pagination-query.dto";

export class QueryUsersDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: "昵称必须为字符串" })
  nickname?: string;
}
