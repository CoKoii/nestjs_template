import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigEnum } from "../../common/constants/config.enum";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(protected readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(ConfigEnum.JWT_SECRET),
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
  }) {
    return { userId: sub, username, roles, permissions };
  }
}
