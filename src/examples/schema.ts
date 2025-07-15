import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { createZodDto } from "nestjs-zod";

export const examples = pgTable("examples", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const SelectExamplesDto = createZodDto(createSelectSchema(examples));

const insertExamplesSchema = createInsertSchema(
  examples,
  {
    title: schema => schema.min(1).max(500).describe("The title of the example"),
  },
).required({
  title: true,
  content: true,
  authorId: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export class InsertExamplesDto extends createZodDto(insertExamplesSchema) {}
