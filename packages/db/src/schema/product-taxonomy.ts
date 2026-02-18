/**
 * Product Taxonomy — the unified classification system for all products.
 *
 * Three-level hierarchy:
 *   product_categories     → top-level navigation (Tops, Bottoms, Outerwear, etc.)
 *   product_subcategories  → grouping within category (Tees, Knits & Layering, etc.)
 *   product_types          → leaf-node product classification (Short-Sleeve Tee, Henley, etc.)
 *
 * Dimension lookup tables (admin-managed, replacing hard-coded enums):
 *   constructions           → how the product is built (knit, woven, etc.)
 *   material_weight_classes → relative weight (light, mid, heavy, insulated)
 *   selling_windows         → when it's sold (core year-round, SS, FW, etc.)
 *   assortment_tenures      → how long it stays in the line (evergreen, multi-season, etc.)
 *   fit_blocks              → shared pattern/fit family (modern classic, relaxed, etc.)
 *   use_cases               → functional intent (everyday, layering, etc.)
 *   audience_genders        → gender segmentation (mens, womens, unisex)
 *   audience_age_groups     → age segmentation (adult, toddler, kids, youth)
 *   goods_classes           → goods sub-classification (softgoods, hardgoods)
 *   size_scales             → sizing system (alpha S-XL, numeric 28-38, one-size)
 *
 * Merchandising:
 *   collections             → line/merchandising groupings (Core, Material Story, etc.)
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { taxonomyStatusEnum } from './enums';

// ═══════════════════════════════════════════════════════════════════════
// PRODUCT HIERARCHY
// ═══════════════════════════════════════════════════════════════════════

// ─── 1. Product Categories ──────────────────────────────────────────

export const productCategories = pgTable(
  'product_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    name: text('name').notNull(),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),
    taxonomyVersion: text('taxonomy_version').default('v1.0'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('product_categories_code_idx').on(table.code),
    index('product_categories_status_idx').on(table.status),
  ],
);

// ─── 2. Product Subcategories ───────────────────────────────────────

export const productSubcategories = pgTable(
  'product_subcategories',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    name: text('name').notNull(),

    categoryId: uuid('category_id')
      .notNull()
      .references(() => productCategories.id, { onDelete: 'cascade' }),

    goodsClassDefaultId: uuid('goods_class_default_id').references(
      () => goodsClasses.id,
    ),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),
    taxonomyVersion: text('taxonomy_version').default('v1.0'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('product_subcategories_category_idx').on(table.categoryId),
    index('product_subcategories_code_idx').on(table.code),
    index('product_subcategories_status_idx').on(table.status),
  ],
);

// ─── 3. Product Types (leaf nodes) ─────────────────────────────────

export const productTypes = pgTable(
  'product_types',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    name: text('name').notNull(),

    subcategoryId: uuid('subcategory_id')
      .notNull()
      .references(() => productSubcategories.id, { onDelete: 'cascade' }),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),
    taxonomyVersion: text('taxonomy_version').default('v1.0'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('product_types_subcategory_idx').on(table.subcategoryId),
    index('product_types_code_idx').on(table.code),
    index('product_types_status_idx').on(table.status),
  ],
);

// ═══════════════════════════════════════════════════════════════════════
// DIMENSION LOOKUP TABLES
// ═══════════════════════════════════════════════════════════════════════

// ─── 4. Constructions ───────────────────────────────────────────────

export const constructions = pgTable(
  'constructions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    label: text('label').notNull(),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('constructions_code_idx').on(table.code)],
);

// ─── 5. Material Weight Classes ─────────────────────────────────────

export const materialWeightClasses = pgTable(
  'material_weight_classes',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    label: text('label').notNull(),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('material_weight_classes_code_idx').on(table.code)],
);

// ─── 6. Selling Windows ─────────────────────────────────────────────

export const sellingWindows = pgTable(
  'selling_windows',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    label: text('label').notNull(),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('selling_windows_code_idx').on(table.code)],
);

// ─── 7. Assortment Tenures ──────────────────────────────────────────

export const assortmentTenures = pgTable(
  'assortment_tenures',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    label: text('label').notNull(),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('assortment_tenures_code_idx').on(table.code)],
);

// ─── 8. Fit Blocks ──────────────────────────────────────────────────

export const fitBlocks = pgTable(
  'fit_blocks',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    label: text('label').notNull(),

    patternBlockRef: text('pattern_block_ref'),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('fit_blocks_code_idx').on(table.code)],
);

// ─── 9. Use Cases ───────────────────────────────────────────────────

export const useCases = pgTable(
  'use_cases',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    label: text('label').notNull(),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('use_cases_code_idx').on(table.code)],
);

// ─── 10. Audience Genders ───────────────────────────────────────────

export const audienceGenders = pgTable(
  'audience_genders',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    label: text('label').notNull(),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('audience_genders_code_idx').on(table.code)],
);

// ─── 11. Audience Age Groups ────────────────────────────────────────

export const audienceAgeGroups = pgTable(
  'audience_age_groups',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    label: text('label').notNull(),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('audience_age_groups_code_idx').on(table.code)],
);

// ─── 12. Goods Classes ──────────────────────────────────────────────

export const goodsClasses = pgTable(
  'goods_classes',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    label: text('label').notNull(),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('goods_classes_code_idx').on(table.code)],
);

// ─── 13. Size Scales ────────────────────────────────────────────────

export const sizeScales = pgTable(
  'size_scales',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    label: text('label').notNull(),

    sizes: jsonb('sizes').$type<string[]>().notNull(),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('size_scales_code_idx').on(table.code)],
);

// ═══════════════════════════════════════════════════════════════════════
// MERCHANDISING
// ═══════════════════════════════════════════════════════════════════════

// ─── 14. Collections ────────────────────────────────────────────────

export const collections = pgTable(
  'collections',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),

    // Strategy fields (editable, consumed by AI via contextBrief)
    intent: text('intent'),
    designMandate: text('design_mandate'),
    brandingMandate: text('branding_mandate'),
    systemRole: text('system_role'),

    // AI-distilled summary of strategy fields
    contextBrief: text('context_brief'),
    contextBriefUpdatedAt: timestamp('context_brief_updated_at', {
      mode: 'date',
      withTimezone: true,
    }),

    sortOrder: integer('sort_order').notNull().default(0),
    status: taxonomyStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('collections_code_idx').on(table.code),
    index('collections_status_idx').on(table.status),
  ],
);
