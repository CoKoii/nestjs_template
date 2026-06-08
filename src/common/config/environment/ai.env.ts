import { ENV } from "./keys";
import {
  getExplicitOptionalString,
  getRequiredNumber,
  getRequiredString,
  type EnvironmentGetter,
} from "./readers";

export const createAiEnvironment = (get: EnvironmentGetter) => ({
  apiKey: getRequiredString(get(ENV.AI_API_KEY), ENV.AI_API_KEY),
  baseUrl: getExplicitOptionalString(get(ENV.AI_BASE_URL), ENV.AI_BASE_URL),
  chatModel: getRequiredString(get(ENV.AI_CHAT_MODEL), ENV.AI_CHAT_MODEL),
  temperature: getRequiredNumber(get(ENV.AI_TEMPERATURE), ENV.AI_TEMPERATURE),
});
