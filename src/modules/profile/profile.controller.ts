import { Controller, Get, Req } from "@nestjs/common";
import { ProfileService } from "./profile.service";

@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  // ----------------------------------------------------------------------
  // 根据token获取当前用户信息
  @Get()
  findOne(
    @Req()
    req: {
      user: { userId: number; roles: string[]; permissions: string[] };
    },
  ) {
    return this.profileService.findOne(
      req.user.userId,
      req.user.roles,
      req.user.permissions,
    );
  }
  // ----------------------------------------------------------------------
}
