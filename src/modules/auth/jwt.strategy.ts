import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigEnum } from "../../common/constants/config.enum";
import type { AuthUser } from "../../common/types/auth-user.type";
import type { JwtPayload } from "../../common/types/jwt-payload.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(protected readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(ConfigEnum.JWT_SECRET),
    });
  }
  validate({ sub, username, roles, permissions }: JwtPayload): AuthUser {
    return { userId: sub, username, roles, permissions };
  }
}
