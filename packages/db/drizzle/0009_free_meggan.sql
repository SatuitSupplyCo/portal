CREATE TYPE "public"."concept_job_status" AS ENUM('queued', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."render_job_status" AS ENUM('queued', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "concept_job_acceptances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"concept_job_id" uuid NOT NULL,
	"concept_id" text NOT NULL,
	"studio_entry_id" uuid NOT NULL,
	"accepted_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "concept_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "concept_job_status" DEFAULT 'queued' NOT NULL,
	"input_json" jsonb NOT NULL,
	"output_json" jsonb,
	"error" text,
	"provider" text,
	"model" text,
	"prompt_version" text NOT NULL,
	"duration_ms" integer,
	"tokens_in" integer,
	"tokens_out" integer,
	"content_hash" text,
	"created_by" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "render_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "render_job_status" DEFAULT 'queued' NOT NULL,
	"input_json" jsonb NOT NULL,
	"output_json" jsonb,
	"error" text,
	"provider" text,
	"model" text,
	"prompt_version" text NOT NULL,
	"tokens_in" integer,
	"tokens_out" integer,
	"duration_ms" integer,
	"studio_entry_id" uuid,
	"design_version_id" uuid,
	"created_by" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_design_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_entry_id" uuid NOT NULL,
	"snapshot_json" jsonb NOT NULL,
	"label" text,
	"version" integer NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "concept_job_acceptances" ADD CONSTRAINT "concept_job_acceptances_concept_job_id_concept_jobs_id_fk" FOREIGN KEY ("concept_job_id") REFERENCES "public"."concept_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_job_acceptances" ADD CONSTRAINT "concept_job_acceptances_studio_entry_id_studio_entries_id_fk" FOREIGN KEY ("studio_entry_id") REFERENCES "public"."studio_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_job_acceptances" ADD CONSTRAINT "concept_job_acceptances_accepted_by_users_id_fk" FOREIGN KEY ("accepted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_jobs" ADD CONSTRAINT "concept_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "render_jobs" ADD CONSTRAINT "render_jobs_studio_entry_id_studio_entries_id_fk" FOREIGN KEY ("studio_entry_id") REFERENCES "public"."studio_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "render_jobs" ADD CONSTRAINT "render_jobs_design_version_id_studio_design_versions_id_fk" FOREIGN KEY ("design_version_id") REFERENCES "public"."studio_design_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "render_jobs" ADD CONSTRAINT "render_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_design_versions" ADD CONSTRAINT "studio_design_versions_studio_entry_id_studio_entries_id_fk" FOREIGN KEY ("studio_entry_id") REFERENCES "public"."studio_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_design_versions" ADD CONSTRAINT "studio_design_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "concept_job_acceptances_job_idx" ON "concept_job_acceptances" USING btree ("concept_job_id");--> statement-breakpoint
CREATE INDEX "concept_job_acceptances_entry_idx" ON "concept_job_acceptances" USING btree ("studio_entry_id");--> statement-breakpoint
CREATE INDEX "concept_jobs_status_idx" ON "concept_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "concept_jobs_created_idx" ON "concept_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "concept_jobs_created_by_idx" ON "concept_jobs" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "render_jobs_status_idx" ON "render_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "render_jobs_created_idx" ON "render_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "render_jobs_created_by_idx" ON "render_jobs" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "render_jobs_studio_entry_idx" ON "render_jobs" USING btree ("studio_entry_id");--> statement-breakpoint
CREATE INDEX "render_jobs_design_version_idx" ON "render_jobs" USING btree ("design_version_id");--> statement-breakpoint
CREATE INDEX "studio_design_versions_entry_idx" ON "studio_design_versions" USING btree ("studio_entry_id");--> statement-breakpoint
CREATE INDEX "studio_design_versions_created_idx" ON "studio_design_versions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "studio_design_versions_entry_version_idx" ON "studio_design_versions" USING btree ("studio_entry_id","version");