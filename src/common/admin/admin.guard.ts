import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { UserService } from "../../modules/user/user.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user: { id: number } }>();
    console.log(req.user, "-------");
    const user = await this.userService.findOne(req.user.id);
    console.log(user, "------");
    return true;
  }
}
