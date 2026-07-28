/**
 * Veritabanındaki tüm metin sütunlarını tarayıp AWS/S3 adresi kalıp kalmadığını
 * raporlar.
 *
 * Sistem Cloudflare R2'ye taşındıktan sonra kayıtlarda eski
 * `*.amazonaws.com` adresleri kalmışsa bu görseller canlıda 403 döner.
 * Bucket public erişime kapatıldığı an kırık görsele dönüşürler.
 *
 * Yalnızca SELECT çalıştırır, hiçbir şey yazmaz.
 *
 * Kullanım (repo kökünden):
 *   npx tsx scripts/scan-aws-references.ts
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(SCRIPT_DIR);

function loadDatabaseEnv() {
  if (process.env.DATABASE_URL) return;
  for (const rel of [
    "fusionmarkt/.env",
    "fusionmarkt/.env.local",
    "packages/db/.env",
    ".env",
  ]) {
    const candidate = join(REPO_ROOT, rel);
    if (!existsSync(candidate)) continue;
    process.loadEnvFile(candidate);
    if (process.env.DATABASE_URL) return;
  }
  console.error("DATABASE_URL bulunamadı.");
  process.exit(1);
}

loadDatabaseEnv();

const prisma = new PrismaClient();

const NEEDLE = "amazonaws.com";

type Column = { table_name: string; column_name: string };

async function main() {
  const columns = await prisma.$queryRaw<Column[]>`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'character')
    ORDER BY table_name, column_name
  `;

  console.log(`${columns.length} metin sütunu taranıyor…\n`);

  const hits: { table: string; column: string; rows: number; sample: string }[] = [];

  for (const { table_name, column_name } of columns) {
    // Tablo/sütun adları information_schema'dan geldiği için güvenli; yine de
    // çift tırnakla kaçırıp enjeksiyon yüzeyini kapatıyoruz.
    const t = `"${table_name.replace(/"/g, '""')}"`;
    const c = `"${column_name.replace(/"/g, '""')}"`;

    try {
      const res = await prisma.$queryRawUnsafe<{ n: bigint; sample: string | null }[]>(
        `SELECT COUNT(*)::bigint AS n, MIN(${c}) AS sample
         FROM ${t} WHERE ${c} LIKE '%' || $1 || '%'`,
        NEEDLE
      );
      const n = Number(res[0]?.n ?? 0);
      if (n > 0) {
        const raw = res[0]?.sample ?? "";
        const at = raw.indexOf(NEEDLE);
        const sample = raw
          .slice(Math.max(0, at - 60), at + 40)
          .replace(/\s+/g, " ");
        hits.push({ table: table_name, column: column_name, rows: n, sample });
      }
    } catch {
      // görünüm (view) veya erişilemeyen tablo — atla
    }
  }

  if (hits.length === 0) {
    console.log("Temiz: hiçbir sütunda amazonaws.com adresi yok.");
  } else {
    console.log("AWS adresi barındıran sütunlar:\n");
    for (const h of hits) {
      console.log(`  ${h.table}.${h.column} — ${h.rows} kayıt`);
      console.log(`    …${h.sample}…\n`);
    }
    const total = hits.reduce((a, b) => a + b.rows, 0);
    console.log(`Toplam ${total} kayıt, ${hits.length} sütunda.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
