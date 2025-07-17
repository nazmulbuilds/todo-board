CREATE TABLE "tickets_to_categories_history" (
	"ticket_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tickets_to_categories_history_ticket_id_category_id_created_at_pk" PRIMARY KEY("ticket_id","category_id","created_at")
);
--> statement-breakpoint
ALTER TABLE "tickets_to_categories_history" ADD CONSTRAINT "tickets_to_categories_history_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets_to_categories_history" ADD CONSTRAINT "tickets_to_categories_history_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;