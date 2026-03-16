/**
 * S3 Utility Functions
 * AWS SDK v3 wrapper for presigned uploads
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
const S3_PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL || process.env.AWS_CLOUDFRONT_URL;

/**
 * Generate S3 key for upload
 * Format: fusionmarkt/media/<usage>/<uuid>-<safe-filename>
 */
export function generateS3Key(filename: string, usage: string): string {
  const safeFilename = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
  
  const uuid = randomUUID();
  const key = `${S3_PREFIX}/media/${usage.toLowerCase()}/${uuid}-${safeFilename}`;
  
  return key;
}

/**
 * Generate public URL for S3 object
 */
export function getPublicUrl(key: string): string {
  if (S3_PUBLIC_BASE_URL) {
    // CloudFront or custom CDN
    return `${S3_PUBLIC_BASE_URL}/${key}`;
  }
  
  // Direct S3 URL
  const region = process.env.AWS_REGION || "eu-central-1";
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Generate presigned PUT URL for direct client upload
 * Expires in 5 minutes
 */
export async function generatePresignedPutUrl(
  key: string,
  mimeType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes
  });

  return signedUrl;
}

/**
 * Delete object from S3
 */
export async function deleteS3Object(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
  console.log(`✅ Deleted S3 object: ${key}`);
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
