import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { RequestWithUser } from "../types/request-with-user.type";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const userRoles = req.user?.roles ?? [];
    if (userRoles.some((role: string) => roles.includes(role))) {
      return true;
    }
    throw new ForbiddenException("您没有访问此资源的权限");
  }
}
