/**
 * Drizzle relations — defines the relational graph for the query API.
 *
 * All relations are defined in a single file to avoid circular imports
 * between schema files. These do NOT create DB-level constraints (those
 * are handled by .references() in each table definition). These enable
 * Drizzle's relational query builder (db.query.users.findMany({ with: ... })).
 */
import { relations } from 'drizzle-orm';
import { users, accounts, sessions } from './auth';
import { organizations, orgMemberships, invitations } from './organizations';
import { documents, documentBlocks } from './documents';
import { canonDocuments } from './canon';
import { assets, assetVersions } from './assets';
import { packs, packItems } from './packs';
import { tests, testAttachments, testLinks } from './tests';
import {
  factories,
  factoryCapabilities,
  factoryCosting,
  factorySamples,
  factoryRisk,
  factoryRelationship,
  factoryProductionRuns,
  factoryNegotiations,
  factoryAttachments,
  skuFactoryAssignments,
} from './sourcing';
import {
  studioEntries,
  studioEntryImages,
  studioEntryAttachments,
  studioEntryLinks,
} from './studio';
import {
  productCategories,
  productSubcategories,
  productTypes,
  constructions,
  materialWeightClasses,
  sellingWindows,
  assortmentTenures,
  fitBlocks,
  useCases,
  audienceGenders,
  audienceAgeGroups,
  goodsClasses,
  sizeScales,
  collections,
} from './product-taxonomy';
import {
  seasons,
  seasonSlots,
  skuConcepts,
  skuConceptTransitions,
  corePrograms,
  seasonCoreRefs,
  seasonColors,
} from './lifecycle';
import { brandContext } from './brand';
import { documentsAcl, packsAcl, assetsAcl } from './permissions';
import {
  permissions,
  roles,
  rolePermissions,
  userRoles,
  resourceGrants,
  rbacAuditLog,
} from './rbac';
import { publishLog } from './audit';

// ─── Auth relations ──────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  orgMemberships: many(orgMemberships),
  userRoles: many(userRoles),
  invitationsSent: many(invitations),
  documents: many(documents),
  canonDocuments: many(canonDocuments),
  assets: many(assets),
  assetVersionsUploaded: many(assetVersions),
  packs: many(packs),
  tests: many(tests),
  publishLogs: many(publishLog),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ─── Organization relations ──────────────────────────────────────────

export const organizationsRelations = relations(
  organizations,
  ({ many }) => ({
    members: many(users),
    memberships: many(orgMemberships),
    invitations: many(invitations),
    packs: many(packs),
    tests: many(tests),
    documentsAcl: many(documentsAcl),
    packsAcl: many(packsAcl),
    assetsAcl: many(assetsAcl),
  }),
);

export const orgMembershipsRelations = relations(
  orgMemberships,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [orgMemberships.orgId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [orgMemberships.userId],
      references: [users.id],
    }),
  }),
);

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.orgId],
    references: [organizations.id],
  }),
  invitedByUser: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

// ─── Document relations ──────────────────────────────────────────────

export const documentsRelations = relations(documents, ({ one, many }) => ({
  creator: one(users, {
    fields: [documents.createdBy],
    references: [users.id],
  }),
  blocks: many(documentBlocks),
  acl: many(documentsAcl),
}));

export const documentBlocksRelations = relations(
  documentBlocks,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentBlocks.documentId],
      references: [documents.id],
    }),
  }),
);

// ─── Canon relations ─────────────────────────────────────────────────

export const canonDocumentsRelations = relations(
  canonDocuments,
  ({ one }) => ({
    creator: one(users, {
      fields: [canonDocuments.createdBy],
      references: [users.id],
    }),
  }),
);

// ─── Asset relations ─────────────────────────────────────────────────

export const assetsRelations = relations(assets, ({ one, many }) => ({
  creator: one(users, {
    fields: [assets.createdBy],
    references: [users.id],
  }),
  versions: many(assetVersions),
  acl: many(assetsAcl),
}));

export const assetVersionsRelations = relations(
  assetVersions,
  ({ one }) => ({
    asset: one(assets, {
      fields: [assetVersions.assetId],
      references: [assets.id],
    }),
    uploader: one(users, {
      fields: [assetVersions.uploadedBy],
      references: [users.id],
    }),
  }),
);

// ─── Pack relations ──────────────────────────────────────────────────

export const packsRelations = relations(packs, ({ one, many }) => ({
  vendorOrg: one(organizations, {
    fields: [packs.vendorOrgId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [packs.createdBy],
    references: [users.id],
  }),
  items: many(packItems),
  acl: many(packsAcl),
}));

export const packItemsRelations = relations(packItems, ({ one }) => ({
  pack: one(packs, {
    fields: [packItems.packId],
    references: [packs.id],
    relationName: 'packItems',
  }),
  childPack: one(packs, {
    fields: [packItems.childPackId],
    references: [packs.id],
    relationName: 'childPackItems',
  }),
  assetVersion: one(assetVersions, {
    fields: [packItems.assetVersionId],
    references: [assetVersions.id],
  }),
  document: one(documents, {
    fields: [packItems.documentId],
    references: [documents.id],
  }),
  test: one(tests, {
    fields: [packItems.testId],
    references: [tests.id],
  }),
}));

// ─── Test relations ──────────────────────────────────────────────────

export const testsRelations = relations(tests, ({ one, many }) => ({
  vendorOrg: one(organizations, {
    fields: [tests.vendorOrgId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [tests.createdBy],
    references: [users.id],
  }),
  attachments: many(testAttachments),
  links: many(testLinks),
}));

export const testAttachmentsRelations = relations(
  testAttachments,
  ({ one }) => ({
    test: one(tests, {
      fields: [testAttachments.testId],
      references: [tests.id],
    }),
  }),
);

export const testLinksRelations = relations(testLinks, ({ one }) => ({
  test: one(tests, {
    fields: [testLinks.testId],
    references: [tests.id],
  }),
  pack: one(packs, {
    fields: [testLinks.packId],
    references: [packs.id],
  }),
  assetVersion: one(assetVersions, {
    fields: [testLinks.assetVersionId],
    references: [assetVersions.id],
  }),
  document: one(documents, {
    fields: [testLinks.documentId],
    references: [documents.id],
  }),
}));

// ─── ACL relations ───────────────────────────────────────────────────

export const documentsAclRelations = relations(documentsAcl, ({ one }) => ({
  document: one(documents, {
    fields: [documentsAcl.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentsAcl.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [documentsAcl.orgId],
    references: [organizations.id],
  }),
}));

export const packsAclRelations = relations(packsAcl, ({ one }) => ({
  pack: one(packs, {
    fields: [packsAcl.packId],
    references: [packs.id],
  }),
  user: one(users, {
    fields: [packsAcl.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [packsAcl.orgId],
    references: [organizations.id],
  }),
}));

export const assetsAclRelations = relations(assetsAcl, ({ one }) => ({
  asset: one(assets, {
    fields: [assetsAcl.assetId],
    references: [assets.id],
  }),
  user: one(users, {
    fields: [assetsAcl.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [assetsAcl.orgId],
    references: [organizations.id],
  }),
}));

// ─── Audit relations ─────────────────────────────────────────────────

export const publishLogRelations = relations(publishLog, ({ one }) => ({
  actor: one(users, {
    fields: [publishLog.actorUserId],
    references: [users.id],
  }),
}));

// ─── Sourcing relations ─────────────────────────────────────────────

export const factoriesRelations = relations(factories, ({ one, many }) => ({
  creator: one(users, {
    fields: [factories.createdBy],
    references: [users.id],
  }),
  capabilities: many(factoryCapabilities),
  costingProfiles: many(factoryCosting),
  samples: many(factorySamples),
  risk: many(factoryRisk),
  relationship: many(factoryRelationship),
  productionRuns: many(factoryProductionRuns),
  negotiations: many(factoryNegotiations),
  attachments: many(factoryAttachments),
  primaryAssignments: many(skuFactoryAssignments, {
    relationName: 'primaryFactory',
  }),
  backupAssignments: many(skuFactoryAssignments, {
    relationName: 'backupFactory',
  }),
}));

export const factoryCapabilitiesRelations = relations(
  factoryCapabilities,
  ({ one }) => ({
    factory: one(factories, {
      fields: [factoryCapabilities.factoryId],
      references: [factories.id],
    }),
    subcategory: one(productSubcategories, {
      fields: [factoryCapabilities.subcategoryId],
      references: [productSubcategories.id],
    }),
  }),
);

export const factoryCostingRelations = relations(
  factoryCosting,
  ({ one }) => ({
    factory: one(factories, {
      fields: [factoryCosting.factoryId],
      references: [factories.id],
    }),
    subcategory: one(productSubcategories, {
      fields: [factoryCosting.subcategoryId],
      references: [productSubcategories.id],
    }),
    skuConcept: one(skuConcepts, {
      fields: [factoryCosting.skuConceptId],
      references: [skuConcepts.id],
    }),
  }),
);

export const factorySamplesRelations = relations(
  factorySamples,
  ({ one }) => ({
    factory: one(factories, {
      fields: [factorySamples.factoryId],
      references: [factories.id],
    }),
    skuConcept: one(skuConcepts, {
      fields: [factorySamples.skuConceptId],
      references: [skuConcepts.id],
    }),
    creator: one(users, {
      fields: [factorySamples.createdBy],
      references: [users.id],
    }),
  }),
);

export const factoryRiskRelations = relations(factoryRisk, ({ one }) => ({
  factory: one(factories, {
    fields: [factoryRisk.factoryId],
    references: [factories.id],
  }),
}));

export const factoryRelationshipRelations = relations(
  factoryRelationship,
  ({ one }) => ({
    factory: one(factories, {
      fields: [factoryRelationship.factoryId],
      references: [factories.id],
    }),
  }),
);

export const factoryProductionRunsRelations = relations(
  factoryProductionRuns,
  ({ one }) => ({
    factory: one(factories, {
      fields: [factoryProductionRuns.factoryId],
      references: [factories.id],
    }),
    creator: one(users, {
      fields: [factoryProductionRuns.createdBy],
      references: [users.id],
    }),
  }),
);

export const factoryNegotiationsRelations = relations(
  factoryNegotiations,
  ({ one }) => ({
    factory: one(factories, {
      fields: [factoryNegotiations.factoryId],
      references: [factories.id],
    }),
    subcategory: one(productSubcategories, {
      fields: [factoryNegotiations.subcategoryId],
      references: [productSubcategories.id],
    }),
    negotiator: one(users, {
      fields: [factoryNegotiations.negotiatedBy],
      references: [users.id],
    }),
  }),
);

export const factoryAttachmentsRelations = relations(
  factoryAttachments,
  ({ one }) => ({
    factory: one(factories, {
      fields: [factoryAttachments.factoryId],
      references: [factories.id],
    }),
    uploader: one(users, {
      fields: [factoryAttachments.uploadedBy],
      references: [users.id],
    }),
  }),
);

export const skuFactoryAssignmentsRelations = relations(
  skuFactoryAssignments,
  ({ one }) => ({
    primaryFactory: one(factories, {
      fields: [skuFactoryAssignments.primaryFactoryId],
      references: [factories.id],
      relationName: 'primaryFactory',
    }),
    backupFactory: one(factories, {
      fields: [skuFactoryAssignments.backupFactoryId],
      references: [factories.id],
      relationName: 'backupFactory',
    }),
    skuConcept: one(skuConcepts, {
      fields: [skuFactoryAssignments.skuConceptId],
      references: [skuConcepts.id],
    }),
    creator: one(users, {
      fields: [skuFactoryAssignments.createdBy],
      references: [users.id],
    }),
  }),
);

// ─── Studio relations ───────────────────────────────────────────────

export const studioEntriesRelations = relations(
  studioEntries,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [studioEntries.createdBy],
      references: [users.id],
      relationName: 'studioCreator',
    }),
    promoter: one(users, {
      fields: [studioEntries.promotedBy],
      references: [users.id],
      relationName: 'studioPromoter',
    }),
    targetSeason: one(seasons, {
      fields: [studioEntries.targetSeasonId],
      references: [seasons.id],
    }),
    collectionRef: one(collections, {
      fields: [studioEntries.collectionId],
      references: [collections.id],
    }),
    images: many(studioEntryImages),
    attachments: many(studioEntryAttachments),
    links: many(studioEntryLinks),
    skuConcepts: many(skuConcepts),
    seasonColors: many(seasonColors),
  }),
);

export const studioEntryImagesRelations = relations(
  studioEntryImages,
  ({ one }) => ({
    entry: one(studioEntries, {
      fields: [studioEntryImages.entryId],
      references: [studioEntries.id],
    }),
    uploader: one(users, {
      fields: [studioEntryImages.uploadedBy],
      references: [users.id],
    }),
  }),
);

export const studioEntryAttachmentsRelations = relations(
  studioEntryAttachments,
  ({ one }) => ({
    entry: one(studioEntries, {
      fields: [studioEntryAttachments.entryId],
      references: [studioEntries.id],
    }),
    uploader: one(users, {
      fields: [studioEntryAttachments.uploadedBy],
      references: [users.id],
    }),
  }),
);

export const studioEntryLinksRelations = relations(
  studioEntryLinks,
  ({ one }) => ({
    entry: one(studioEntries, {
      fields: [studioEntryLinks.entryId],
      references: [studioEntries.id],
    }),
    creator: one(users, {
      fields: [studioEntryLinks.createdBy],
      references: [users.id],
    }),
  }),
);

// ─── Product Taxonomy relations ─────────────────────────────────────

export const productCategoriesRelations = relations(
  productCategories,
  ({ many }) => ({
    subcategories: many(productSubcategories),
  }),
);

export const productSubcategoriesRelations = relations(
  productSubcategories,
  ({ one, many }) => ({
    category: one(productCategories, {
      fields: [productSubcategories.categoryId],
      references: [productCategories.id],
    }),
    goodsClassDefault: one(goodsClasses, {
      fields: [productSubcategories.goodsClassDefaultId],
      references: [goodsClasses.id],
    }),
    productTypes: many(productTypes),
    factoryCapabilities: many(factoryCapabilities),
    factoryCosting: many(factoryCosting),
  }),
);

export const productTypesRelations = relations(
  productTypes,
  ({ one, many }) => ({
    subcategory: one(productSubcategories, {
      fields: [productTypes.subcategoryId],
      references: [productSubcategories.id],
    }),
    seasonSlots: many(seasonSlots),
  }),
);

export const collectionsRelations = relations(collections, ({ many }) => ({
  seasonSlots: many(seasonSlots),
}));

// ─── Lifecycle relations ────────────────────────────────────────────

export const seasonsRelations = relations(seasons, ({ one, many }) => ({
  creator: one(users, {
    fields: [seasons.createdBy],
    references: [users.id],
  }),
  slots: many(seasonSlots),
  coreRefs: many(seasonCoreRefs),
  colors: many(seasonColors),
  studioEntries: many(studioEntries),
}));

export const seasonSlotsRelations = relations(
  seasonSlots,
  ({ one, many }) => ({
    season: one(seasons, {
      fields: [seasonSlots.seasonId],
      references: [seasons.id],
    }),
    productType: one(productTypes, {
      fields: [seasonSlots.productTypeId],
      references: [productTypes.id],
    }),
    collection: one(collections, {
      fields: [seasonSlots.collectionId],
      references: [collections.id],
    }),
    audienceGender: one(audienceGenders, {
      fields: [seasonSlots.audienceGenderId],
      references: [audienceGenders.id],
    }),
    audienceAgeGroup: one(audienceAgeGroups, {
      fields: [seasonSlots.audienceAgeGroupId],
      references: [audienceAgeGroups.id],
    }),
    sellingWindow: one(sellingWindows, {
      fields: [seasonSlots.sellingWindowId],
      references: [sellingWindows.id],
    }),
    assortmentTenure: one(assortmentTenures, {
      fields: [seasonSlots.assortmentTenureId],
      references: [assortmentTenures.id],
    }),
    creator: one(users, {
      fields: [seasonSlots.createdBy],
      references: [users.id],
    }),
    skuConcept: one(skuConcepts, {
      fields: [seasonSlots.id],
      references: [skuConcepts.seasonSlotId],
    }),
  }),
);

export const skuConceptsRelations = relations(
  skuConcepts,
  ({ one, many }) => ({
    seasonSlot: one(seasonSlots, {
      fields: [skuConcepts.seasonSlotId],
      references: [seasonSlots.id],
    }),
    sourceStudioEntry: one(studioEntries, {
      fields: [skuConcepts.sourceStudioEntryId],
      references: [studioEntries.id],
    }),
    construction: one(constructions, {
      fields: [skuConcepts.constructionId],
      references: [constructions.id],
    }),
    materialWeightClass: one(materialWeightClasses, {
      fields: [skuConcepts.materialWeightClassId],
      references: [materialWeightClasses.id],
    }),
    fitBlock: one(fitBlocks, {
      fields: [skuConcepts.fitBlockId],
      references: [fitBlocks.id],
    }),
    useCase: one(useCases, {
      fields: [skuConcepts.useCaseId],
      references: [useCases.id],
    }),
    goodsClass: one(goodsClasses, {
      fields: [skuConcepts.goodsClassId],
      references: [goodsClasses.id],
    }),
    sizeScale: one(sizeScales, {
      fields: [skuConcepts.sizeScaleId],
      references: [sizeScales.id],
    }),
    creator: one(users, {
      fields: [skuConcepts.createdBy],
      references: [users.id],
    }),
    approver: one(users, {
      fields: [skuConcepts.approvedBy],
      references: [users.id],
    }),
    transitions: many(skuConceptTransitions),
    factorySamples: many(factorySamples),
    factoryCosting: many(factoryCosting),
    factoryAssignments: many(skuFactoryAssignments),
  }),
);

export const skuConceptTransitionsRelations = relations(
  skuConceptTransitions,
  ({ one }) => ({
    skuConcept: one(skuConcepts, {
      fields: [skuConceptTransitions.skuConceptId],
      references: [skuConcepts.id],
    }),
    actor: one(users, {
      fields: [skuConceptTransitions.actorUserId],
      references: [users.id],
    }),
  }),
);

export const coreProgramsRelations = relations(
  corePrograms,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [corePrograms.createdBy],
      references: [users.id],
    }),
    seasonRefs: many(seasonCoreRefs),
  }),
);

export const seasonCoreRefsRelations = relations(
  seasonCoreRefs,
  ({ one }) => ({
    season: one(seasons, {
      fields: [seasonCoreRefs.seasonId],
      references: [seasons.id],
    }),
    coreProgram: one(corePrograms, {
      fields: [seasonCoreRefs.coreProgramId],
      references: [corePrograms.id],
    }),
  }),
);

export const seasonColorsRelations = relations(
  seasonColors,
  ({ one }) => ({
    season: one(seasons, {
      fields: [seasonColors.seasonId],
      references: [seasons.id],
    }),
    studioEntry: one(studioEntries, {
      fields: [seasonColors.studioEntryId],
      references: [studioEntries.id],
    }),
    creator: one(users, {
      fields: [seasonColors.createdBy],
      references: [users.id],
    }),
  }),
);

// ─── RBAC relations ─────────────────────────────────────────────────

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionCode],
      references: [permissions.code],
    }),
  }),
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const resourceGrantsRelations = relations(
  resourceGrants,
  ({ one }) => ({
    grantedByUser: one(users, {
      fields: [resourceGrants.grantedBy],
      references: [users.id],
    }),
  }),
);

export const rbacAuditLogRelations = relations(rbacAuditLog, ({ one }) => ({
  actor: one(users, {
    fields: [rbacAuditLog.actorUserId],
    references: [users.id],
  }),
}));

// ─── Brand Context ──────────────────────────────────────────────────

export const brandContextRelations = relations(brandContext, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [brandContext.updatedBy],
    references: [users.id],
  }),
}));
