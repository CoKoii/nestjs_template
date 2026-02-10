import { IsString, Length } from "class-validator";

export class CreateProfileDto {
  @IsString()
  @Length(1, 20, { message: "用户名长度应在$constraint1到$constraint2之间" })
  nickname: string;
}
