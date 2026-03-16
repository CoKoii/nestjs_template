import type { Request } from "express";

export interface AuthUser {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
}

export interface RequestWithUser extends Request {
  user: AuthUser;
}
