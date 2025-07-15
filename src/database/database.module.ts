import { Global, Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import env from "@/env";

import * as exampleSchema from "../examples/schema";
import { DATABASE_CONNECTION } from "./database-connection";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useValue: drizzle(new Pool({
        connectionString: env.DATABASE_URL,
      }), {
        schema: {
          ...exampleSchema,
        },
      }),
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule { }
