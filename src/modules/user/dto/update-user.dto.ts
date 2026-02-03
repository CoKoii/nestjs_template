import { Type } from "class-transformer";
import { IsNumber, IsString, Length, ValidateNested } from "class-validator";

class ProfileDto {
  @IsString()
  @Length(6, 20, { message: "用户名长度应在$constraint1到$constraint2之间" })
  nickname: string;
}

export class UpdateUserDto {
  @ValidateNested()
  @Type(() => ProfileDto)
  profile: ProfileDto;
  @IsNumber({}, { each: true, message: "角色ID必须为数字数组" })
  roles: number[];
}
