ALTER TABLE "seasons" ADD COLUMN "gender_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "category_targets" jsonb DEFAULT '{}'::jsonb;