CREATE TABLE "ai_suggestion_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature" text NOT NULL,
	"field_name" text,
	"context" jsonb NOT NULL,
	"suggestions" jsonb NOT NULL,
	"selected_value" text,
	"outcome" text NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_suggestion_log" ADD CONSTRAINT "ai_suggestion_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_suggestion_log_feature_idx" ON "ai_suggestion_log" USING btree ("feature");--> statement-breakpoint
CREATE INDEX "ai_suggestion_log_user_idx" ON "ai_suggestion_log" USING btree ("user_id");