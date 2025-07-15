import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { NodePgDatabase, NodePgTransaction } from "drizzle-orm/node-postgres";

import { DATABASE_CONNECTION } from "../database/database-connection";
import * as schema from "./schema";

@Injectable()
export class ExmaplesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: schema.InsertExamplesDto, tx?: NodePgTransaction<any, any>): Promise<any> {
    const [insertedRow] = await (tx || this.db).insert(schema.examples).values(data).returning();

    return insertedRow;
  }

  async getAll() {
    return this.db.query.examples.findMany();
  }

  async getById(id: string) {
    const example = await this.db.query.examples.findFirst({
      where: (examples, { eq }) => eq(examples.id, Number(id)),
    });

    if (!example) {
      throw new NotFoundException("Example not found");
    }

    return example;
  }
}
