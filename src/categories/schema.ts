import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { createZodDto } from "nestjs-zod";

import { tickets } from "../tickets/schema";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  order: integer("order").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  tickets: many(tickets),
}));

export const SelectCategoriesDto = createZodDto(createSelectSchema(categories));

const insertCategoriesSchema = createInsertSchema(
  categories,
  {
    title: schema => schema.min(1).max(500).describe("The title of the category"),
  },
).required({
  title: true,
}).omit({
  id: true,
  order: true,
  createdAt: true,
  updatedAt: true,
});

const updateCategoriesSchema = createUpdateSchema(
  categories,
  {
    title: schema => schema.min(1).max(500).describe("The title of the category"),
  },
).required({
  title: true,
}).omit({
  id: true,
  order: true,
  createdAt: true,
  updatedAt: true,
});

export class InsertCategoriesDto extends createZodDto(insertCategoriesSchema) {}
export class UpdateCategoriesDto extends createZodDto(updateCategoriesSchema) {}
