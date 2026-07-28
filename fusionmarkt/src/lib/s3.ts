/**
 * Depolama yardımcıları — yorum görselleri, iade ve servis formu dosyaları.
 *
 * Depolama Cloudflare R2'de. R2, S3 uyumlu bir API sunduğu için istemci
 * @aws-sdk/client-s3 paketinden geliyor; bağlanılan yer AWS değil, S3_ENDPOINT
 * ile verilen R2 uç noktası.
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const S3_ENDPOINT = process.env.S3_ENDPOINT;
const BUCKET_NAME = process.env.AWS_S3_BUCKET;
const S3_PREFIX = process.env.S3_PREFIX || "fusionmarkt";
const S3_PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL;

let cachedClient: S3Client | null = null;

/**
 * Endpoint verilmezse SDK varsayılan olarak AWS'ye bağlanır. Sessizce yanlış
 * yere yazmak yerine hata veriyoruz.
 */
function getClient(): S3Client {
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
 * Generate S3 key for return request image
 * Format: <prefix>/return-requests/<orderNumber>/<timestamp>-<uuid>.<ext>
 */
export function generateReturnImageKey(orderNumber: string, filename: string): string {
  const safeFilename = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  const uuid = randomUUID().split('-')[0];
  const timestamp = Date.now();
  const ext = safeFilename.split('.').pop() || 'webp';
  
  return `${S3_PREFIX}/return-requests/${orderNumber}/${timestamp}-${uuid}.${ext}`;
}

/**
 * Yüklenen dosyanın CDN üzerindeki genel adresi.
 *
 * Adres veritabanına kaydedildiği için tahmin yürütmüyoruz: taban adres yoksa
 * hata veriyoruz. Aksi halde yanlış bir host kayıtlara yazılır ve sonradan
 * tek tek düzeltmek gerekir.
 */
export function getS3PublicUrl(key: string): string {
  if (!S3_PUBLIC_BASE_URL) {
    throw new Error(
      "S3_PUBLIC_BASE_URL tanımlı değil. Genel adres üretilemez."
    );
  }
  return `${S3_PUBLIC_BASE_URL}/${key}`;
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

  await getClient().send(command);

  return getS3PublicUrl(key);
}

/**
 * Generate S3 key for service form file
 * Format: <prefix>/service-forms/<timestamp>-<uuid>/<filename>
 */
export function generateServiceFormKey(filename: string): string {
  const safeFilename = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
  
  const uuid = randomUUID().split('-')[0];
  const timestamp = Date.now();
  const ext = safeFilename.split('.').pop() || 'bin';
  
  return `${S3_PREFIX}/service-forms/${timestamp}-${uuid}.${ext}`;
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

