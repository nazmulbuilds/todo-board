import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase, NodePgTransaction } from "drizzle-orm/node-postgres";

import { DATABASE_CONNECTION } from "../database/database-connection";
import * as schema from "./schema";

@Injectable()
export class LabelsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: schema.InsertLabelsDto, tx?: NodePgTransaction<any, any>) {
    // check if the title is already taken
    const existingLabel = await this.db.query.labels.findFirst({
      where: (labels, { eq }) => eq(labels.title, data.title),
    });

    if (existingLabel) {
      throw new BadRequestException("Label title already taken");
    }

    const [insertedRow] = await (tx || this.db).insert(schema.labels).values(data).returning();

    return insertedRow;
  }

  async getAll() {
    return this.db.query.labels.findMany();
  }

  async getById(id: string) {
    const label = await this.db.query.labels.findFirst({
      where: (labels, { eq }) => eq(labels.id, Number(id)),
    });

    if (!label) {
      throw new NotFoundException("Label not found");
    }

    return label;
  }

  async update(id: string, data: schema.UpdateLabelsDto, tx?: NodePgTransaction<any, any>) {
    // check if the label exists
    await this.getById(id);

    const [updatedRow] = await (tx || this.db).update(schema.labels).set(data).where(eq(schema.labels.id, Number(id))).returning();

    return updatedRow;
  }

  async delete(id: string, tx?: NodePgTransaction<any, any>) {
    // check if the label exists
    await this.getById(id);
    await (tx || this.db).delete(schema.labels).where(eq(schema.labels.id, Number(id)));
  }
}
