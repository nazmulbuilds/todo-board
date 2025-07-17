import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { categories } from "../categories/schema";
import { labels } from "../labels/schema";

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const ticketsToLabels = pgTable(
  "tickets_to_labels",
  {
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    labelId: integer("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  },
  t => [
    primaryKey({ columns: [t.ticketId, t.labelId] }),
  ],
);

export const ticketsToLabelsRelations = relations(
  ticketsToLabels,
  ({ one }) => ({
    ticket: one(tickets, {
      fields: [ticketsToLabels.ticketId],
      references: [tickets.id],
    }),
    label: one(labels, {
      fields: [ticketsToLabels.labelId],
      references: [labels.id],
    }),
  }),
);

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
    ).describe("The expiration date of the ticket"), // "2025-07-18T13:34:31.386Z"
  },
).required({
  title: true,
  description: true,
  expiresAt: true,
  categoryId: true,
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
    ).optional().describe("The expiration date of the ticket"),
  },
).required({}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const addLabelToTicketSchema = createInsertSchema(ticketsToLabels).required({
  labelId: true,
}).omit({
  ticketId: true,
});

export class InsertTicketsDto extends createZodDto(insertTicketsSchema) {}
export class UpdateTicketsDto extends createZodDto(updateTicketsSchema) {}
export class AddLabelToTicketDto extends createZodDto(addLabelToTicketSchema) {}
