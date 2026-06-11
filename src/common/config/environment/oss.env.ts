import { ENV } from "./keys";
import {
  getExplicitOptionalString,
  getOptionalString,
  getRequiredBoolean,
  getRequiredNumber,
  getRequiredString,
  type EnvironmentGetter,
} from "./readers";

export const createOssEnvironment = (get: EnvironmentGetter) => ({
  enabled: getRequiredBoolean(get(ENV.OSS_ENABLED), ENV.OSS_ENABLED),
  region: getRequiredString(get(ENV.OSS_REGION), ENV.OSS_REGION),
  bucket: getExplicitOptionalString(get(ENV.OSS_BUCKET), ENV.OSS_BUCKET),
  endpoint: getOptionalString(get(ENV.OSS_ENDPOINT)),
  accessKeyId: getExplicitOptionalString(
    get(ENV.OSS_ACCESS_KEY_ID),
    ENV.OSS_ACCESS_KEY_ID,
  ),
  accessKeySecret: getExplicitOptionalString(
    get(ENV.OSS_ACCESS_KEY_SECRET),
    ENV.OSS_ACCESS_KEY_SECRET,
  ),
  publicBaseUrl: getExplicitOptionalString(
    get(ENV.OSS_PUBLIC_BASE_URL),
    ENV.OSS_PUBLIC_BASE_URL,
  ),
  uploadExpiresIn: getRequiredNumber(
    get(ENV.OSS_UPLOAD_EXPIRES_IN),
    ENV.OSS_UPLOAD_EXPIRES_IN,
  ),
  uploadMaxSize: getRequiredNumber(
    get(ENV.OSS_UPLOAD_MAX_SIZE),
    ENV.OSS_UPLOAD_MAX_SIZE,
  ),
  tempExpiresInHours: getRequiredNumber(
    get(ENV.OSS_TEMP_EXPIRES_IN_HOURS),
    ENV.OSS_TEMP_EXPIRES_IN_HOURS,
  ),
});
