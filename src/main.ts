import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { AllExceptionFilter } from "./common/filters/all-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(
    new AllExceptionFilter(new Logger(), app.get(HttpAdapterHost)),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      exceptionFactory: (errors) =>
        new BadRequestException(
          Object.values(errors[0]?.constraints ?? {})[0] ?? "参数校验失败",
        ),
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
