/**
 * Brand Context — strategic brand-level data for AI and planning.
 *
 * Single-row configuration table (one row = the brand).
 * Provides structured strategy fields that are editable in the BOS
 * and consumed by AI prompts via the distilled `contextBrief`.
 */
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const brandContext = pgTable('brand_context', {
  id: uuid('id').defaultRandom().primaryKey(),

  positioning: text('positioning'),
  targetCustomer: text('target_customer'),
  priceArchitecture: text('price_architecture'),
  aestheticDirection: text('aesthetic_direction'),
  categoryStrategy: text('category_strategy'),
  antiSpec: text('anti_spec'),

  contextBrief: text('context_brief'),
  contextBriefUpdatedAt: timestamp('context_brief_updated_at', {
    mode: 'date',
    withTimezone: true,
  }),

  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  updatedBy: text('updated_by').references(() => users.id),
});
