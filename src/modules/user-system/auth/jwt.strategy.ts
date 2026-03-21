import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ENV } from "../../../config/env.config";
import {
  ACCESS_TOKEN_TYPE,
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
      secretOrKey: configService.getOrThrow<string>(ENV.JWT_ACCESS_SECRET),
    });
  }

  validate(payload: AuthTokenPayload): AuthUser {
    if (payload.type !== ACCESS_TOKEN_TYPE) {
      throw new UnauthorizedException("未登录或登录已过期");
    }
    return toAuthUser(payload);
  }
}
