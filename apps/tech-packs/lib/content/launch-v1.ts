import type { TechPackData } from '@repo/types';
import { buildRequiredRoutes } from '@repo/types';

export {
  packMeta,
  lockRequired,
  skuGroups,
  allSkus,
  getSkuBySlug,
  getCollectionDisplayName,
  MEASUREMENT_SECTIONS,
} from '@repo/types';
export type { MeasurementSection } from '@repo/types';

const TECHPACK_BASE = '/pack/launch-v1';

export function getSkuRoute(sku: TechPackData): string {
  return `${TECHPACK_BASE}/${sku.collectionSlug}/${sku.slug}`;
}

export const REQUIRED_ROUTES = buildRequiredRoutes(TECHPACK_BASE);
