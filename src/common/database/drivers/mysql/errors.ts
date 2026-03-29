import { BadRequestException, ConflictException } from "@nestjs/common";
import type { DatabaseErrorMessages } from "../../database.types";

type MySqlError = {
  code?: string;
  errno?: number;
};

const toMySqlError = (error: unknown): MySqlError | null => {
  if (!error || typeof error !== "object") {
    return null;
  }
  return error as MySqlError;
};

const isMySqlError = (error: unknown, code: string, errno: number) => {
  const candidate = toMySqlError(error);
  if (!candidate) return false;
  return candidate.code === code || candidate.errno === errno;
};

export const rethrowMySqlError = (
  error: unknown,
  messages: DatabaseErrorMessages,
): never => {
  if (messages.unique && isMySqlError(error, "ER_DUP_ENTRY", 1062)) {
    throw new ConflictException(messages.unique);
  }
  if (
    messages.foreignKeyConstraint &&
    isMySqlError(error, "ER_NO_REFERENCED_ROW_2", 1452)
  ) {
    throw new BadRequestException(messages.foreignKeyConstraint);
  }
  if (
    messages.foreignKeyReferenced &&
    isMySqlError(error, "ER_ROW_IS_REFERENCED_2", 1451)
  ) {
    throw new BadRequestException(messages.foreignKeyReferenced);
  }
  if (messages.dataTooLong && isMySqlError(error, "ER_DATA_TOO_LONG", 1406)) {
    throw new BadRequestException(messages.dataTooLong);
  }
  if (messages.notNull && isMySqlError(error, "ER_BAD_NULL_ERROR", 1048)) {
    throw new BadRequestException(messages.notNull);
  }
  if (
    messages.noDefaultValue &&
    isMySqlError(error, "ER_NO_DEFAULT_FOR_FIELD", 1364)
  ) {
    throw new BadRequestException(messages.noDefaultValue);
  }
  if (
    messages.invalidValue &&
    isMySqlError(error, "ER_TRUNCATED_WRONG_VALUE", 1292)
  ) {
    throw new BadRequestException(messages.invalidValue);
  }
  throw error;
};
