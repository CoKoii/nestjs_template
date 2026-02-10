import {
  Equals,
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
} from "class-validator";

export class RegisterDto {
  @IsString({ message: "用户名必须为字符串" })
  @Length(6, 20, { message: "用户名长度应在$constraint1到$constraint2之间" })
  username: string;

  @IsString({ message: "密码必须为字符串" })
  @Length(6, 20, { message: "密码长度应在$constraint1到$constraint2之间" })
  password: string;
  @IsNotEmpty({ message: "二次确认密码不能为空" })
  confirmPassword: string;
  @IsBoolean({ message: "是否同意协议必须为布尔值" })
  @Equals(true, { message: "请同意用户协议和隐私政策" })
  agreePolicy: boolean;
}
