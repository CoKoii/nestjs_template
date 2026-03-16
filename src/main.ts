import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  resolveApplicationPort,
  setupApplication,
} from "./config/bootstrap.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  setupApplication(app);
  await app.listen(resolveApplicationPort(app));
}

void bootstrap();
