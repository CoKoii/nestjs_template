import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Profile } from "../profile/entities/profile.entity";
import { User } from "../user/entities/user.entity";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Profile) private readonly profiles: Repository<Profile>,
    private readonly jwtService: JwtService,
  ) {}
  private signToken = (user: User) =>
    this.jwtService.signAsync({ sub: user.id, username: user.username });
  // ----------------------------------------------------------------------
  async register(dto: RegisterUserDto) {
    if (dto.password !== dto.confirmPassword)
      throw new BadRequestException("两次输入的密码不一致");
    if (await this.users.findOneBy({ username: dto.username }))
      throw new BadRequestException("当前用户名已被注册");
    const user = await this.users.save(
      this.users.create({ username: dto.username, password: dto.password }),
    );
    const profile = this.profiles.create({ nickname: dto.username, user });
    await this.profiles.save(profile);
    return { accessToken: await this.signToken(user) };
  }
  // ----------------------------------------------------------------------
  async login(dto: LoginUserDto) {
    const user = await this.users.findOneBy({ username: dto.username });
    if (!user || user.password !== dto.password)
      throw new BadRequestException("用户名或密码错误");
    return { accessToken: await this.signToken(user) };
  }
  // ----------------------------------------------------------------------
}
