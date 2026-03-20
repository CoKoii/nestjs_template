import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createMySqlTypeOrmModuleOptions } from "./mysql/mysql.config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createMySqlTypeOrmModuleOptions,
    }),
  ],
})
export class PersistenceModule {}
