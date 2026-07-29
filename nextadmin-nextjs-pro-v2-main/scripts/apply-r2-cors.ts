/**
 * R2 bucket'ının CORS kurallarını uygular.
 *
 * Medya yüklemeleri tarayıcıdan doğrudan R2'ye imzalı PUT ile gidiyor. R2'de
 * CORS kuralı tanımlı değilse tarayıcının preflight isteği "CORS not configured
 * for this bucket" ile reddediliyor ve yükleme hiç başlamıyor. Bu ayar bucket
 * üzerinde yaşadığı için depoda kod olarak tutuluyor: yeni bir bucket'a
 * geçildiğinde ya da kural silindiğinde tek komutla geri getirilebilsin.
 *
 * Çalıştırma:
 * cd nextadmin-nextjs-pro-v2-main
 * npx tsx --env-file=.env.local scripts/apply-r2-cors.ts
 */

import { PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";
import { getClient, STORAGE_BUCKET } from "@/lib/s3";

/** Tarayıcıdan yükleme yapan admin panelinin çalıştığı adresler. */
const ALLOWED_ORIGINS = [
  "https://admin.fusionmarkt.com",
  "http://127.0.0.1:3001",
  "http://localhost:3001",
];

async function main() {
  if (!STORAGE_BUCKET) {
    throw new Error("AWS_S3_BUCKET tanımlı değil.");
  }

  const client = getClient();

  await client.send(
    new PutBucketCorsCommand({
      Bucket: STORAGE_BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ALLOWED_ORIGINS,
            AllowedMethods: ["GET", "PUT", "HEAD"],
            // İmzalı PUT'ta tarayıcı Content-Type gönderiyor; preflight bu
            // başlığa izin verilmezse reddediliyor.
            AllowedHeaders: ["content-type"],
            ExposeHeaders: ["etag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  );

  const current = await client.send(
    new GetBucketCorsCommand({ Bucket: STORAGE_BUCKET })
  );

  console.log(`✅ CORS kuralları uygulandı: ${STORAGE_BUCKET}`);
  console.log(JSON.stringify(current.CORSRules, null, 2));
}

main().catch((error) => {
  console.error("❌ CORS kuralları uygulanamadı:", error);
  process.exit(1);
});
