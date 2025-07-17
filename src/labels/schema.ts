import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { createZodDto } from "nestjs-zod";

import { tickets } from "../tickets/schema";

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const ticketsToLabels = pgTable(
  "tickets_to_labels",
  {
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => tickets.id),
    labelId: integer("label_id")
      .notNull()
      .references(() => labels.id),
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
