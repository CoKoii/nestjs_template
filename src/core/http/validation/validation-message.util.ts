import type { ValidationError } from "class-validator";

export const resolveFirstValidationMessage = (
  error: ValidationError,
): string => {
  if (error.constraints) {
    const [message] = Object.values(error.constraints);
    return message ?? "参数校验失败";
  }

  const [firstChild] = error.children ?? [];
  return firstChild
    ? resolveFirstValidationMessage(firstChild)
    : "参数校验失败";
};
