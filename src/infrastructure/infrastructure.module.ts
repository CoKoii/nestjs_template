import { Module } from "@nestjs/common";
import { ApplicationCacheModule } from "./cache/cache.module";
import { LoggingModule } from "./logging/logging.module";
import { PersistenceModule } from "./persistence/persistence.module";

@Module({
  imports: [LoggingModule, PersistenceModule, ApplicationCacheModule],
})
export class InfrastructureModule {}
