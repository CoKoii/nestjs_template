import { Controller, Get, Req } from "@nestjs/common";
import { ProfileService } from "./profile.service";

@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  findOne(@Req() req: { user: { userId: number } }) {
    return this.profileService.findOne(req.user.userId);
  }
}
