import type { Request } from "express";
import type { AuthUser } from "./auth-user.type";

export interface RequestWithUser extends Request {
  user: AuthUser;
}
