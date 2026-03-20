import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ENV } from "../../../config/env.config";
import {
  type AuthTokenPayload,
  type AuthUser,
  toAuthUser,
} from "../../../core/auth/types/auth-user.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(ENV.JWT_SECRET),
    });
  }

  validate(payload: AuthTokenPayload): AuthUser {
    return toAuthUser(payload);
  }
}
