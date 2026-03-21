import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { AuthController } from "./auth.controller";
import { AuthSessionCleanupService } from "./auth-session-cleanup.service";
import { AuthService } from "./auth.service";
import { AuthSession } from "./entities/auth-session.entity";
import { JwtRefreshStrategy } from "./jwt-refresh.strategy";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuthSession]),
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [
    AuthService,
    AuthSessionCleanupService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
