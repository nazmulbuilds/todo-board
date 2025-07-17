import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DATABASE_CONNECTION } from "../database/database-connection";
import * as schema from "./schema";

@Injectable()
export class LabelsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: schema.InsertLabelsDto) {
    // check if the title is already taken
    const existingLabel = await this.db.query.labels.findFirst({
      where: (labels, { eq }) => eq(labels.title, data.title),
    });

    if (existingLabel) {
      throw new BadRequestException("Label title already taken");
    }

    const [insertedRow] = await this.db.insert(schema.labels).values(data).returning();

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

  async update(id: string, data: schema.UpdateLabelsDto) {
    // check if the label exists
    await this.getById(id);

    const [updatedRow] = await this.db.update(schema.labels).set(data).where(eq(schema.labels.id, Number(id))).returning();

    return updatedRow;
  }

  async delete(id: string) {
    // check if the label exists
    await this.getById(id);
    await this.db.delete(schema.labels).where(eq(schema.labels.id, Number(id)));
  }
}
