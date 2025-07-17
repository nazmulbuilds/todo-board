import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { categories } from "../categories/schema";
import { ticketsToLabels } from "../labels/schema";

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  category: one(categories, {
    fields: [tickets.categoryId],
    references: [categories.id],
  }),
  labels: many(ticketsToLabels),
}));

export const SelectTicketsDto = createZodDto(createSelectSchema(tickets));

const insertTicketsSchema = createInsertSchema(
  tickets,
  {
    title: schema => schema.min(1).max(500).describe("The title of the ticket"),
    description: schema => schema.max(1000).describe("The description of the ticket"),
    expiresAt: z.string().datetime().transform(val => new Date(val)).pipe(
      z.date().min(new Date()).max(new Date(new Date().setFullYear(new Date().getFullYear() + 1))),
    ).describe("The expiration date of the ticket"),
  },
).required({
  title: true,
  description: true,
  expiresAt: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const updateTicketsSchema = createUpdateSchema(
  tickets,
  {
    title: schema => schema.min(1).max(500).describe("The title of the ticket"),
    description: schema => schema.min(1).max(1000).describe("The description of the ticket"),
    expiresAt: z.string().datetime().transform(val => new Date(val)).pipe(
      z.date().min(new Date()).max(new Date(new Date().setFullYear(new Date().getFullYear() + 1))),
    ).describe("The expiration date of the ticket"),
  },
).required({}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export class InsertTicketsDto extends createZodDto(insertTicketsSchema) {}
export class UpdateTicketsDto extends createZodDto(updateTicketsSchema) {}
