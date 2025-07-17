import { Global, Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import env from "@/env";

import * as categoriesSchema from "../categories/schema";
import * as labelsSchema from "../labels/schema";
import * as ticketsSchema from "../tickets/schema";
import * as usersSchema from "../users/schema";
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
          ...usersSchema,
          ...categoriesSchema,
          ...labelsSchema,
          ...ticketsSchema,
        },
      }),
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule { }
