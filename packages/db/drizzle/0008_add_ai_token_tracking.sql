ALTER TABLE "ai_suggestion_log" ADD COLUMN "input_tokens" integer;--> statement-breakpoint
ALTER TABLE "ai_suggestion_log" ADD COLUMN "output_tokens" integer;--> statement-breakpoint
ALTER TABLE "ai_suggestion_log" ADD COLUMN "latency_ms" integer;