import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { RequestWithUser } from "../types/auth-user.type";

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<RequestWithUser>().user,
);
