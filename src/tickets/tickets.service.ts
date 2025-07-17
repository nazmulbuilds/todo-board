import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase, NodePgTransaction } from "drizzle-orm/node-postgres";

import { DATABASE_CONNECTION } from "../database/database-connection";
import * as schema from "./schema";

@Injectable()
export class TicketsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: schema.InsertTicketsDto, tx?: NodePgTransaction<any, any>) {
    const [insertedRow] = await (tx || this.db).insert(schema.tickets).values(data).returning();

    return insertedRow;
  }

  async getAll() {
    return this.db.query.tickets.findMany({
      with: {
        labels: true,
        category: true,
      },
    });
  }

  async getById(id: string) {
    const ticket = await this.db.query.tickets.findFirst({
      where: (tickets, { eq }) => eq(tickets.id, Number(id)),
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    return ticket;
  }

  async update(id: string, data: schema.UpdateTicketsDto, tx?: NodePgTransaction<any, any>) {
    // check if the label exists
    await this.getById(id);

    const [updatedRow] = await (tx || this.db).update(schema.tickets).set(data).where(eq(schema.tickets.id, Number(id))).returning();

    return updatedRow;
  }

  async delete(id: string, tx?: NodePgTransaction<any, any>) {
    // check if the label exists
    await this.getById(id);
    await (tx || this.db).delete(schema.tickets).where(eq(schema.tickets.id, Number(id)));
  }
}
