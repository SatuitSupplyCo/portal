/**
 * Canonical color-related type definitions.
 *
 * Domain types used across Studio, Season Planning, and Slot management
 * all live here so there is a single source of truth.
 */

/** Lightweight payload passed to ColorDetailDialog for initial rendering. */
export interface ColorDetailData {
  id: string
  title: string
  hex: string | null
  pantone: string | null
  description?: string | null
  status?: string | null
  tags?: string[] | null
  owner?: string | null
  createdAt?: Date | string | null
  collectionName?: string | null
}

/** A color option used in pickers (slot color picker, season color picker, etc.). */
export interface ColorOption {
  id: string
  title: string
  hex: string | null
  pantone: string | null
  tags: string[]
  targetSeasonId: string | null
}

/** A season-color row joined with its studio entry + aggregated SKU count. */
export interface SeasonColorEntry {
  id: string
  studioEntryId: string
  status: 'confirmed' | 'proposed'
  sortOrder: number
  studioEntry: {
    id: string
    title: string
    categoryMetadata: Record<string, unknown> | null
    tags: string[] | null
  }
  skuCount: number
}
