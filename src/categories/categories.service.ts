import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase, NodePgTransaction } from "drizzle-orm/node-postgres";

import { DATABASE_CONNECTION } from "../database/database-connection";
import * as schema from "./schema";

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(data: schema.InsertCategoriesDto, tx?: NodePgTransaction<any, any>) {
    const [insertedRow] = await (tx || this.db).insert(schema.categories).values(data).returning();

    return insertedRow;
  }

  async getAll() {
    return this.db.query.categories.findMany({
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

  async update(id: string, data: schema.UpdateCategoriesDto, tx?: NodePgTransaction<any, any>) {
    // check if the category exists
    await this.getById(id);

    const [updatedRow] = await (tx || this.db).update(schema.categories).set(data).where(eq(schema.categories.id, Number(id))).returning();

    return updatedRow;
  }

  async delete(id: string, tx?: NodePgTransaction<any, any>) {
    // check if the category exists
    await this.getById(id);
    // TODO: Check if the category is used in any tickets
    await (tx || this.db).delete(schema.categories).where(eq(schema.categories.id, Number(id)));
  }
}
