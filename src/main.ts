import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";
import { patchNestJsSwagger } from "nestjs-zod";

import { AppModule } from "./app.module";
import env from "./env";

patchNestJsSwagger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, cors: {
    origin: true,
    credentials: true,
  } });

  const openApiConfig = new DocumentBuilder()
    .setTitle("NestJS Starter")
    .setDescription("A NestJS starter with eslint + husky + lint staged + github actions + db + openapi")
    .addBearerAuth()
    .setVersion("1.0")
    .build();

  const openApiObject = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup("swagger", app, openApiObject);

  app.useLogger(app.get(Logger));
  await app.listen(env.PORT ?? 5000);
}
bootstrap();
