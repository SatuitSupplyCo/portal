CREATE TABLE "rbac_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rbac_audit_log" ADD CONSTRAINT "rbac_audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rbac_audit_log_actor_idx" ON "rbac_audit_log" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "rbac_audit_log_target_idx" ON "rbac_audit_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "rbac_audit_log_created_at_idx" ON "rbac_audit_log" USING btree ("created_at");