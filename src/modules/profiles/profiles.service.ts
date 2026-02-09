import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Profile } from "./entities/profile.entity";

type CurrentProfile = Omit<Profile, "user"> & {
  roles: string[];
  permissions: string[];
};

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}
  // ----------------------------------------------------------------------
  // 根据token用户资料及其角色信息
  async findOne(
    userId: number,
    roles: string[] = [],
    permissions: string[] = [],
  ): Promise<CurrentProfile> {
    const profile = await this.profileRepository
      .createQueryBuilder("profile")
      .leftJoin("profile.user", "user")
      .where("user.id = :userId", { userId })
      .getOne();
    if (!profile) {
      throw new UnauthorizedException("用户资料不存在");
    }
    const { user, ...profileData } = profile;
    void user;
    return {
      ...profileData,
      roles,
      permissions,
    };
  }
  // ----------------------------------------------------------------------
}
