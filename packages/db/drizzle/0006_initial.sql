CREATE TYPE "public"."taxonomy_status" AS ENUM('active', 'deprecated');--> statement-breakpoint
CREATE TABLE "assortment_tenures" (
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
CREATE TABLE "audience_age_groups" (
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
CREATE TABLE "audience_genders" (
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
CREATE TABLE "collections" (
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
CREATE TABLE "constructions" (
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
CREATE TABLE "fit_blocks" (
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
CREATE TABLE "goods_classes" (
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
CREATE TABLE "material_weight_classes" (
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
CREATE TABLE "product_categories" (
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
CREATE TABLE "product_subcategories" (
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
CREATE TABLE "product_types" (
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
CREATE TABLE "selling_windows" (
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
CREATE TABLE "size_scales" (
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
CREATE TABLE "use_cases" (
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
DROP INDEX "factory_capabilities_category_idx";--> statement-breakpoint
DROP INDEX "factory_costing_category_idx";--> statement-breakpoint
DROP INDEX "season_slots_collection_idx";--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "product_role" "product_role";--> statement-breakpoint
ALTER TABLE "factory_capabilities" ADD COLUMN "subcategory_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "factory_costing" ADD COLUMN "subcategory_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "factory_negotiations" ADD COLUMN "subcategory_id" uuid;--> statement-breakpoint
ALTER TABLE "studio_entries" ADD COLUMN "collection_id" uuid;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN "product_type_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN "collection_id" uuid;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN "audience_gender_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN "audience_age_group_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN "selling_window_id" uuid;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN "assortment_tenure_id" uuid;--> statement-breakpoint
ALTER TABLE "season_slots" ADD COLUMN "colorway_ids" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "launch_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "target_style_count" integer;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "target_evergreen_pct" integer;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "product_type_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "selling_window_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "tenure_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "age_group_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "weight_class_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "use_case_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "seasons" ADD COLUMN "construction_targets" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN "construction_id" uuid;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN "material_weight_class_id" uuid;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN "fit_block_id" uuid;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN "use_case_id" uuid;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN "goods_class_id" uuid;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD COLUMN "size_scale_id" uuid;--> statement-breakpoint
ALTER TABLE "product_subcategories" ADD CONSTRAINT "product_subcategories_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_subcategories" ADD CONSTRAINT "product_subcategories_goods_class_default_id_goods_classes_id_fk" FOREIGN KEY ("goods_class_default_id") REFERENCES "public"."goods_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_types" ADD CONSTRAINT "product_types_subcategory_id_product_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."product_subcategories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assortment_tenures_code_idx" ON "assortment_tenures" USING btree ("code");--> statement-breakpoint
CREATE INDEX "audience_age_groups_code_idx" ON "audience_age_groups" USING btree ("code");--> statement-breakpoint
CREATE INDEX "audience_genders_code_idx" ON "audience_genders" USING btree ("code");--> statement-breakpoint
CREATE INDEX "collections_code_idx" ON "collections" USING btree ("code");--> statement-breakpoint
CREATE INDEX "collections_status_idx" ON "collections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "constructions_code_idx" ON "constructions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "fit_blocks_code_idx" ON "fit_blocks" USING btree ("code");--> statement-breakpoint
CREATE INDEX "goods_classes_code_idx" ON "goods_classes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "material_weight_classes_code_idx" ON "material_weight_classes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "product_categories_code_idx" ON "product_categories" USING btree ("code");--> statement-breakpoint
CREATE INDEX "product_categories_status_idx" ON "product_categories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_subcategories_category_idx" ON "product_subcategories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_subcategories_code_idx" ON "product_subcategories" USING btree ("code");--> statement-breakpoint
CREATE INDEX "product_subcategories_status_idx" ON "product_subcategories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_types_subcategory_idx" ON "product_types" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX "product_types_code_idx" ON "product_types" USING btree ("code");--> statement-breakpoint
CREATE INDEX "product_types_status_idx" ON "product_types" USING btree ("status");--> statement-breakpoint
CREATE INDEX "selling_windows_code_idx" ON "selling_windows" USING btree ("code");--> statement-breakpoint
CREATE INDEX "size_scales_code_idx" ON "size_scales" USING btree ("code");--> statement-breakpoint
CREATE INDEX "use_cases_code_idx" ON "use_cases" USING btree ("code");--> statement-breakpoint
ALTER TABLE "factory_capabilities" ADD CONSTRAINT "factory_capabilities_subcategory_id_product_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."product_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_costing" ADD CONSTRAINT "factory_costing_subcategory_id_product_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."product_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factory_negotiations" ADD CONSTRAINT "factory_negotiations_subcategory_id_product_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."product_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_entries" ADD CONSTRAINT "studio_entries_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_audience_gender_id_audience_genders_id_fk" FOREIGN KEY ("audience_gender_id") REFERENCES "public"."audience_genders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_audience_age_group_id_audience_age_groups_id_fk" FOREIGN KEY ("audience_age_group_id") REFERENCES "public"."audience_age_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_selling_window_id_selling_windows_id_fk" FOREIGN KEY ("selling_window_id") REFERENCES "public"."selling_windows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_slots" ADD CONSTRAINT "season_slots_assortment_tenure_id_assortment_tenures_id_fk" FOREIGN KEY ("assortment_tenure_id") REFERENCES "public"."assortment_tenures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_construction_id_constructions_id_fk" FOREIGN KEY ("construction_id") REFERENCES "public"."constructions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_material_weight_class_id_material_weight_classes_id_fk" FOREIGN KEY ("material_weight_class_id") REFERENCES "public"."material_weight_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_fit_block_id_fit_blocks_id_fk" FOREIGN KEY ("fit_block_id") REFERENCES "public"."fit_blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_use_case_id_use_cases_id_fk" FOREIGN KEY ("use_case_id") REFERENCES "public"."use_cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_goods_class_id_goods_classes_id_fk" FOREIGN KEY ("goods_class_id") REFERENCES "public"."goods_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sku_concepts" ADD CONSTRAINT "sku_concepts_size_scale_id_size_scales_id_fk" FOREIGN KEY ("size_scale_id") REFERENCES "public"."size_scales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "factory_capabilities_subcategory_idx" ON "factory_capabilities" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX "factory_costing_subcategory_idx" ON "factory_costing" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX "season_slots_product_type_idx" ON "season_slots" USING btree ("product_type_id");--> statement-breakpoint
CREATE INDEX "season_slots_gender_idx" ON "season_slots" USING btree ("audience_gender_id");--> statement-breakpoint
CREATE INDEX "season_slots_collection_idx" ON "season_slots" USING btree ("collection_id");--> statement-breakpoint
ALTER TABLE "factory_capabilities" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "factory_costing" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "factory_negotiations" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "studio_entries" DROP COLUMN "collection_tag";--> statement-breakpoint
ALTER TABLE "season_slots" DROP COLUMN "collection";--> statement-breakpoint
ALTER TABLE "season_slots" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "season_slots" DROP COLUMN "gender";--> statement-breakpoint
DROP TYPE "public"."collection_tag";--> statement-breakpoint
DROP TYPE "public"."factory_category";--> statement-breakpoint
DROP TYPE "public"."gender";