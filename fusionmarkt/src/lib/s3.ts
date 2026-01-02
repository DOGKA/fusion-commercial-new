/**
 * S3 Utility Functions for Frontend
 * AWS SDK v3 wrapper for review image uploads
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// S3 Client (singleton)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "fusionmarkt";
const S3_PREFIX = process.env.S3_PREFIX || "fusionmarkt";

/**
 * Generate S3 key for review image
 * Format: <prefix>/product-comments/<userId>/<timestamp>-<uuid>.webp
 */
export function generateReviewImageKey(userId: string, filename: string): string {
  const safeFilename = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  const uuid = randomUUID().split('-')[0]; // Kısa UUID
  const timestamp = Date.now();
  const ext = safeFilename.split('.').pop() || 'webp';
  
  return `${S3_PREFIX}/product-comments/${userId}/${timestamp}-${uuid}.${ext}`;
}

/**
 * Generate public URL for S3 object
 */
export function getS3PublicUrl(key: string): string {
  const region = process.env.AWS_REGION || "eu-central-1";
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Upload file to S3
 */
export async function uploadToS3(
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    CacheControl: "public, max-age=31536000", // 1 yıl cache
  });

  await s3Client.send(command);
  
  return getS3PublicUrl(key);
}

/**
 * Check if S3 credentials are configured
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  );
}

