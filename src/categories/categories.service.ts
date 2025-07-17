import { forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq, or, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DATABASE_CONNECTION } from "../database/database-connection";
import { TicketsService } from "../tickets/tickets.service";
import * as schema from "./schema";

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(forwardRef(() => TicketsService))
    private readonly ticketsService: TicketsService,
  ) {}

  async create(data: schema.InsertCategoriesDto) {
    // get the max order
    const maxOrder = await this.db.select({ maxOrder: sql<number>`max(${schema.categories.order})` }).from(schema.categories);

    const [insertedRow] = await this.db.insert(schema.categories).values({
      ...data,
      order: maxOrder[0].maxOrder + 1,
    }).returning();

    return insertedRow;
  }

  async getAll() {
    return this.db.query.categories.findMany({
      orderBy: (categories, { asc }) => asc(categories.order),
      with: {
        tickets: {
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
          },
        },
      },
    });
  }

  async getById(id: string) {
    const category = await this.db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.id, Number(id)),
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  async update(id: string, data: schema.UpdateCategoriesDto) {
    // check if the category exists
    await this.getById(id);

    const [updatedRow] = await this.db.update(schema.categories).set(data).where(eq(schema.categories.id, Number(id))).returning();

    return updatedRow;
  }

  async swapOrder(categoryId1: string, categoryId2: string) {
    const categories = await this.db.query.categories.findMany({
      where: (categories, { eq }) => or(eq(categories.id, Number(categoryId1)), eq(categories.id, Number(categoryId2))),
    });

    if (categories.length !== 2) {
      throw new NotFoundException("Category not found");
    }

    await this.db.transaction(async (tx) => {
      const [category1, category2] = categories;

      await tx.update(schema.categories).set({
        order: 0,
      }).where(eq(schema.categories.id, category1.id));

      await tx.update(schema.categories).set({
        order: category1.order,
      }).where(eq(schema.categories.id, category2.id));

      await tx.update(schema.categories).set({
        order: category2.order,
      }).where(eq(schema.categories.id, category1.id));
    });
  }

  async delete(id: string, moveExistingTicketsToCategoryId: string) {
    // check if both of the category exists
    const categories = await this.db.query.categories.findMany({
      where: (categories, { eq, or }) => or(eq(categories.id, Number(id)), eq(categories.id, Number(moveExistingTicketsToCategoryId))),
    });

    if (categories.length !== 2) {
      throw new NotFoundException("Category not found");
    }

    await this.db.transaction(async (tx) => {
      await this.ticketsService.bulkUpdateCategory(id, moveExistingTicketsToCategoryId, tx);
      await tx.delete(schema.categories).where(eq(schema.categories.id, Number(id)));
    });
  }
}
