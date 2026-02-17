DO $$ BEGIN
  CREATE TYPE "public"."taxonomy_status" AS ENUM('active', 'deprecated');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assortment_tenures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assortment_tenures_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audience_age_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audience_age_groups_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audience_genders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audience_genders_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "constructions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "constructions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fit_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"pattern_block_ref" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fit_blocks_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goods_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goods_classes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "material_weight_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "material_weight_classes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"taxonomy_version" text DEFAULT 'v1.0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_subcategories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category_id" uuid NOT NULL,
	"goods_class_default_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"taxonomy_version" text DEFAULT 'v1.0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_subcategories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"subcategory_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"taxonomy_version" text DEFAULT 'v1.0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "selling_windows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "selling_windows_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "size_scales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"sizes" jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "size_scales_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "use_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "taxonomy_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "use_cases_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DROP INDEX IF EXISTS "factory_capabilities_category_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "factory_costing_category_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "season_slots_collection_idx";--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN IF NOT EXISTS "product_role" "product_role";--> statement-breakpoint
ALTER TABLE "factory_capabilities" ADD COLUMN IF NOT EXISTS "subcategory_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "factory_costing" ADD COLUMN IF NOT EXISTS "subcategory_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "factory_negotiations" ADD COLUMN IF NOT EXISTS "subcategory_id" uuid;--> statement-breakpoint
ALTER TABLE "studio_entries" ADD COLUMN IF NOT EXISTS "collection_id" uuid;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN IF NOT EXISTS "product_type_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN IF NOT EXISTS "collection_id" uuid;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN IF NOT EXISTS "audience_gender_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN IF NOT EXISTS "audience_age_group_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN IF NOT EXISTS "selling_window_id" uuid;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN IF NOT EXISTS "assortment_tenure_id" uuid;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN IF NOT EXISTS "colorway_ids" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN IF NOT EXISTS "description" text;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN IF NOT EXISTS "launch_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN IF NOT EXISTS "target_style_count" integer;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN IF NOT EXISTS "target_evergreen_pct" integer;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN IF NOT EXISTS "product_type_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN IF NOT EXISTS "selling_window_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN IF NOT EXISTS "tenure_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN IF NOT EXISTS "age_group_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN IF NOT EXISTS "weight_class_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN IF NOT EXISTS "use_case_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN IF NOT EXISTS "construction_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN IF NOT EXISTS "construction_id" uuid;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN IF NOT EXISTS "material_weight_class_id" uuid;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN IF NOT EXISTS "fit_block_id" uuid;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN IF NOT EXISTS "use_case_id" uuid;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN IF NOT EXISTS "goods_class_id" uuid;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN IF NOT EXISTS "size_scale_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "product_subcategories" ADD CONSTRAINT "product_subcategories_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "product_subcategories" ADD CONSTRAINT "product_subcategories_goods_class_default_id_goods_classes_id_fk" FOREIGN KEY ("goods_class_default_id") REFERENCES "public"."goods_classes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "product_types" ADD CONSTRAINT "product_types_subcategory_id_product_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."product_subcategories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assortment_tenures_code_idx" ON "assortment_tenures" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audience_age_groups_code_idx" ON "audience_age_groups" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audience_genders_code_idx" ON "audience_genders" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collections_code_idx" ON "collections" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collections_status_idx" ON "collections" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "constructions_code_idx" ON "constructions" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fit_blocks_code_idx" ON "fit_blocks" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goods_classes_code_idx" ON "goods_classes" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "material_weight_classes_code_idx" ON "material_weight_classes" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_categories_code_idx" ON "product_categories" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_categories_status_idx" ON "product_categories" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_subcategories_category_idx" ON "product_subcategories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_subcategories_code_idx" ON "product_subcategories" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_subcategories_status_idx" ON "product_subcategories" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_types_subcategory_idx" ON "product_types" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_types_code_idx" ON "product_types" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_types_status_idx" ON "product_types" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "selling_windows_code_idx" ON "selling_windows" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "size_scales_code_idx" ON "size_scales" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "use_cases_code_idx" ON "use_cases" USING btree ("code");--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "factory_capabilities" ADD CONSTRAINT "factory_capabilities_subcategory_id_product_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."product_subcategories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "factory_costing" ADD CONSTRAINT "factory_costing_subcategory_id_product_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."product_subcategories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "factory_negotiations" ADD CONSTRAINT "factory_negotiations_subcategory_id_product_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."product_subcategories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "studio_entries" ADD CONSTRAINT "studio_entries_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_audience_gender_id_audience_genders_id_fk" FOREIGN KEY ("audience_gender_id") REFERENCES "public"."audience_genders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_audience_age_group_id_audience_age_groups_id_fk" FOREIGN KEY ("audience_age_group_id") REFERENCES "public"."audience_age_groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_selling_window_id_selling_windows_id_fk" FOREIGN KEY ("selling_window_id") REFERENCES "public"."selling_windows"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_assortment_tenure_id_assortment_tenures_id_fk" FOREIGN KEY ("assortment_tenure_id") REFERENCES "public"."assortment_tenures"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_construction_id_constructions_id_fk" FOREIGN KEY ("construction_id") REFERENCES "public"."constructions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_material_weight_class_id_material_weight_classes_id_fk" FOREIGN KEY ("material_weight_class_id") REFERENCES "public"."material_weight_classes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_fit_block_id_fit_blocks_id_fk" FOREIGN KEY ("fit_block_id") REFERENCES "public"."fit_blocks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_use_case_id_use_cases_id_fk" FOREIGN KEY ("use_case_id") REFERENCES "public"."use_cases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_goods_class_id_goods_classes_id_fk" FOREIGN KEY ("goods_class_id") REFERENCES "public"."goods_classes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_size_scale_id_size_scales_id_fk" FOREIGN KEY ("size_scale_id") REFERENCES "public"."size_scales"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "factory_capabilities_subcategory_idx" ON "factory_capabilities" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "factory_costing_subcategory_idx" ON "factory_costing" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "season_slots_product_type_idx" ON "season_slots" USING btree ("product_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "season_slots_gender_idx" ON "season_slots" USING btree ("audience_gender_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "season_slots_collection_idx" ON "season_slots" USING btree ("collection_id");--> statement-breakpoint
ALTER TABLE "factory_capabilities" DROP COLUMN IF EXISTS "category";--> statement-breakpoint
ALTER TABLE "factory_costing" DROP COLUMN IF EXISTS "category";--> statement-breakpoint
ALTER TABLE "factory_negotiations" DROP COLUMN IF EXISTS "category";--> statement-breakpoint
ALTER TABLE "studio_entries" DROP COLUMN IF EXISTS "collection_tag";--> statement-breakpoint
ALTER TABLE "season_slots" DROP COLUMN IF EXISTS "collection";--> statement-breakpoint
ALTER TABLE "season_slots" DROP COLUMN IF EXISTS "category";--> statement-breakpoint
ALTER TABLE "season_slots" DROP COLUMN IF EXISTS "gender";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."collection_tag";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."factory_category";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."gender";
