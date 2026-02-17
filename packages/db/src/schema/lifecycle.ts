/**
 * Product Lifecycle — seasons, slots, SKU concepts, core programs.
 *
 * This is the structured product governance layer of Satuit OS.
 * It enforces season-first planning, one-concept-per-SKU discipline,
 * and provides the audit trail for all lifecycle decisions.
 *
 * Tables:
 *   seasons                — strategic planning containers (Major / Minor)
 *   season_slots           — planned SKU slots within a season
 *   sku_concepts           — atomic execution units (one concept = one SKU)
 *   sku_concept_transitions — immutable audit trail for stage changes
 *   core_programs          — evergreen product programs (e.g., Fleece)
 *   season_core_refs       — junction: which core programs a season references
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  decimal,
  boolean,
  jsonb,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import {
  seasonTypeEnum,
  seasonStatusEnum,
  seasonSlotStatusEnum,
  skuConceptStatusEnum,
  coreProgramStatusEnum,
  seasonColorStatusEnum,
} from './enums';
import { users } from './auth';
import { studioEntries } from './studio';
import {
  productTypes,
  collections,
  audienceGenders,
  audienceAgeGroups,
  sellingWindows,
  assortmentTenures,
  constructions,
  materialWeightClasses,
  fitBlocks,
  useCases,
  goodsClasses,
  sizeScales,
} from './product-taxonomy';

// ─── 1. Seasons ─────────────────────────────────────────────────────

export const seasons = pgTable(
  'seasons',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    code: text('code').notNull().unique(), // e.g. "FW26", "WD26"
    name: text('name').notNull(), // e.g. "Fall 2026", "Winter Drop 2026"
    description: text('description'), // qualitative description of the season/line direction
    launchDate: timestamp('launch_date', { mode: 'date', withTimezone: true }), // target launch date
    seasonType: seasonTypeEnum('season_type').notNull(),
    status: seasonStatusEnum('status').notNull().default('planning'),

    // Planning targets
    targetSkuCount: integer('target_sku_count').notNull(),
    targetStyleCount: integer('target_style_count'),
    marginTarget: decimal('margin_target', { precision: 5, scale: 2 }),
    targetEvergreenPct: integer('target_evergreen_pct'),
    complexityBudget: integer('complexity_budget'),

    // Minor season cap (only applies when seasonType = 'minor')
    minorMaxSkus: integer('minor_max_skus'),

    // Palette & mix
    colorPalette: jsonb('color_palette').$type<string[]>().default([]),
    mixTargets: jsonb('mix_targets').$type<Record<string, number>>().default({}),

    // Planning targets by dimension (SKU count allocations)
    genderTargets: jsonb('gender_targets').$type<Record<string, number>>().default({}),
    categoryTargets: jsonb('category_targets').$type<Record<string, number>>().default({}),
    productTypeTargets: jsonb('product_type_targets').$type<Record<string, number>>().default({}),
    sellingWindowTargets: jsonb('selling_window_targets').$type<Record<string, number>>().default({}),
    tenureTargets: jsonb('tenure_targets').$type<Record<string, number>>().default({}),
    ageGroupTargets: jsonb('age_group_targets').$type<Record<string, number>>().default({}),
    weightClassTargets: jsonb('weight_class_targets').$type<Record<string, number>>().default({}),
    useCaseTargets: jsonb('use_case_targets').$type<Record<string, number>>().default({}),
    constructionTargets: jsonb('construction_targets').$type<Record<string, number>>().default({}),

    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('seasons_status_idx').on(table.status),
    index('seasons_type_idx').on(table.seasonType),
  ],
);

// ─── 2. Season Slots ────────────────────────────────────────────────

export const seasonSlots = pgTable(
  'season_slots',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),

    // Product taxonomy — leaf node gives category + subcategory transitively
    productTypeId: uuid('product_type_id')
      .notNull()
      .references(() => productTypes.id),

    // Merchandising collection — optional at creation, required before fill
    collectionId: uuid('collection_id').references(() => collections.id),

    // Planning dimensions (slot-level)
    audienceGenderId: uuid('audience_gender_id')
      .notNull()
      .references(() => audienceGenders.id),
    audienceAgeGroupId: uuid('audience_age_group_id')
      .notNull()
      .references(() => audienceAgeGroups.id),
    sellingWindowId: uuid('selling_window_id').references(
      () => sellingWindows.id,
    ),
    assortmentTenureId: uuid('assortment_tenure_id').references(
      () => assortmentTenures.id,
    ),

    // Planned colorways (studio entry IDs)
    colorwayIds: jsonb('colorway_ids').$type<string[]>().default([]),

    replacementFlag: boolean('replacement_flag').notNull().default(false),
    status: seasonSlotStatusEnum('status').notNull().default('open'),

    notes: text('notes'),

    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('season_slots_season_idx').on(table.seasonId),
    index('season_slots_status_idx').on(table.status),
    index('season_slots_product_type_idx').on(table.productTypeId),
    index('season_slots_collection_idx').on(table.collectionId),
    index('season_slots_gender_idx').on(table.audienceGenderId),
  ],
);

// ─── 3. SKU Concepts ────────────────────────────────────────────────

export const skuConcepts = pgTable(
  'sku_concepts',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    seasonSlotId: uuid('season_slot_id')
      .notNull()
      .unique()
      .references(() => seasonSlots.id),
    sourceStudioEntryId: uuid('source_studio_entry_id')
      .notNull()
      .references(() => studioEntries.id),

    // Immutable copy of studio structured data at promotion time
    metadataSnapshot: jsonb('metadata_snapshot')
      .$type<Record<string, unknown>>()
      .notNull(),

    // Product-detail dimensions (concept-level, apparel-optional for goods)
    constructionId: uuid('construction_id').references(() => constructions.id),
    materialWeightClassId: uuid('material_weight_class_id').references(
      () => materialWeightClasses.id,
    ),
    fitBlockId: uuid('fit_block_id').references(() => fitBlocks.id),
    useCaseId: uuid('use_case_id').references(() => useCases.id),
    goodsClassId: uuid('goods_class_id').references(() => goodsClasses.id),
    sizeScaleId: uuid('size_scale_id').references(() => sizeScales.id),

    status: skuConceptStatusEnum('status').notNull().default('draft'),

    // Ownership
    createdBy: text('created_by').references(() => users.id),
    approvedBy: text('approved_by').references(() => users.id),

    // Per-stage timestamps
    specAt: timestamp('spec_at', { mode: 'date', withTimezone: true }),
    samplingAt: timestamp('sampling_at', { mode: 'date', withTimezone: true }),
    costingAt: timestamp('costing_at', { mode: 'date', withTimezone: true }),
    approvedAt: timestamp('approved_at', { mode: 'date', withTimezone: true }),
    productionAt: timestamp('production_at', { mode: 'date', withTimezone: true }),
    liveAt: timestamp('live_at', { mode: 'date', withTimezone: true }),
    retiredAt: timestamp('retired_at', { mode: 'date', withTimezone: true }),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('sku_concepts_status_idx').on(table.status),
    index('sku_concepts_slot_idx').on(table.seasonSlotId),
    index('sku_concepts_source_idx').on(table.sourceStudioEntryId),
  ],
);

// ─── 4. SKU Concept Transitions (Audit Trail) ──────────────────────

export const skuConceptTransitions = pgTable(
  'sku_concept_transitions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    skuConceptId: uuid('sku_concept_id')
      .notNull()
      .references(() => skuConcepts.id, { onDelete: 'cascade' }),
    fromStatus: text('from_status').notNull(),
    toStatus: text('to_status').notNull(),

    actorUserId: text('actor_user_id')
      .notNull()
      .references(() => users.id),
    notes: text('notes'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('sku_concept_transitions_concept_idx').on(table.skuConceptId),
    index('sku_concept_transitions_actor_idx').on(table.actorUserId),
    index('sku_concept_transitions_created_idx').on(table.createdAt),
  ],
);

// ─── 5. Core Programs (Evergreen Layer) ─────────────────────────────

export const corePrograms = pgTable(
  'core_programs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    name: text('name').notNull(), // e.g. "Fleece Program"
    fabricSpec: text('fabric_spec'), // fabric details
    blockId: text('block_id'), // reference to pattern block

    silhouettes: jsonb('silhouettes').$type<string[]>().default([]),
    baseColorways: jsonb('base_colorways').$type<string[]>().default([]),

    status: coreProgramStatusEnum('status').notNull().default('active'),

    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('core_programs_status_idx').on(table.status),
  ],
);

// ─── 6. Season ↔ Color References ────────────────────────────────────

export const seasonColors = pgTable(
  'season_colors',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    studioEntryId: uuid('studio_entry_id')
      .notNull()
      .references(() => studioEntries.id, { onDelete: 'cascade' }),

    status: seasonColorStatusEnum('status').notNull().default('proposed'),
    sortOrder: integer('sort_order').notNull().default(0),

    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('season_colors_season_entry_unq').on(table.seasonId, table.studioEntryId),
    index('season_colors_season_idx').on(table.seasonId),
    index('season_colors_entry_idx').on(table.studioEntryId),
  ],
);

// ─── 7. Season ↔ Core Program References ────────────────────────────

export const seasonCoreRefs = pgTable(
  'season_core_refs',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    seasonId: uuid('season_id')
      .notNull()
      .references(() => seasons.id, { onDelete: 'cascade' }),
    coreProgramId: uuid('core_program_id')
      .notNull()
      .references(() => corePrograms.id, { onDelete: 'cascade' }),

    // Which colorways from the core program this season pulls in
    selectedColorways: jsonb('selected_colorways').$type<string[]>().default([]),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique('season_core_refs_season_program_unq').on(
      table.seasonId,
      table.coreProgramId,
    ),
    index('season_core_refs_season_idx').on(table.seasonId),
    index('season_core_refs_program_idx').on(table.coreProgramId),
  ],
);
