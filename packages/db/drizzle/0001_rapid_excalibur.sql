CREATE TYPE "public"."gender" AS ENUM('mens', 'womens', 'unisex');--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN "gender" "gender" DEFAULT 'mens' NOT NULL;