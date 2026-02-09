import { Controller, Get, Req } from "@nestjs/common";
import { ProfilesService } from "./profiles.service";

@Controller("profiles")
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}
  // ----------------------------------------------------------------------
  // 根据token获取当前用户信息
  @Get("me")
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
