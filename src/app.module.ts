import { Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import env from "./env";
import { ExamplesModule } from "./examples/examples.module";
import { HttpExceptionFilter } from "./http-exception.filter";

@Module({
  imports: [LoggerModule.forRoot({
    pinoHttp:
      {
        genReqId: () => { return crypto.randomUUID(); },
        level: env.NODE_ENV === "production" ? "info" : env.LOG_LEVEL,
        transport: env.NODE_ENV === "production"
          ? undefined
          : { target: "pino-pretty" },
      },
    exclude: [{ method: RequestMethod.ALL, path: "check" }],
  }), DatabaseModule, ExamplesModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_PIPE,
    useClass: ZodValidationPipe,
  }, {
    provide: APP_INTERCEPTOR,
    useClass: ZodSerializerInterceptor,
  }, {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  }],
})
export class AppModule {}
