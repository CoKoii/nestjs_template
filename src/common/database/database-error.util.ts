import { getDatabaseEnvironmentFromProcess } from "../config/env";
import { getDatabaseDriver } from "./database-driver.registry";
import type { DatabaseErrorMessages } from "./database.types";

export const rethrowDatabaseError = (
  error: unknown,
  messages: DatabaseErrorMessages,
): never =>
  getDatabaseDriver(getDatabaseEnvironmentFromProcess().type).rethrowError(
    error,
    messages,
  );
