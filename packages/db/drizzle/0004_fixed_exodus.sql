CREATE TABLE "brand_context" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"positioning" text,
	"target_customer" text,
	"price_architecture" text,
	"aesthetic_direction" text,
	"category_strategy" text,
	"anti_spec" text,
	"context_brief" text,
	"context_brief_updated_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "intent" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "design_mandate" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "branding_mandate" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "system_role" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "context_brief" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "context_brief_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "brand_context" ADD CONSTRAINT "brand_context_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;