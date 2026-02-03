import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { AllExceptionFilter } from "./common/filters/all-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

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
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const getFirstError = (err: any): string => {
          if (err.constraints)
            return Object.values(err.constraints)[0] as string;
          return err.children?.length
            ? getFirstError(err.children[0])
            : "参数校验失败";
        };
        return new BadRequestException(getFirstError(errors[0]));
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
