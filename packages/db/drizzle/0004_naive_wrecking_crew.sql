CREATE TYPE "public"."season_color_status" AS ENUM('confirmed', 'proposed');--> statement-breakpoint
CREATE TABLE "season_colors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"studio_entry_id" uuid NOT NULL,
	"status" "season_color_status" DEFAULT 'proposed' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "season_colors_season_entry_unq" UNIQUE("season_id","studio_entry_id")
);
--> statement-breakpoint
ALTER TABLE "season_colors" ADD CONSTRAINT "season_colors_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_colors" ADD CONSTRAINT "season_colors_studio_entry_id_studio_entries_id_fk" FOREIGN KEY ("studio_entry_id") REFERENCES "public"."studio_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_colors" ADD CONSTRAINT "season_colors_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "season_colors_season_idx" ON "season_colors" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "season_colors_entry_idx" ON "season_colors" USING btree ("studio_entry_id");