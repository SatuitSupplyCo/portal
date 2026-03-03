import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const DEFAULT_REGION = process.env.AWS_REGION ?? 'us-east-1';
const BUCKET = process.env.STUDIO_DESIGN_ASSET_BUCKET?.trim() ?? '';
const PUBLIC_BASE_URL = process.env.STUDIO_DESIGN_ASSET_PUBLIC_BASE_URL?.trim() ?? '';
const UPLOAD_TTL_SECONDS = 900;

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({ region: DEFAULT_REGION });
  }
  return s3Client;
}

function sanitizeFileName(fileName: string): string {
  const base = fileName.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
  return base || 'asset.bin';
}

function encodeKeyForUrl(key: string): string {
  return key.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

function buildPublicFileUrl(key: string): string {
  const encodedKey = encodeKeyForUrl(key);
  if (PUBLIC_BASE_URL) {
    return `${PUBLIC_BASE_URL.replace(/\/+$/, '')}/${encodedKey}`;
  }
  return `https://${BUCKET}.s3.${DEFAULT_REGION}.amazonaws.com/${encodedKey}`;
}

export function isDesignAssetStorageConfigured(): boolean {
  return Boolean(BUCKET);
}

export async function createDesignAssetUploadSlot(input: {
  userId: string;
  fileName: string;
  mime: string;
}): Promise<{
  uploadUrl: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresAt: string;
  fileUrl: string;
  assetKey: string;
}> {
  if (!isDesignAssetStorageConfigured()) {
    throw new Error('Design asset storage is not configured.');
  }

  const safeName = sanitizeFileName(input.fileName);
  const assetKey = `studio/design-assets/${input.userId}/${Date.now()}-${randomUUID()}-${safeName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: assetKey,
    ContentType: input.mime,
  });
  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: UPLOAD_TTL_SECONDS,
  });

  return {
    uploadUrl,
    method: 'PUT',
    headers: {
      'Content-Type': input.mime,
    },
    expiresAt: new Date(Date.now() + UPLOAD_TTL_SECONDS * 1000).toISOString(),
    fileUrl: buildPublicFileUrl(assetKey),
    assetKey,
  };
}
