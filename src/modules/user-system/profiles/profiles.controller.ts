import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "../../../core/auth/decorators/current-user.decorator";
import type { AuthUser } from "../../../core/auth/types/auth-user.type";
import { ProfilesService } from "./profiles.service";

@Controller("profiles")
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  // 根据 token 获取当前用户信息
  @Get("me")
  findOne(@CurrentUser() user: AuthUser) {
    return this.profileService.findOne(
      user.userId,
      user.roles,
      user.permissions,
    );
  }
}
