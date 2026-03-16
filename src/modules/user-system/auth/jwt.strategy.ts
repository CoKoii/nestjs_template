import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { AuthUser } from "../../../core/auth/types/auth-user.type";
import { EnvKey } from "../../../config/env.keys";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(protected readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(EnvKey.JWT_SECRET),
    });
  }
  validate({
    sub,
    username,
    roles,
    permissions,
  }: {
    sub: number;
    username: string;
    roles: string[];
    permissions: string[];
  }): AuthUser {
    return { userId: sub, username, roles, permissions };
  }
}
