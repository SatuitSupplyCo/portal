CREATE TYPE "public"."acl_permission" AS ENUM('read', 'write', 'admin');--> statement-breakpoint
CREATE TYPE "public"."asset_version_status" AS ENUM('draft', 'approved', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."block_type" AS ENUM('text', 'heading', 'rule', 'table', 'image', 'asset_ref', 'test_ref', 'techpack_ref', 'pack_ref', 'canon_ref', 'callout');--> statement-breakpoint
CREATE TYPE "public"."canon_status" AS ENUM('active', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."collection_tag" AS ENUM('core', 'material', 'function', 'origin', 'womens', 'accessory', 'lifestyle');--> statement-breakpoint
CREATE TYPE "public"."core_program_status" AS ENUM('active', 'paused', 'retired');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."execution_status" AS ENUM('draft', 'approved_sampling', 'approved_bulk', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."factory_category" AS ENUM('tees', 'fleece', 'swim', 'woven', 'towels', 'headwear', 'accessories');--> statement-breakpoint
CREATE TYPE "public"."factory_status" AS ENUM('prospect', 'screening', 'sampling', 'approved', 'active', 'dormant', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."factory_type" AS ENUM('knit', 'woven', 'swim', 'accessories', 'multi');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."negotiation_outcome" AS ENUM('accepted', 'counter_offered', 'rejected', 'tabled');--> statement-breakpoint
CREATE TYPE "public"."org_role" AS ENUM('org_admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."org_status" AS ENUM('active', 'suspended', 'archived');--> statement-breakpoint
CREATE TYPE "public"."org_type" AS ENUM('vendor', 'partner');--> statement-breakpoint
CREATE TYPE "public"."pack_item_type" AS ENUM('asset_version', 'document', 'test', 'pack', 'link');--> statement-breakpoint
CREATE TYPE "public"."pack_kind" AS ENUM('tech_pack', 'bundle', 'vendor_pack', 'partner_pack');--> statement-breakpoint
CREATE TYPE "public"."portal_role" AS ENUM('owner', 'admin', 'editor', 'internal_viewer', 'partner_viewer', 'vendor_viewer');--> statement-breakpoint
CREATE TYPE "public"."product_role" AS ENUM('studio_contributor', 'product_lead', 'founder', 'external_designer', 'factory_partner');--> statement-breakpoint
CREATE TYPE "public"."production_run_status" AS ENUM('pre_production', 'cutting', 'sewing', 'washing', 'packing', 'shipped', 'delivered', 'completed');--> statement-breakpoint
CREATE TYPE "public"."publish_action" AS ENUM('publish', 'archive', 'approve_sampling', 'approve_bulk');--> statement-breakpoint
CREATE TYPE "public"."relationship_stage" AS ENUM('intro', 'vetting', 'strategic_partner');--> statement-breakpoint
CREATE TYPE "public"."replacement_additive" AS ENUM('replacement', 'additive');--> statement-breakpoint
CREATE TYPE "public"."sample_decision" AS ENUM('approved', 'revise', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."sample_type" AS ENUM('proto', 'fit', 'sms', 'top');--> statement-breakpoint
CREATE TYPE "public"."season_slot_status" AS ENUM('open', 'filled', 'removed');--> statement-breakpoint
CREATE TYPE "public"."season_status" AS ENUM('planning', 'locked', 'active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."season_type" AS ENUM('major', 'minor');--> statement-breakpoint
CREATE TYPE "public"."sku_concept_status" AS ENUM('draft', 'spec', 'sampling', 'costing', 'approved', 'production', 'live', 'retired');--> statement-breakpoint
CREATE TYPE "public"."sku_factory_status" AS ENUM('proposed', 'sampling', 'approved', 'production', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."studio_category" AS ENUM('product', 'materials', 'brand', 'reference', 'operational');--> statement-breakpoint
CREATE TYPE "public"."studio_inspiration_source" AS ENUM('internal', 'competitor', 'archive', 'vintage', 'editorial', 'trade_show', 'mill_library', 'street', 'other');--> statement-breakpoint
CREATE TYPE "public"."studio_link_type" AS ENUM('sku_concept', 'factory', 'material', 'sampling_request', 'collection');--> statement-breakpoint
CREATE TYPE "public"."studio_status" AS ENUM('raw', 'exploring', 'prototyping', 'ready_for_review', 'revisions_requested', 'promoted', 'archived');--> statement-breakpoint
CREATE TYPE "public"."test_result" AS ENUM('pass', 'fail', 'mixed');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"role" "portal_role" DEFAULT 'internal_viewer' NOT NULL,
	"product_role" "product_role",
	"org_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"org_id" uuid,
	"role" "portal_role" NOT NULL,
	"org_role" "org_role",
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"invited_by" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "org_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "org_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_memberships_org_user_unq" UNIQUE("org_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "org_type" NOT NULL,
	"status" "org_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "document_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"type" "block_type" NOT NULL,
	"content_json" jsonb NOT NULL,
	"visible_to_internal" boolean DEFAULT true NOT NULL,
	"visible_to_partners" boolean DEFAULT false NOT NULL,
	"visible_to_vendors" boolean DEFAULT false NOT NULL,
	"locked" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"section" text NOT NULL,
	"status" "document_status" DEFAULT 'draft' NOT NULL,
	"visible_to_internal" boolean DEFAULT true NOT NULL,
	"visible_to_partners" boolean DEFAULT false NOT NULL,
	"visible_to_vendors" boolean DEFAULT false NOT NULL,
	"owner_team" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "documents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "canon_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"version" text NOT NULL,
	"status" "canon_status" DEFAULT 'active' NOT NULL,
	"body_json" jsonb NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "canon_documents_slug_version_unq" UNIQUE("slug","version")
);
--> statement-breakpoint
CREATE TABLE "asset_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"checksum" text,
	"status" "asset_version_status" DEFAULT 'draft' NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"tags" text[],
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pack_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pack_id" uuid NOT NULL,
	"item_type" "pack_item_type" NOT NULL,
	"asset_version_id" uuid,
	"document_id" uuid,
	"test_id" uuid,
	"child_pack_id" uuid,
	"link_url" text,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"kind" "pack_kind" NOT NULL,
	"status" "document_status" DEFAULT 'draft' NOT NULL,
	"visible_to_internal" boolean DEFAULT true NOT NULL,
	"visible_to_partners" boolean DEFAULT false NOT NULL,
	"visible_to_vendors" boolean DEFAULT false NOT NULL,
	"version" text,
	"execution_status" "execution_status",
	"target_type" text,
	"target_slug" text,
	"vendor_org_id" uuid,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "packs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "test_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text,
	"caption" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"pack_id" uuid,
	"asset_version_id" uuid,
	"document_id" uuid
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"vendor_org_id" uuid,
	"status" "document_status" DEFAULT 'draft' NOT NULL,
	"result" "test_result",
	"notes" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legal_name" text NOT NULL,
	"trading_name" text,
	"country" text NOT NULL,
	"region" text,
	"city" text,
	"primary_contact_name" text,
	"primary_contact_email" text,
	"whatsapp" text,
	"website" text,
	"factory_type" "factory_type" NOT NULL,
	"vertical_integration" boolean DEFAULT false NOT NULL,
	"capacity_units_per_month" integer,
	"min_order_quantity" integer,
	"avg_lead_time_days" integer,
	"sample_lead_time_days" integer,
	"payment_terms" text,
	"currency" text DEFAULT 'USD',
	"sustainability_certifications" jsonb DEFAULT '[]'::jsonb,
	"compliance_certifications" jsonb DEFAULT '[]'::jsonb,
	"status" "factory_status" DEFAULT 'prospect' NOT NULL,
	"strategic_score" numeric(3, 2),
	"last_reviewed_at" date,
	"internal_owner" text,
	"notes" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factory_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"factory_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text,
	"caption" text,
	"expires_at" date,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factory_capabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"factory_id" uuid NOT NULL,
	"category" "factory_category" NOT NULL,
	"specialty" text,
	"in_house_patterning" boolean DEFAULT false NOT NULL,
	"in_house_dyeing" boolean DEFAULT false NOT NULL,
	"in_house_knitting" boolean DEFAULT false NOT NULL,
	"technical_complexity_rating" integer,
	"premium_finishing_rating" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factory_costing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"factory_id" uuid NOT NULL,
	"category" "factory_category" NOT NULL,
	"target_fob_range_low" numeric(10, 2),
	"target_fob_range_high" numeric(10, 2),
	"fabric_markup_percent" numeric(5, 2),
	"trim_markup_percent" numeric(5, 2),
	"freight_assumption" numeric(10, 2),
	"duties_estimate_percent" numeric(5, 2),
	"landed_cost_multiplier" numeric(5, 3),
	"margin_viability_score" integer,
	"sku_concept_id" uuid,
	"season" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factory_negotiations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"factory_id" uuid NOT NULL,
	"season" text,
	"category" "factory_category",
	"subject" text NOT NULL,
	"our_ask" text,
	"their_response" text,
	"outcome" "negotiation_outcome",
	"final_terms" text,
	"previous_price" numeric(10, 2),
	"negotiated_price" numeric(10, 2),
	"price_change_percent" numeric(5, 2),
	"lessons_learned" text,
	"negotiated_by" text,
	"negotiated_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factory_production_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"factory_id" uuid NOT NULL,
	"sku_id" text,
	"po_number" text,
	"season" text,
	"quantity" integer,
	"status" "production_run_status" DEFAULT 'pre_production' NOT NULL,
	"planned_start_date" date,
	"actual_start_date" date,
	"planned_ship_date" date,
	"actual_ship_date" date,
	"delivered_date" date,
	"qc_pass_rate" numeric(5, 2),
	"defect_rate" numeric(5, 2),
	"on_time_delivery" boolean,
	"lead_time_deviation_days" integer,
	"chargeback_amount" numeric(10, 2),
	"chargeback_reason" text,
	"notes" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factory_relationship" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"factory_id" uuid NOT NULL,
	"brand_alignment_score" integer,
	"responsiveness_score" integer,
	"transparency_score" integer,
	"innovation_score" integer,
	"negotiation_flexibility" integer,
	"long_term_partner_potential" integer,
	"internal_owner" text,
	"relationship_stage" "relationship_stage" DEFAULT 'intro' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "factory_relationship_factory_id_unique" UNIQUE("factory_id")
);
--> statement-breakpoint
CREATE TABLE "factory_risk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"factory_id" uuid NOT NULL,
	"geopolitical_risk" integer,
	"financial_stability" integer,
	"labor_risk" integer,
	"supply_chain_depth" integer,
	"redundancy_score" integer,
	"risk_notes" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "factory_risk_factory_id_unique" UNIQUE("factory_id")
);
--> statement-breakpoint
CREATE TABLE "factory_samples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"factory_id" uuid NOT NULL,
	"sku_id" text,
	"sku_concept_id" uuid,
	"tech_pack_id" uuid,
	"sample_type" "sample_type" NOT NULL,
	"requested_at" date,
	"shipped_at" date,
	"received_at" date,
	"quality_score" integer,
	"fit_score" integer,
	"construction_score" integer,
	"accuracy_score" integer,
	"communication_score" integer,
	"revision_count" integer DEFAULT 0 NOT NULL,
	"final_decision" "sample_decision",
	"notes" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sku_factory_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku_id" text NOT NULL,
	"sku_concept_id" uuid,
	"primary_factory_id" uuid NOT NULL,
	"backup_factory_id" uuid,
	"status" "sku_factory_status" DEFAULT 'proposed' NOT NULL,
	"margin_target_met" boolean DEFAULT false NOT NULL,
	"approved_for_production" boolean DEFAULT false NOT NULL,
	"season" text,
	"notes" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "studio_category" NOT NULL,
	"status" "studio_status" DEFAULT 'raw' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"collection" text,
	"season" text,
	"collection_tag" "collection_tag",
	"inspiration_source" "studio_inspiration_source",
	"source_url" text,
	"estimated_complexity" integer,
	"strategic_relevance_score" integer,
	"intent" text,
	"problem_statement" text,
	"price_tier_target" text,
	"margin_target" numeric(5, 2),
	"replacement_vs_additive" "replacement_additive",
	"target_season_id" uuid,
	"category_metadata" jsonb DEFAULT '{}'::jsonb,
	"archive_reason" text,
	"review_submitted_at" timestamp with time zone,
	"promoted_at" timestamp with time zone,
	"promoted_by" text,
	"owner" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_entry_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"mime" text,
	"file_size" integer,
	"caption" text,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_entry_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"mime" text,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_entry_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"link_type" "studio_link_type" NOT NULL,
	"target_id" text NOT NULL,
	"target_label" text,
	"notes" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"fabric_spec" text,
	"block_id" text,
	"silhouettes" jsonb DEFAULT '[]'::jsonb,
	"base_colorways" jsonb DEFAULT '[]'::jsonb,
	"status" "core_program_status" DEFAULT 'active' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "season_core_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"core_program_id" uuid NOT NULL,
	"selected_colorways" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "season_core_refs_season_program_unq" UNIQUE("season_id","core_program_id")
);
--> statement-breakpoint
CREATE TABLE "season_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_id" uuid NOT NULL,
	"collection" "collection_tag" NOT NULL,
	"category" text NOT NULL,
	"replacement_flag" boolean DEFAULT false NOT NULL,
	"status" "season_slot_status" DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"season_type" "season_type" NOT NULL,
	"status" "season_status" DEFAULT 'planning' NOT NULL,
	"target_sku_count" integer NOT NULL,
	"margin_target" numeric(5, 2),
	"complexity_budget" integer,
	"minor_max_skus" integer,
	"color_palette" jsonb DEFAULT '[]'::jsonb,
	"mix_targets" jsonb DEFAULT '{}'::jsonb,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seasons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sku_concept_transitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku_concept_id" uuid NOT NULL,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"actor_user_id" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sku_concepts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"season_slot_id" uuid NOT NULL,
	"source_studio_entry_id" uuid NOT NULL,
	"metadata_snapshot" jsonb NOT NULL,
	"status" "sku_concept_status" DEFAULT 'draft' NOT NULL,
	"created_by" text,
	"approved_by" text,
	"spec_at" timestamp with time zone,
	"sampling_at" timestamp with time zone,
	"costing_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"production_at" timestamp with time zone,
	"live_at" timestamp with time zone,
	"retired_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sku_concepts_season_slot_id_unique" UNIQUE("season_slot_id")
);
--> statement-breakpoint
CREATE TABLE "assets_acl" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"user_id" text,
	"org_id" uuid,
	"permission" "acl_permission" DEFAULT 'read' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents_acl" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" text,
	"org_id" uuid,
	"permission" "acl_permission" DEFAULT 'read' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packs_acl" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pack_id" uuid NOT NULL,
	"user_id" text,
	"org_id" uuid,
	"permission" "acl_permission" DEFAULT 'read' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publish_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid NOT NULL,
	"action" "publish_action" NOT NULL,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_memberships" ADD CONSTRAINT "org_memberships_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_memberships" ADD CONSTRAINT "org_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_blocks" ADD CONSTRAINT "document_blocks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canon_documents" ADD CONSTRAINT "canon_documents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_versions" ADD CONSTRAINT "asset_versions_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_versions" ADD CONSTRAINT "asset_versions_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_items" ADD CONSTRAINT "pack_items_pack_id_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pack_items" ADD CONSTRAINT "pack_items_child_pack_id_packs_id_fk" FOREIGN KEY ("child_pack_id") REFERENCES "public"."packs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packs" ADD CONSTRAINT "packs_vendor_org_id_organizations_id_fk" FOREIGN KEY ("vendor_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packs" ADD CONSTRAINT "packs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attachments" ADD CONSTRAINT "test_attachments_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_links" ADD CONSTRAINT "test_links_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_links" ADD CONSTRAINT "test_links_pack_id_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."packs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_links" ADD CONSTRAINT "test_links_asset_version_id_asset_versions_id_fk" FOREIGN KEY ("asset_version_id") REFERENCES "public"."asset_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_links" ADD CONSTRAINT "test_links_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_vendor_org_id_organizations_id_fk" FOREIGN KEY ("vendor_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factories" ADD CONSTRAINT "factories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_attachments" ADD CONSTRAINT "factory_attachments_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_attachments" ADD CONSTRAINT "factory_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_capabilities" ADD CONSTRAINT "factory_capabilities_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_costing" ADD CONSTRAINT "factory_costing_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_negotiations" ADD CONSTRAINT "factory_negotiations_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_negotiations" ADD CONSTRAINT "factory_negotiations_negotiated_by_users_id_fk" FOREIGN KEY ("negotiated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_production_runs" ADD CONSTRAINT "factory_production_runs_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_production_runs" ADD CONSTRAINT "factory_production_runs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_relationship" ADD CONSTRAINT "factory_relationship_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_risk" ADD CONSTRAINT "factory_risk_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_samples" ADD CONSTRAINT "factory_samples_factory_id_factories_id_fk" FOREIGN KEY ("factory_id") REFERENCES "public"."factories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_samples" ADD CONSTRAINT "factory_samples_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_factory_assignments" ADD CONSTRAINT "sku_factory_assignments_primary_factory_id_factories_id_fk" FOREIGN KEY ("primary_factory_id") REFERENCES "public"."factories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_factory_assignments" ADD CONSTRAINT "sku_factory_assignments_backup_factory_id_factories_id_fk" FOREIGN KEY ("backup_factory_id") REFERENCES "public"."factories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_factory_assignments" ADD CONSTRAINT "sku_factory_assignments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_entries" ADD CONSTRAINT "studio_entries_promoted_by_users_id_fk" FOREIGN KEY ("promoted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_entries" ADD CONSTRAINT "studio_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_entry_attachments" ADD CONSTRAINT "studio_entry_attachments_entry_id_studio_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."studio_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_entry_attachments" ADD CONSTRAINT "studio_entry_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_entry_images" ADD CONSTRAINT "studio_entry_images_entry_id_studio_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."studio_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_entry_images" ADD CONSTRAINT "studio_entry_images_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_entry_links" ADD CONSTRAINT "studio_entry_links_entry_id_studio_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."studio_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_entry_links" ADD CONSTRAINT "studio_entry_links_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_programs" ADD CONSTRAINT "core_programs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_core_refs" ADD CONSTRAINT "season_core_refs_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_core_refs" ADD CONSTRAINT "season_core_refs_core_program_id_core_programs_id_fk" FOREIGN KEY ("core_program_id") REFERENCES "public"."core_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concept_transitions" ADD CONSTRAINT "sku_concept_transitions_sku_concept_id_sku_concepts_id_fk" FOREIGN KEY ("sku_concept_id") REFERENCES "public"."sku_concepts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concept_transitions" ADD CONSTRAINT "sku_concept_transitions_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_season_slot_id_season_slots_id_fk" FOREIGN KEY ("season_slot_id") REFERENCES "public"."season_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_source_studio_entry_id_studio_entries_id_fk" FOREIGN KEY ("source_studio_entry_id") REFERENCES "public"."studio_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets_acl" ADD CONSTRAINT "assets_acl_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets_acl" ADD CONSTRAINT "assets_acl_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets_acl" ADD CONSTRAINT "assets_acl_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_acl" ADD CONSTRAINT "documents_acl_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_acl" ADD CONSTRAINT "documents_acl_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents_acl" ADD CONSTRAINT "documents_acl_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packs_acl" ADD CONSTRAINT "packs_acl_pack_id_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packs_acl" ADD CONSTRAINT "packs_acl_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packs_acl" ADD CONSTRAINT "packs_acl_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publish_log" ADD CONSTRAINT "publish_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_org_id_idx" ON "users" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitations_token_idx" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "invitations_org_id_idx" ON "invitations" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "org_memberships_user_id_idx" ON "org_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organizations_type_idx" ON "organizations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "organizations_status_idx" ON "organizations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "document_blocks_document_sort_idx" ON "document_blocks" USING btree ("document_id","sort_order");--> statement-breakpoint
CREATE INDEX "documents_section_status_idx" ON "documents" USING btree ("section","status");--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "canon_documents_slug_status_idx" ON "canon_documents" USING btree ("slug","status");--> statement-breakpoint
CREATE INDEX "asset_versions_asset_status_idx" ON "asset_versions" USING btree ("asset_id","status");--> statement-breakpoint
CREATE INDEX "assets_type_idx" ON "assets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "pack_items_pack_sort_idx" ON "pack_items" USING btree ("pack_id","sort_order");--> statement-breakpoint
CREATE INDEX "packs_kind_status_idx" ON "packs" USING btree ("kind","status");--> statement-breakpoint
CREATE INDEX "packs_vendor_org_id_idx" ON "packs" USING btree ("vendor_org_id");--> statement-breakpoint
CREATE INDEX "packs_target_idx" ON "packs" USING btree ("target_type","target_slug");--> statement-breakpoint
CREATE INDEX "test_attachments_test_id_idx" ON "test_attachments" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "test_links_test_id_idx" ON "test_links" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "test_links_pack_id_idx" ON "test_links" USING btree ("pack_id");--> statement-breakpoint
CREATE INDEX "tests_category_idx" ON "tests" USING btree ("category");--> statement-breakpoint
CREATE INDEX "tests_vendor_org_id_idx" ON "tests" USING btree ("vendor_org_id");--> statement-breakpoint
CREATE INDEX "tests_status_idx" ON "tests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "factories_status_idx" ON "factories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "factories_country_idx" ON "factories" USING btree ("country");--> statement-breakpoint
CREATE INDEX "factories_type_idx" ON "factories" USING btree ("factory_type");--> statement-breakpoint
CREATE INDEX "factories_score_idx" ON "factories" USING btree ("strategic_score");--> statement-breakpoint
CREATE INDEX "factory_attachments_factory_idx" ON "factory_attachments" USING btree ("factory_id");--> statement-breakpoint
CREATE INDEX "factory_attachments_type_idx" ON "factory_attachments" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "factory_capabilities_factory_idx" ON "factory_capabilities" USING btree ("factory_id");--> statement-breakpoint
CREATE INDEX "factory_capabilities_category_idx" ON "factory_capabilities" USING btree ("category");--> statement-breakpoint
CREATE INDEX "factory_costing_factory_idx" ON "factory_costing" USING btree ("factory_id");--> statement-breakpoint
CREATE INDEX "factory_costing_category_idx" ON "factory_costing" USING btree ("category");--> statement-breakpoint
CREATE INDEX "factory_negotiations_factory_idx" ON "factory_negotiations" USING btree ("factory_id");--> statement-breakpoint
CREATE INDEX "factory_negotiations_season_idx" ON "factory_negotiations" USING btree ("season");--> statement-breakpoint
CREATE INDEX "factory_prod_runs_factory_idx" ON "factory_production_runs" USING btree ("factory_id");--> statement-breakpoint
CREATE INDEX "factory_prod_runs_status_idx" ON "factory_production_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "factory_prod_runs_season_idx" ON "factory_production_runs" USING btree ("season");--> statement-breakpoint
CREATE INDEX "factory_relationship_factory_idx" ON "factory_relationship" USING btree ("factory_id");--> statement-breakpoint
CREATE INDEX "factory_relationship_stage_idx" ON "factory_relationship" USING btree ("relationship_stage");--> statement-breakpoint
CREATE INDEX "factory_risk_factory_idx" ON "factory_risk" USING btree ("factory_id");--> statement-breakpoint
CREATE INDEX "factory_samples_factory_idx" ON "factory_samples" USING btree ("factory_id");--> statement-breakpoint
CREATE INDEX "factory_samples_type_idx" ON "factory_samples" USING btree ("sample_type");--> statement-breakpoint
CREATE INDEX "factory_samples_decision_idx" ON "factory_samples" USING btree ("final_decision");--> statement-breakpoint
CREATE INDEX "sku_factory_sku_idx" ON "sku_factory_assignments" USING btree ("sku_id");--> statement-breakpoint
CREATE INDEX "sku_factory_primary_idx" ON "sku_factory_assignments" USING btree ("primary_factory_id");--> statement-breakpoint
CREATE INDEX "sku_factory_status_idx" ON "sku_factory_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "studio_entries_category_idx" ON "studio_entries" USING btree ("category");--> statement-breakpoint
CREATE INDEX "studio_entries_status_idx" ON "studio_entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "studio_entries_owner_idx" ON "studio_entries" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "studio_entries_season_idx" ON "studio_entries" USING btree ("season");--> statement-breakpoint
CREATE INDEX "studio_entries_collection_idx" ON "studio_entries" USING btree ("collection");--> statement-breakpoint
CREATE INDEX "studio_entries_relevance_idx" ON "studio_entries" USING btree ("strategic_relevance_score");--> statement-breakpoint
CREATE INDEX "studio_entries_created_idx" ON "studio_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "studio_entry_attachments_entry_idx" ON "studio_entry_attachments" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "studio_entry_images_entry_idx" ON "studio_entry_images" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "studio_entry_links_entry_idx" ON "studio_entry_links" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "studio_entry_links_type_idx" ON "studio_entry_links" USING btree ("link_type");--> statement-breakpoint
CREATE INDEX "studio_entry_links_target_idx" ON "studio_entry_links" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "core_programs_status_idx" ON "core_programs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "season_core_refs_season_idx" ON "season_core_refs" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "season_core_refs_program_idx" ON "season_core_refs" USING btree ("core_program_id");--> statement-breakpoint
CREATE INDEX "season_slots_season_idx" ON "season_slots" USING btree ("season_id");--> statement-breakpoint
CREATE INDEX "season_slots_status_idx" ON "season_slots" USING btree ("status");--> statement-breakpoint
CREATE INDEX "season_slots_collection_idx" ON "season_slots" USING btree ("collection");--> statement-breakpoint
CREATE INDEX "seasons_status_idx" ON "seasons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "seasons_type_idx" ON "seasons" USING btree ("season_type");--> statement-breakpoint
CREATE INDEX "sku_concept_transitions_concept_idx" ON "sku_concept_transitions" USING btree ("sku_concept_id");--> statement-breakpoint
CREATE INDEX "sku_concept_transitions_actor_idx" ON "sku_concept_transitions" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "sku_concept_transitions_created_idx" ON "sku_concept_transitions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sku_concepts_status_idx" ON "sku_concepts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sku_concepts_slot_idx" ON "sku_concepts" USING btree ("season_slot_id");--> statement-breakpoint
CREATE INDEX "sku_concepts_source_idx" ON "sku_concepts" USING btree ("source_studio_entry_id");--> statement-breakpoint
CREATE INDEX "assets_acl_asset_id_idx" ON "assets_acl" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "assets_acl_user_id_idx" ON "assets_acl" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "assets_acl_org_id_idx" ON "assets_acl" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "documents_acl_document_id_idx" ON "documents_acl" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "documents_acl_user_id_idx" ON "documents_acl" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "documents_acl_org_id_idx" ON "documents_acl" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "packs_acl_pack_id_idx" ON "packs_acl" USING btree ("pack_id");--> statement-breakpoint
CREATE INDEX "packs_acl_user_id_idx" ON "packs_acl" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "packs_acl_org_id_idx" ON "packs_acl" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "publish_log_resource_idx" ON "publish_log" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "publish_log_actor_idx" ON "publish_log" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "publish_log_created_at_idx" ON "publish_log" USING btree ("created_at");