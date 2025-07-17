import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase, NodePgTransaction } from "drizzle-orm/node-postgres";

import { CategoriesService } from "../categories/categories.service";
import { DATABASE_CONNECTION } from "../database/database-connection";
import { LabelsService } from "../labels/labels.service";
import * as schema from "./schema";

@Injectable()
export class TicketsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly labelsService: LabelsService,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(data: schema.InsertTicketsDto) {
    const [insertedRow] = await this.db.insert(schema.tickets).values(data).returning();

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
        history: {
          orderBy: (history, { desc }) => desc(history.createdAt),
          columns: {
            ticketId: false,
            categoryId: false,
          },
          with: {
            category: {
              columns: {
                id: true,
                title: true,
              },
            },
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

  async getById(id: string) {
    const ticket = await this.db.query.tickets.findFirst({
      where: (tickets, { eq }) => eq(tickets.id, Number(id)),
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
        history: {
          orderBy: (history, { desc }) => desc(history.createdAt),
          columns: {
            ticketId: false,
            categoryId: false,
          },
          with: {
            category: {
              columns: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    return ticket;
  }

  async getAllHistory() {
    return this.db.query.ticketsToCategoriesHistory.findMany({
      orderBy: (history, { desc }) => desc(history.createdAt),
      columns: {
        ticketId: false,
        categoryId: false,
      },
      with: {
        ticket: {
          columns: {
            id: true,
            title: true,
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
  }

  async checkIfExists(id: string) {
    const ticket = await this.db.query.tickets.findFirst({
      where: (tickets, { eq }) => eq(tickets.id, Number(id)),
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    return ticket;
  }

  async addLabel(ticketId: string, labelId: number) {
    await this.checkIfExists(ticketId);
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

  async update(id: string, data: schema.UpdateTicketsDto) {
    // check if the ticket exists
    const ticket = await this.checkIfExists(id);
    // check if the category exists
    if (data.categoryId !== ticket.categoryId) {
      await this.categoriesService.getById(data.categoryId as unknown as string);
    }

    return this.db.transaction(async (tx) => {
      const [updatedRow] = await tx.update(schema.tickets).set(data).where(eq(schema.tickets.id, Number(id))).returning();
      if (data.categoryId !== undefined && data.categoryId !== ticket.categoryId) {
        await tx.insert(schema.ticketsToCategoriesHistory).values({
          ticketId: ticket.id,
          categoryId: data.categoryId,
        });
      }

      return updatedRow;
    });
  }

  async bulkUpdateCategory(oldCategoryId: string, newCategoryId: string, tx: NodePgTransaction<any, any>) {
    const updatedRows = await tx.update(schema.tickets).set({ categoryId: Number(newCategoryId) }).where(eq(schema.tickets.categoryId, Number(oldCategoryId))).returning({ id: schema.tickets.id });
    await tx.insert(schema.ticketsToCategoriesHistory).values(updatedRows.map(row => ({ ticketId: row.id, categoryId: Number(newCategoryId) })));
  }

  async delete(id: string) {
    // check if the label exists
    await this.checkIfExists(id);
    await this.db.delete(schema.tickets).where(eq(schema.tickets.id, Number(id)));
  }
}
