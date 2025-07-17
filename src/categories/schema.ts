import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { createZodDto } from "nestjs-zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

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
  createdAt: true,
  updatedAt: true,
});

export class InsertCategoriesDto extends createZodDto(insertCategoriesSchema) {}
export class UpdateCategoriesDto extends createZodDto(updateCategoriesSchema) {}
