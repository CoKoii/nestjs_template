import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import type { ValidationError } from "class-validator";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { AllExceptionFilter } from "./common/filters/all-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

const resolveFirstValidationMessage = (error: ValidationError): string => {
  if (error.constraints) {
    const [message] = Object.values(error.constraints);
    return message ?? "参数校验失败";
  }
  const [firstChild] = error.children ?? [];
  return firstChild
    ? resolveFirstValidationMessage(firstChild)
    : "参数校验失败";
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.setGlobalPrefix("api/v1");
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(
    new AllExceptionFilter(new Logger(), app.get(HttpAdapterHost)),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        if (!errors.length) {
          return new BadRequestException("参数校验失败");
        }
        return new BadRequestException(
          resolveFirstValidationMessage(errors[0]),
        );
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
