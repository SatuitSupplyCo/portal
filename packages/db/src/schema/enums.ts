import { pgEnum } from 'drizzle-orm/pg-core';

// ─── User & org roles ────────────────────────────────────────────────

export const portalRoleEnum = pgEnum('portal_role', [
  'owner',
  'admin',
  'editor',
  'internal_viewer',
  'partner_viewer',
  'vendor_viewer',
]);

export const orgTypeEnum = pgEnum('org_type', ['vendor', 'partner']);

export const orgRoleEnum = pgEnum('org_role', ['org_admin', 'member']);

export const orgStatusEnum = pgEnum('org_status', [
  'active',
  'suspended',
  'archived',
]);

// ─── Content lifecycle ───────────────────────────────────────────────

export const documentStatusEnum = pgEnum('document_status', [
  'draft',
  'published',
  'archived',
]);

export const canonStatusEnum = pgEnum('canon_status', [
  'active',
  'deprecated',
]);

export const assetVersionStatusEnum = pgEnum('asset_version_status', [
  'draft',
  'approved',
  'deprecated',
]);

export const executionStatusEnum = pgEnum('execution_status', [
  'draft',
  'approved_sampling',
  'approved_bulk',
  'deprecated',
]);

// ─── Block types ─────────────────────────────────────────────────────

export const blockTypeEnum = pgEnum('block_type', [
  'text',
  'heading',
  'rule',
  'table',
  'image',
  'asset_ref',
  'test_ref',
  'techpack_ref',
  'pack_ref',
  'canon_ref',
  'callout',
]);

// ─── Pack & item types ───────────────────────────────────────────────

export const packKindEnum = pgEnum('pack_kind', [
  'tech_pack',
  'bundle',
  'vendor_pack',
  'partner_pack',
]);

export const packItemTypeEnum = pgEnum('pack_item_type', [
  'asset_version',
  'document',
  'test',
  'pack',
  'link',
]);

// ─── Tests ───────────────────────────────────────────────────────────

export const testResultEnum = pgEnum('test_result', [
  'pass',
  'fail',
  'mixed',
]);

// ─── Publishing & permissions ────────────────────────────────────────

export const publishActionEnum = pgEnum('publish_action', [
  'publish',
  'archive',
  'approve_sampling',
  'approve_bulk',
]);

export const aclPermissionEnum = pgEnum('acl_permission', [
  'read',
  'write',
  'admin',
]);

export const invitationStatusEnum = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'expired',
  'revoked',
]);

// ─── Sourcing ───────────────────────────────────────────────────────

export const factoryStatusEnum = pgEnum('factory_status', [
  'prospect',
  'screening',
  'sampling',
  'approved',
  'active',
  'dormant',
  'rejected',
]);

export const factoryTypeEnum = pgEnum('factory_type', [
  'knit',
  'woven',
  'swim',
  'accessories',
  'multi',
]);

export const factoryCategoryEnum = pgEnum('factory_category', [
  'tees',
  'fleece',
  'swim',
  'woven',
  'towels',
  'headwear',
  'accessories',
]);

export const sampleTypeEnum = pgEnum('sample_type', [
  'proto',
  'fit',
  'sms',
  'top',
]);

export const sampleDecisionEnum = pgEnum('sample_decision', [
  'approved',
  'revise',
  'rejected',
]);

export const relationshipStageEnum = pgEnum('relationship_stage', [
  'intro',
  'vetting',
  'strategic_partner',
]);

export const skuFactoryStatusEnum = pgEnum('sku_factory_status', [
  'proposed',
  'sampling',
  'approved',
  'production',
  'discontinued',
]);

export const productionRunStatusEnum = pgEnum('production_run_status', [
  'pre_production',
  'cutting',
  'sewing',
  'washing',
  'packing',
  'shipped',
  'delivered',
  'completed',
]);

export const negotiationOutcomeEnum = pgEnum('negotiation_outcome', [
  'accepted',
  'counter_offered',
  'rejected',
  'tabled',
]);

// ─── Studio ─────────────────────────────────────────────────────────

export const studioCategoryEnum = pgEnum('studio_category', [
  'product',
  'materials',
  'brand',
  'reference',
  'operational',
]);

export const studioStatusEnum = pgEnum('studio_status', [
  'raw',
  'exploring',
  'prototyping',
  'linked',
  'archived',
]);

export const studioInspirationSourceEnum = pgEnum('studio_inspiration_source', [
  'internal',
  'competitor',
  'archive',
  'vintage',
  'editorial',
  'trade_show',
  'mill_library',
  'street',
  'other',
]);

export const studioLinkTypeEnum = pgEnum('studio_link_type', [
  'sku_concept',
  'factory',
  'material',
  'sampling_request',
  'collection',
]);
