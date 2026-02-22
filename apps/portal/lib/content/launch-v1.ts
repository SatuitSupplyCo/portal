import type { TechPackData } from '@repo/types';

export {
  packMeta,
  lockRequired,
  skuGroups,
  allSkus,
  getSkuBySlug,
  getCollectionDisplayName,
  MEASUREMENT_SECTIONS,
  buildRequiredRoutes,
} from '@repo/types';
export type { MeasurementSection } from '@repo/types';

export const TECHPACK_BASE = '/internal/techpacks/launch-v1';

export function getSkuRoute(sku: TechPackData): string {
  return `${TECHPACK_BASE}/${sku.collectionSlug}/${sku.slug}`;
}
