import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsString,
  Length,
  IsOptional,
  ValidateNested,
} from "class-validator";

class UpdateUserProfileDto {
  @IsOptional()
  @IsString({ message: "昵称必须为字符串" })
  @Length(1, 20, { message: "昵称长度应在$constraint1到$constraint2之间" })
  nickname?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserProfileDto)
  profile?: UpdateUserProfileDto;

  @IsOptional()
  @IsArray({ message: "角色ID必须为数组" })
  @Type(() => Number)
  @IsInt({ each: true, message: "角色ID必须为整数数组" })
  roles?: number[];

  @IsOptional()
  @IsBoolean({ message: "状态必须为布尔值" })
  status?: boolean;
}
