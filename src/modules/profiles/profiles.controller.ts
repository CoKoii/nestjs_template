import { Controller, Get, Req } from "@nestjs/common";
import type { RequestWithUser } from "../../common/types/request-with-user.type";
import { ProfilesService } from "./profiles.service";

@Controller("profiles")
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}
  // ----------------------------------------------------------------------
  // 根据token获取当前用户信息
  @Get("me")
  findOne(@Req() req: RequestWithUser): ReturnType<ProfilesService["findOne"]> {
    return this.profileService.findOne(
      req.user.userId,
      req.user.roles,
      req.user.permissions,
    );
  }
  // ----------------------------------------------------------------------
}
