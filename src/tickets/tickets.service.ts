import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase, NodePgTransaction } from "drizzle-orm/node-postgres";

import { DATABASE_CONNECTION } from "../database/database-connection";
import { LabelsService } from "../labels/labels.service";
import * as schema from "./schema";

@Injectable()
export class TicketsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly labelsService: LabelsService,
  ) {}

  async create(data: schema.InsertTicketsDto, tx?: NodePgTransaction<any, any>) {
    const [insertedRow] = await (tx || this.db).insert(schema.tickets).values(data).returning();

    return insertedRow;
  }

  async getAll() {
    return this.db.query.tickets.findMany({
      with: {
        labels: {
          columns: {
            labelId: false,
            ticketId: false,
          },
          with: {
            label: {
              columns: {
                id: true,
                title: true,
              },
            },
          },
        },
        category: {
          columns: {
            id: true,
            title: true,
          },
        },
      },
    });
    // .then(tickets =>
    //   tickets.map(ticket => ({
    //     ...ticket,
    //     labels: ticket.labels.map(tl => tl.label),
    //   })),
    // );
  }

  async addLabel(ticketId: string, labelId: number) {
    await this.getById(ticketId);
    await this.labelsService.getById(labelId as unknown as string);

    await this.db.insert(schema.ticketsToLabels).values({ ticketId: Number(ticketId), labelId });
  }

  async removeLabel(ticketId: string, labelId: string) {
    // check if ticket label exists
    const ticketLabel = await this.db.query.ticketsToLabels.findFirst({
      where: (ticketsToLabels, { and, eq }) => and(eq(ticketsToLabels.ticketId, Number(ticketId)), eq(ticketsToLabels.labelId, Number(labelId))),
    });

    if (ticketLabel) {
      await this.db.delete(schema.ticketsToLabels).where(and(eq(schema.ticketsToLabels.ticketId, Number(ticketId)), eq(schema.ticketsToLabels.labelId, Number(labelId))));
    }
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
