import { Type } from "class-transformer";
import { IsNumber, ValidateNested } from "class-validator";
import { UpdateProfileDto } from "../../profile/dto/update-profile.dto";

export class UpdateUserDto {
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  profile: UpdateProfileDto;
  @IsNumber({}, { each: true, message: "角色ID必须为数字数组" })
  roles: number[];
}
