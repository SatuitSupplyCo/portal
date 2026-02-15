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
import { documentsAcl, packsAcl, assetsAcl } from './permissions';
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
  }),
);

export const factoryCostingRelations = relations(
  factoryCosting,
  ({ one }) => ({
    factory: one(factories, {
      fields: [factoryCosting.factoryId],
      references: [factories.id],
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
    }),
    images: many(studioEntryImages),
    attachments: many(studioEntryAttachments),
    links: many(studioEntryLinks),
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
