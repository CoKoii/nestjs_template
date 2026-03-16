import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { PermissionsModule } from "./permissions/permissions.module";
import { ProfilesModule } from "./profiles/profiles.module";
import { RolesModule } from "./roles/roles.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ProfilesModule,
    RolesModule,
    PermissionsModule,
  ],
})
export class UserSystemModule {}
