import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { UpdateProfileDto } from "../../profiles/dto/update-profile.dto";

export class UpdateUserDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  profile?: UpdateProfileDto;

  @IsOptional()
  @IsArray({ message: "角色ID必须为数组" })
  @Type(() => Number)
  @IsInt({ each: true, message: "角色ID必须为整数数组" })
  roles?: number[];

  @IsOptional()
  @IsBoolean({ message: "状态必须为布尔值" })
  status?: boolean;
}
