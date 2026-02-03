import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Profile } from "./entities/profile.entity";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}
  async findOne(userId: number) {
    const profile = await this.profileRepository
      .createQueryBuilder("profile")
      .leftJoinAndSelect("profile.user", "user")
      .leftJoinAndSelect("user.roles", "roles")
      .where("user.id = :userId", { userId })
      .getOne();

    if (!profile) {
      throw new UnauthorizedException("用户资料不存在");
    }

    const { user, ...profileData } = profile;
    return {
      ...profileData,
      roles: user?.roles || [],
    };
  }
}
