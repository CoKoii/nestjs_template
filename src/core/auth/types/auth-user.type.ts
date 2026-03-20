import type { Request } from "express";

export interface AuthTokenPayload {
  sub: number;
  username: string;
  roles: string[];
  permissions: string[];
}

export interface AuthUser {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
}

export interface RequestWithUser extends Request {
  user: AuthUser;
}

export const toAuthUser = ({
  sub,
  ...payload
}: AuthTokenPayload): AuthUser => ({
  userId: sub,
  ...payload,
});
