import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
  type INestApplication,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ValidationError } from "class-validator";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { ENV, parseCommaSeparatedValue, parseNumber } from "./env.config";

const API_GLOBAL_PREFIX = "api";
const API_VERSION_PREFIX = "v";
const DEFAULT_PORT = 3000;
const DEFAULT_VALIDATION_MESSAGE = "参数校验失败";

const resolveFirstValidationMessage = (error: ValidationError): string => {
  if (error.constraints) {
    const [message] = Object.values(error.constraints);
    return message ?? DEFAULT_VALIDATION_MESSAGE;
  }

  const [firstChild] = error.children ?? [];
  return firstChild
    ? resolveFirstValidationMessage(firstChild)
    : DEFAULT_VALIDATION_MESSAGE;
};

const isProductionEnvironment = (configService: ConfigService) =>
  configService.get<string>(ENV.NODE_ENV) === "production";

const resolveCorsOrigins = (configService: ConfigService): string[] =>
  parseCommaSeparatedValue(configService.get<string>(ENV.CORS_ORIGINS));

const resolvePort = (configService: ConfigService): number =>
  parseNumber(configService.get(ENV.PORT), DEFAULT_PORT);

const createValidationPipe = () =>
  new ValidationPipe({
    transform: true,
    whitelist: true,
    stopAtFirstError: true,
    exceptionFactory: (errors: ValidationError[]) => {
      if (!errors.length) {
        return new BadRequestException(DEFAULT_VALIDATION_MESSAGE);
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
