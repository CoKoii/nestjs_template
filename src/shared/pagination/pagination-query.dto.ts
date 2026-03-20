import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;

export class PaginationQueryDto {
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
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export const resolvePagination = (query: PaginationQueryDto) => {
  const page = query.page ?? DEFAULT_PAGE;
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
};
