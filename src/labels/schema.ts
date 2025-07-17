import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { createZodDto } from "nestjs-zod";

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const SelectLabelsDto = createZodDto(createSelectSchema(labels));

const insertLabelsSchema = createInsertSchema(
  labels,
  {
    title: schema => schema.min(1).max(500).describe("The title of the label"),
  },
).required({
  title: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const updateLabelsSchema = createUpdateSchema(
  labels,
  {
    title: schema => schema.min(1).max(500).describe("The title of the label"),
  },
).required({
  title: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export class InsertLabelsDto extends createZodDto(insertLabelsSchema) {}
export class UpdateLabelsDto extends createZodDto(updateLabelsSchema) {}
