/**
 * Render pipeline: persist render output image URLs into assets + asset_versions
 * and attach assetId/assetVersionId to output metadata. Placeholder URLs are
 * not persisted so existing fallback behavior is unchanged.
 */

import { db } from '@repo/db/client';
import { assets, assetVersions } from '@repo/db/schema';

/** Placeholder path prefix used by stub and fallback render output. */
const PLACEHOLDER_PATH_PREFIX = '/product/placeholders/';

export type RenderOutputImageEntry = {
  url?: string;
  label?: string;
  assetId?: string;
  assetVersionId?: string;
};

/**
 * Returns true if the URL is a known placeholder (stub/fallback). Such URLs
 * are not persisted to assets so placeholder behavior is unchanged.
 */
export function isPlaceholderRenderUrl(url: unknown): boolean {
  if (typeof url !== 'string' || !url.trim()) return true;
  const normalized = url.trim();
  return normalized.startsWith(PLACEHOLDER_PATH_PREFIX);
}

/** Default MIME for render output images when not inferrable from URL. */
const DEFAULT_RENDER_IMAGE_MIME = 'image/png';

/** Infer MIME from URL path extension for common image types. */
function inferMimeFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.webp') || lower.endsWith('.webp')) return 'image/webp';
  if (lower.includes('.gif') || lower.endsWith('.gif')) return 'image/gif';
  if (lower.includes('.svg') || lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.includes('.jpeg') || lower.includes('.jpg') || lower.endsWith('.jpg') || lower.endsWith('.jpeg'))
    return 'image/jpeg';
  return DEFAULT_RENDER_IMAGE_MIME;
}

/** Allowed MIME types for design/render assets (must match design flow). */
const ALLOWED_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIMES.has(mime.toLowerCase());
}

/**
 * Persist render output image URLs into assets + asset_versions (created by
 * userId), then return the same image entries with assetId/assetVersionId set
 * where persistence succeeded. Placeholder URLs are skipped (no record, no
 * linkage). Additive only: existing url/label are preserved.
 */
export async function persistRenderOutputImages(params: {
  imageEntries: RenderOutputImageEntry[];
  userId: string;
}): Promise<RenderOutputImageEntry[]> {
  const { imageEntries, userId } = params;
  if (!Array.isArray(imageEntries) || imageEntries.length === 0) {
    return imageEntries;
  }

  const result: RenderOutputImageEntry[] = [];

  for (let i = 0; i < imageEntries.length; i++) {
    const entry = imageEntries[i];
    const url = typeof entry?.url === 'string' ? entry.url.trim() : '';
    const label = typeof entry?.label === 'string' ? entry.label.trim() : undefined;

    if (!url) {
      result.push({ ...entry, url: '', label });
      continue;
    }

    if (isPlaceholderRenderUrl(url)) {
      result.push({ ...entry, url, label });
      continue;
    }

    const mime = inferMimeFromUrl(url);
    if (!isAllowedMime(mime)) {
      result.push({ ...entry, url, label });
      continue;
    }

    const title = label && label.length > 0 ? label : `Render output ${i + 1}`;

    try {
      const [asset] = await db
        .insert(assets)
        .values({
          title,
          type: mime.toLowerCase() === 'image/svg+xml' ? 'svg' : 'image',
          tags: [],
          createdBy: userId,
        })
        .returning();

      if (!asset) {
        result.push({ ...entry, url, label });
        continue;
      }

      const [version] = await db
        .insert(assetVersions)
        .values({
          assetId: asset.id,
          fileUrl: url,
          fileName: null,
          mime: mime.toLowerCase(),
          size: 0,
          status: 'draft',
          uploadedBy: userId,
        })
        .returning();

      if (version) {
        result.push({
          ...entry,
          url,
          label,
          assetId: asset.id,
          assetVersionId: version.id,
        });
      } else {
        result.push({ ...entry, url, label });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[persistRenderOutputImages] failed to persist image:', message);
      result.push({ ...entry, url, label });
    }
  }

  return result;
}
