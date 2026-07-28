/**
 * Depolama yardımcıları — medya kütüphanesi yüklemeleri.
 *
 * Depolama Cloudflare R2'de. R2, S3 uyumlu bir API sunduğu için istemci
 * @aws-sdk/client-s3 paketinden geliyor; bağlanılan yer AWS değil, S3_ENDPOINT
 * ile verilen R2 uç noktası.
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const S3_ENDPOINT = process.env.S3_ENDPOINT;
const BUCKET_NAME = process.env.AWS_S3_BUCKET;
const S3_PREFIX = process.env.S3_PREFIX || "fusionmarkt";
const S3_PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL;

/** Yükleme yapan rotaların kendi istemcisini kurmaması için dışa açıldı. */
export const STORAGE_BUCKET = BUCKET_NAME;

let cachedClient: S3Client | null = null;

/**
 * Endpoint verilmezse SDK varsayılan olarak AWS'ye bağlanır. Sessizce yanlış
 * yere yazmak yerine hata veriyoruz.
 */
export function getClient(): S3Client {
  if (cachedClient) return cachedClient;
  if (!S3_ENDPOINT) {
    throw new Error(
      "S3_ENDPOINT tanımlı değil. R2 uç noktası olmadan dosya yüklenemez."
    );
  }
  cachedClient = new S3Client({
    region: process.env.AWS_REGION || "auto",
    endpoint: S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  return cachedClient;
}

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
 * Yüklenen dosyanın CDN üzerindeki genel adresi.
 *
 * Adres veritabanına kaydedildiği için tahmin yürütmüyoruz: taban adres yoksa
 * hata veriyoruz. Aksi halde yanlış bir host kayıtlara yazılır ve sonradan
 * tek tek düzeltmek gerekir.
 */
export function getPublicUrl(key: string): string {
  if (!S3_PUBLIC_BASE_URL) {
    throw new Error(
      "S3_PUBLIC_BASE_URL tanımlı değil. Genel adres üretilemez."
    );
  }
  return `${S3_PUBLIC_BASE_URL}/${key}`;
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

  const signedUrl = await getSignedUrl(getClient(), command, {
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

  await getClient().send(command);
  console.log(`✅ Deleted object: ${key}`);
}

/**
 * Check if storage credentials are configured
 */
export function isS3Configured(): boolean {
  return !!(
    S3_ENDPOINT &&
    S3_PUBLIC_BASE_URL &&
    BUCKET_NAME &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );
}
