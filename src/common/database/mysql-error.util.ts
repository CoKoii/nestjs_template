import { BadRequestException, ConflictException } from "@nestjs/common";

const toMySqlError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return null;
  }
  return error as {
    code?: string;
    errno?: number;
    message?: string;
    sqlMessage?: string;
  };
};

const isMySqlError = (error: unknown, code: string, errno: number) => {
  const e = toMySqlError(error);
  if (!e) return false;
  return e.code === code || e.errno === errno;
};

export const getMySqlCode = (error: unknown) => toMySqlError(error)?.code;

export const getMySqlErrno = (error: unknown) => toMySqlError(error)?.errno;

export const getMySqlMessage = (error: unknown) => {
  const e = toMySqlError(error);
  if (!e) return "";
  return e.sqlMessage || e.message || "";
};

// 唯一索引冲突，如用户名/角色名重复
export const isUniqueError = (error: unknown) =>
  isMySqlError(error, "ER_DUP_ENTRY", 1062);

// 外键引用不存在，常见于传入了不存在的关联 ID
export const isForeignKeyConstraintError = (error: unknown) =>
  isMySqlError(error, "ER_NO_REFERENCED_ROW_2", 1452);

// 外键被引用，删除/更新父记录被阻止
export const isForeignKeyReferencedError = (error: unknown) =>
  isMySqlError(error, "ER_ROW_IS_REFERENCED_2", 1451);

// 字段值超长
export const isDataTooLongError = (error: unknown) =>
  isMySqlError(error, "ER_DATA_TOO_LONG", 1406);

// 非空字段被写入 null
export const isNotNullError = (error: unknown) =>
  isMySqlError(error, "ER_BAD_NULL_ERROR", 1048);

// 缺少必填字段且无默认值
export const isNoDefaultValueError = (error: unknown) =>
  isMySqlError(error, "ER_NO_DEFAULT_FOR_FIELD", 1364);

// 值类型不合法（如无效日期、字符串转数字失败等）
export const isInvalidValueError = (error: unknown) =>
  isMySqlError(error, "ER_TRUNCATED_WRONG_VALUE", 1292);

// SQL 语法错误
export const isSqlSyntaxError = (error: unknown) =>
  isMySqlError(error, "ER_PARSE_ERROR", 1064);

// 查询了不存在的字段
export const isUnknownColumnError = (error: unknown) =>
  isMySqlError(error, "ER_BAD_FIELD_ERROR", 1054);

// 查询了不存在的表
export const isTableNotFoundError = (error: unknown) =>
  isMySqlError(error, "ER_NO_SUCH_TABLE", 1146);

// 死锁
export const isDeadlockError = (error: unknown) =>
  isMySqlError(error, "ER_LOCK_DEADLOCK", 1213);

// 行锁等待超时
export const isLockWaitTimeoutError = (error: unknown) =>
  isMySqlError(error, "ER_LOCK_WAIT_TIMEOUT", 1205);

// 用户名或密码错误（数据库连接层）
export const isAccessDeniedError = (error: unknown) =>
  isMySqlError(error, "ER_ACCESS_DENIED_ERROR", 1045);

// 数据库不存在
export const isDatabaseNotFoundError = (error: unknown) =>
  isMySqlError(error, "ER_BAD_DB_ERROR", 1049);

// 统一的 MySQL 错误转业务异常模板
export const throwMySqlError = (
  error: unknown,
  messages: {
    unique?: string;
    foreignKeyConstraint?: string;
    foreignKeyReferenced?: string;
    dataTooLong?: string;
    notNull?: string;
    noDefaultValue?: string;
    invalidValue?: string;
  },
) => {
  if (messages.unique && isUniqueError(error)) {
    throw new ConflictException(messages.unique);
  }
  if (messages.foreignKeyConstraint && isForeignKeyConstraintError(error)) {
    throw new BadRequestException(messages.foreignKeyConstraint);
  }
  if (messages.foreignKeyReferenced && isForeignKeyReferencedError(error)) {
    throw new BadRequestException(messages.foreignKeyReferenced);
  }
  if (messages.dataTooLong && isDataTooLongError(error)) {
    throw new BadRequestException(messages.dataTooLong);
  }
  if (messages.notNull && isNotNullError(error)) {
    throw new BadRequestException(messages.notNull);
  }
  if (messages.noDefaultValue && isNoDefaultValueError(error)) {
    throw new BadRequestException(messages.noDefaultValue);
  }
  if (messages.invalidValue && isInvalidValueError(error)) {
    throw new BadRequestException(messages.invalidValue);
  }
  throw error;
};
