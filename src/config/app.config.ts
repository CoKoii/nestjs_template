import { ConfigService } from "@nestjs/config";
import { EnvKey } from "./env.keys";
import { parseCommaSeparatedValue, parseNumber } from "./env.utils";

export const API_GLOBAL_PREFIX = "api";
export const API_VERSION_PREFIX = "v";

export const isProductionEnvironment = (configService: ConfigService) =>
  configService.get<string>(EnvKey.NODE_ENV) === "production";

export const resolveCorsOrigins = (configService: ConfigService): string[] =>
  parseCommaSeparatedValue(configService.get<string>(EnvKey.CORS_ORIGINS));

export const resolvePort = (configService: ConfigService): number =>
  parseNumber(configService.get(EnvKey.PORT), 3000);
