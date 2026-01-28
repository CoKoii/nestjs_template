import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogsModule } from './logs/logs.module';
import { connectionParams } from '../ormconfig';
const envFilePath = `.env.${process.env.NODE_ENV || 'development'}`;
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      load: [() => dotenv.config({ path: '.env' })],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        DB_TYPE: Joi.string().default('mysql'),
        DB_HOST: Joi.string().ip(),
        DB_PORT: Joi.number().default(3306),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_SYNC: Joi.boolean().default(false),
      }),
    }),
    TypeOrmModule.forRoot(connectionParams),
    UserModule,
    LogsModule,
  ],
  controllers: [],
  providers: [Logger],
  exports: [Logger],
})
export class AppModule {}
