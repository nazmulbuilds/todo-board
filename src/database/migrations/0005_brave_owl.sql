ALTER TABLE "examples" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "examples" CASCADE;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "order" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_order_unique" UNIQUE("order");