import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import {
  ACCESS_TOKEN_TYPE,
  type AuthTokenPayload,
  type AuthUser,
  toAuthUser,
} from "../../../common/auth/auth-user";
import { getAuthEnvironment } from "../../../common/config/env";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const authEnvironment = getAuthEnvironment(configService);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authEnvironment.accessTokenSecret,
    });
  }

  validate(payload: AuthTokenPayload): AuthUser {
    if (payload.type !== ACCESS_TOKEN_TYPE) {
      throw new UnauthorizedException("未登录或登录已过期");
    }
    return toAuthUser(payload);
  }
}
