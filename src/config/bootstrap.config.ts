import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
  type INestApplication,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ValidationError } from "class-validator";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import {
  API_GLOBAL_PREFIX,
  API_VERSION_PREFIX,
  isProductionEnvironment,
  resolveCorsOrigins,
  resolvePort,
} from "./app.config";
import { resolveFirstValidationMessage } from "../core/http/validation/validation-message.util";

const createValidationPipe = () =>
  new ValidationPipe({
    transform: true,
    whitelist: true,
    stopAtFirstError: true,
    exceptionFactory: (errors: ValidationError[]) => {
      if (!errors.length) {
        return new BadRequestException("参数校验失败");
      }

      return new BadRequestException(resolveFirstValidationMessage(errors[0]));
    },
  });

export const setupApplication = (app: INestApplication) => {
  const configService = app.get(ConfigService);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: API_VERSION_PREFIX,
  });
  app.enableCors({
    origin: isProductionEnvironment(configService)
      ? resolveCorsOrigins(configService)
      : true,
  });
  app.useGlobalPipes(createValidationPipe());
};

export const resolveApplicationPort = (app: INestApplication) =>
  resolvePort(app.get(ConfigService));
