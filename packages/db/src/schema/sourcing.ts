/**
 * Sourcing CRM — the factory relationship and sourcing intelligence system.
 *
 * Tables:
 *   factories            — primary factory entity (system of record)
 *   factory_capabilities — multi-category capability mapping
 *   factory_costing      — cost profiles and margin guardrails
 *   factory_samples      — sampling & development history
 *   factory_risk         — risk & compliance monitoring
 *   factory_relationship — qualitative relationship intelligence
 *   factory_production_runs — production tracking & performance
 *   factory_negotiations — institutional memory for negotiations
 *   factory_attachments  — NDA / audit / cert / photo vault
 *   sku_factory_assignments — SKU ↔ factory mapping with governance
 */
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  decimal,
  date,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import {
  factoryStatusEnum,
  factoryTypeEnum,
  sampleTypeEnum,
  sampleDecisionEnum,
  relationshipStageEnum,
  skuFactoryStatusEnum,
  productionRunStatusEnum,
  negotiationOutcomeEnum,
} from './enums';
import { users } from './auth';
import { productSubcategories } from './product-taxonomy';

// ─── 1. Factories (Primary Entity) ─────────────────────────────────

export const factories = pgTable(
  'factories',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Identity
    legalName: text('legal_name').notNull(),
    tradingName: text('trading_name'),
    country: text('country').notNull(),
    region: text('region'),
    city: text('city'),

    // Contacts
    primaryContactName: text('primary_contact_name'),
    primaryContactEmail: text('primary_contact_email'),
    whatsapp: text('whatsapp'),
    website: text('website'),

    // Classification
    factoryType: factoryTypeEnum('factory_type').notNull(),
    verticalIntegration: boolean('vertical_integration')
      .notNull()
      .default(false),

    // Capacity
    capacityUnitsPerMonth: integer('capacity_units_per_month'),
    minOrderQuantity: integer('min_order_quantity'),
    avgLeadTimeDays: integer('avg_lead_time_days'),
    sampleLeadTimeDays: integer('sample_lead_time_days'),

    // Commercial
    paymentTerms: text('payment_terms'),
    currency: text('currency').default('USD'),

    // Certifications (stored as JSON arrays)
    sustainabilityCertifications: jsonb('sustainability_certifications')
      .$type<string[]>()
      .default([]),
    complianceCertifications: jsonb('compliance_certifications')
      .$type<string[]>()
      .default([]),

    // Lifecycle
    status: factoryStatusEnum('status').notNull().default('prospect'),
    strategicScore: decimal('strategic_score', {
      precision: 3,
      scale: 2,
    }),
    lastReviewedAt: date('last_reviewed_at', { mode: 'date' }),

    // Internal
    internalOwner: text('internal_owner'),
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
    index('factories_status_idx').on(table.status),
    index('factories_country_idx').on(table.country),
    index('factories_type_idx').on(table.factoryType),
    index('factories_score_idx').on(table.strategicScore),
  ],
);

// ─── 2. Factory Capabilities ────────────────────────────────────────

export const factoryCapabilities = pgTable(
  'factory_capabilities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    factoryId: uuid('factory_id')
      .notNull()
      .references(() => factories.id, { onDelete: 'cascade' }),

    subcategoryId: uuid('subcategory_id')
      .notNull()
      .references(() => productSubcategories.id),
    specialty: text('specialty'), // e.g. "8.5 oz heavyweight jersey"
    inHousePatterning: boolean('in_house_patterning')
      .notNull()
      .default(false),
    inHouseDyeing: boolean('in_house_dyeing').notNull().default(false),
    inHouseKnitting: boolean('in_house_knitting').notNull().default(false),

    // Ratings 1–5
    technicalComplexityRating: integer('technical_complexity_rating'),
    premiumFinishingRating: integer('premium_finishing_rating'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('factory_capabilities_factory_idx').on(table.factoryId),
    index('factory_capabilities_subcategory_idx').on(table.subcategoryId),
  ],
);

// ─── 3. Factory Costing Profiles ────────────────────────────────────

export const factoryCosting = pgTable(
  'factory_costing',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    factoryId: uuid('factory_id')
      .notNull()
      .references(() => factories.id, { onDelete: 'cascade' }),

    subcategoryId: uuid('subcategory_id')
      .notNull()
      .references(() => productSubcategories.id),

    // FOB range
    targetFobRangeLow: decimal('target_fob_range_low', {
      precision: 10,
      scale: 2,
    }),
    targetFobRangeHigh: decimal('target_fob_range_high', {
      precision: 10,
      scale: 2,
    }),

    // Markup tracking
    fabricMarkupPercent: decimal('fabric_markup_percent', {
      precision: 5,
      scale: 2,
    }),
    trimMarkupPercent: decimal('trim_markup_percent', {
      precision: 5,
      scale: 2,
    }),

    // Landed cost
    freightAssumption: decimal('freight_assumption', {
      precision: 10,
      scale: 2,
    }),
    dutiesEstimatePercent: decimal('duties_estimate_percent', {
      precision: 5,
      scale: 2,
    }),
    landedCostMultiplier: decimal('landed_cost_multiplier', {
      precision: 5,
      scale: 3,
    }),

    // Viability
    marginViabilityScore: integer('margin_viability_score'), // 1–5

    skuConceptId: uuid('sku_concept_id'), // FK to sku_concepts — defined in relations
    season: text('season'), // e.g. "FW25", "SS26"
    notes: text('notes'),

    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('factory_costing_factory_idx').on(table.factoryId),
    index('factory_costing_subcategory_idx').on(table.subcategoryId),
  ],
);

// ─── 4. Samples & Development History ──────────────────────────────

export const factorySamples = pgTable(
  'factory_samples',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    factoryId: uuid('factory_id')
      .notNull()
      .references(() => factories.id, { onDelete: 'cascade' }),

    skuId: text('sku_id'),
    skuConceptId: uuid('sku_concept_id'), // FK to sku_concepts — defined in relations
    techPackId: uuid('tech_pack_id'),

    sampleType: sampleTypeEnum('sample_type').notNull(),

    // Timeline
    requestedAt: date('requested_at', { mode: 'date' }),
    shippedAt: date('shipped_at', { mode: 'date' }),
    receivedAt: date('received_at', { mode: 'date' }),

    // Scores 1–5
    qualityScore: integer('quality_score'),
    fitScore: integer('fit_score'),
    constructionScore: integer('construction_score'),
    accuracyScore: integer('accuracy_score'),
    communicationScore: integer('communication_score'),

    // Revisions
    revisionCount: integer('revision_count').notNull().default(0),

    // Outcome
    finalDecision: sampleDecisionEnum('final_decision'),
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
    index('factory_samples_factory_idx').on(table.factoryId),
    index('factory_samples_type_idx').on(table.sampleType),
    index('factory_samples_decision_idx').on(table.finalDecision),
  ],
);

// ─── 5. Risk & Compliance Monitoring ────────────────────────────────

export const factoryRisk = pgTable(
  'factory_risk',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    factoryId: uuid('factory_id')
      .notNull()
      .references(() => factories.id, { onDelete: 'cascade' })
      .unique(),

    // Risk scores 1–5
    geopoliticalRisk: integer('geopolitical_risk'),
    financialStability: integer('financial_stability'),
    laborRisk: integer('labor_risk'),
    supplyChainDepth: integer('supply_chain_depth'),
    redundancyScore: integer('redundancy_score'),

    riskNotes: text('risk_notes'),

    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('factory_risk_factory_idx').on(table.factoryId),
  ],
);

// ─── 6. Relationship Intelligence ───────────────────────────────────

export const factoryRelationship = pgTable(
  'factory_relationship',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    factoryId: uuid('factory_id')
      .notNull()
      .references(() => factories.id, { onDelete: 'cascade' })
      .unique(),

    // Qualitative scores 1–5
    brandAlignmentScore: integer('brand_alignment_score'),
    responsivenessScore: integer('responsiveness_score'),
    transparencyScore: integer('transparency_score'),
    innovationScore: integer('innovation_score'),
    negotiationFlexibility: integer('negotiation_flexibility'),
    longTermPartnerPotential: integer('long_term_partner_potential'),

    // Relationship
    internalOwner: text('internal_owner'),
    relationshipStage: relationshipStageEnum('relationship_stage')
      .notNull()
      .default('intro'),

    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('factory_relationship_factory_idx').on(table.factoryId),
    index('factory_relationship_stage_idx').on(table.relationshipStage),
  ],
);

// ─── 7. Production Run Tracking ─────────────────────────────────────

export const factoryProductionRuns = pgTable(
  'factory_production_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    factoryId: uuid('factory_id')
      .notNull()
      .references(() => factories.id, { onDelete: 'cascade' }),

    skuId: text('sku_id'),
    poNumber: text('po_number'),
    season: text('season'),
    quantity: integer('quantity'),

    status: productionRunStatusEnum('status')
      .notNull()
      .default('pre_production'),

    // Timeline
    plannedStartDate: date('planned_start_date', { mode: 'date' }),
    actualStartDate: date('actual_start_date', { mode: 'date' }),
    plannedShipDate: date('planned_ship_date', { mode: 'date' }),
    actualShipDate: date('actual_ship_date', { mode: 'date' }),
    deliveredDate: date('delivered_date', { mode: 'date' }),

    // Quality
    qcPassRate: decimal('qc_pass_rate', { precision: 5, scale: 2 }),
    defectRate: decimal('defect_rate', { precision: 5, scale: 2 }),

    // Performance
    onTimeDelivery: boolean('on_time_delivery'),
    leadTimeDeviation: integer('lead_time_deviation_days'),

    // Financial
    chargebackAmount: decimal('chargeback_amount', {
      precision: 10,
      scale: 2,
    }),
    chargebackReason: text('chargeback_reason'),

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
    index('factory_prod_runs_factory_idx').on(table.factoryId),
    index('factory_prod_runs_status_idx').on(table.status),
    index('factory_prod_runs_season_idx').on(table.season),
  ],
);

// ─── 8. Negotiation & Institutional Memory ──────────────────────────

export const factoryNegotiations = pgTable(
  'factory_negotiations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    factoryId: uuid('factory_id')
      .notNull()
      .references(() => factories.id, { onDelete: 'cascade' }),

    season: text('season'),
    subcategoryId: uuid('subcategory_id').references(
      () => productSubcategories.id,
    ),
    subject: text('subject').notNull(), // e.g. "MOQ reduction", "payment terms"

    // What happened
    ourAsk: text('our_ask'),
    theirResponse: text('their_response'),
    outcome: negotiationOutcomeEnum('outcome'),
    finalTerms: text('final_terms'),

    // Pricing context
    previousPrice: decimal('previous_price', { precision: 10, scale: 2 }),
    negotiatedPrice: decimal('negotiated_price', { precision: 10, scale: 2 }),
    priceChangePercent: decimal('price_change_percent', {
      precision: 5,
      scale: 2,
    }),

    lessonsLearned: text('lessons_learned'),

    negotiatedBy: text('negotiated_by').references(() => users.id),
    negotiatedAt: date('negotiated_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('factory_negotiations_factory_idx').on(table.factoryId),
    index('factory_negotiations_season_idx').on(table.season),
  ],
);

// ─── 9. Factory Attachments Vault ───────────────────────────────────

export const factoryAttachments = pgTable(
  'factory_attachments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    factoryId: uuid('factory_id')
      .notNull()
      .references(() => factories.id, { onDelete: 'cascade' }),

    fileUrl: text('file_url').notNull(),
    fileName: text('file_name').notNull(),
    fileType: text('file_type'), // nda | audit | cert | photo | lab_dip | other
    caption: text('caption'),
    expiresAt: date('expires_at', { mode: 'date' }), // For certs with expiry

    uploadedBy: text('uploaded_by').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('factory_attachments_factory_idx').on(table.factoryId),
    index('factory_attachments_type_idx').on(table.fileType),
  ],
);

// ─── 10. SKU ↔ Factory Assignment ───────────────────────────────────

export const skuFactoryAssignments = pgTable(
  'sku_factory_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    skuId: text('sku_id').notNull(),
    skuConceptId: uuid('sku_concept_id'), // FK to sku_concepts — defined in relations
    primaryFactoryId: uuid('primary_factory_id')
      .notNull()
      .references(() => factories.id),
    backupFactoryId: uuid('backup_factory_id').references(() => factories.id),

    status: skuFactoryStatusEnum('status').notNull().default('proposed'),
    marginTargetMet: boolean('margin_target_met').notNull().default(false),
    approvedForProduction: boolean('approved_for_production')
      .notNull()
      .default(false),

    season: text('season'),
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
    index('sku_factory_sku_idx').on(table.skuId),
    index('sku_factory_primary_idx').on(table.primaryFactoryId),
    index('sku_factory_status_idx').on(table.status),
  ],
);
