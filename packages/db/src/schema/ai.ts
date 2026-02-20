/**
 * AI — suggestion logging for model training and analytics.
 *
 * Tracks every AI suggestion surfaced to users and their outcome
 * (selected, rejected, regenerated) so feedback can inform future
 * model tuning and prompt iteration.
 */

import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

export const aiSuggestionLog = pgTable(
  'ai_suggestion_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    feature: text('feature').notNull(),
    fieldName: text('field_name'),
    context: jsonb('context').$type<Record<string, unknown>>().notNull(),
    suggestions: jsonb('suggestions')
      .$type<Array<{ value: string; rationale: string }>>()
      .notNull(),
    selectedValue: text('selected_value'),
    outcome: text('outcome').notNull(), // 'selected' | 'rejected' | 'regenerated'

    inputTokens: integer('input_tokens'),
    outputTokens: integer('output_tokens'),
    latencyMs: integer('latency_ms'),

    userId: text('user_id').references(() => users.id),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('ai_suggestion_log_feature_idx').on(table.feature),
    index('ai_suggestion_log_user_idx').on(table.userId),
  ],
);
