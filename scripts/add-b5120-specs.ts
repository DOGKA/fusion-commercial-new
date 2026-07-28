/**
 * B5120 genişletme batarya modülünün boş teknik özellik tablosunu doldurur.
 *
 * ── Neden ──────────────────────────────────────────────────────────────────
 * Ürünün hiç `product_feature_values` satırı yok, bu yüzden ürün sayfasındaki
 * "Teknik Özellikler" sekmesi boş geliyor.
 *
 * ── Değerlerin kaynağı ─────────────────────────────────────────────────────
 * B5120'nin kendi datasheet'i yok. Modül, SH4000'in içindeki batarya ile
 * birebir aynı; B5120 yalnızca inverter kısmını içermiyor. Dolayısıyla değerler
 * sh4000-datasheet.pdf'in Battery Input bölümünden alındı:
 *
 *   Cell Type              LiFePO4
 *   Battery Capacity (Wh)  5120
 *   Life Cycles            4000+   (@25°C, 0.5C Discharge, DOD80%)
 *
 * Boyut, aynı datasheet'in General Data satırındaki batarya modülü ölçüsü:
 * "510*673*266mm (Inverter: 510*216*208 mm; Battery: 510*375*198 mm; ...)".
 *
 * Eklenmeyenler ve nedenleri:
 *   Ağırlık   → datasheet yalnızca 65 kg toplam veriyor, modül ayrı değil.
 *   IP Koruma → IP54 kurulu sistemin derecesi; modül için ayrıca verilmemiş.
 *   Voltaj/akım (51.2V nominal, 40~60V, 65/90/100A) → bu kategoride karşılık
 *              gelen özellik tanımı yok; eklemek için yeni tanım gerekir.
 *
 * ── Kullanım (repo kökünden) ───────────────────────────────────────────────
 *   npx tsx scripts/add-b5120-specs.ts            # rapor, hiçbir şey yazmaz
 *   npx tsx scripts/add-b5120-specs.ts --apply    # yazar
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { POWER_STATIONS } from "./datasheet-reference";

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

const sh4000 = POWER_STATIONS.find((p) => p.key === "sh4000")!;

/** Datasheet'te "4000+" yazıyor; sayısal alana taban değer giriliyor. */
const LIFE_CYCLES = Number.parseInt(sh4000.lifeCycles, 10);

interface NewRow {
  feature: string;
  /** SELECT ve TEXT alanlarda metin, NUMBER alanlarda sayı kullanılır. */
  text?: string;
  number?: number;
  /** Tabloda görüntülenme sırası; diğer ürünlerdeki sırayla aynı tutuluyor. */
  order: number;
  why: string;
}

const ROWS: NewRow[] = [
  {
    feature: "Kapasite",
    number: sh4000.batteryWh,
    order: 0,
    why: "SH4000 datasheet, Battery Capacity: 5120Wh.",
  },
  {
    feature: "Batarya Tipi",
    text: sh4000.cellType,
    order: 3,
    why: "SH4000 datasheet, Cell Type: LiFePO4.",
  },
  {
    feature: "Boyutlar",
    text: "510×375×198 mm",
    order: 11,
    why: "SH4000 datasheet General Data, batarya modülü ölçüsü.",
  },
  {
    feature: "Döngü Ömrü",
    number: LIFE_CYCLES,
    order: 13,
    why: "SH4000 datasheet, Life Cycles: 4000+ (@25°C, 0.5C, DOD80%).",
  },
];

/** Açıklama metnindeki sayısal iddiaları gözden geçirmek için. */
const CLAIM_PATTERN = /\d+(?:[.,]\d+)?\s*(?:Wh|kWh|W|V|A|kg|mm|döngü|°C)/gi;

function stripHtml(html: string): string {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(
    apply
      ? "MOD: --apply — satırlar eklenecek\n"
      : "MOD: deneme çalışması — hiçbir şey yazılmayacak\n"
  );

  const product = await prisma.product.findFirst({
    where: { slug: { startsWith: "b5120" } },
    select: {
      id: true,
      name: true,
      categoryId: true,
      description: true,
      productFeatureValues: {
        select: { id: true, feature: { select: { name: true } } },
      },
    },
  });

  if (!product) {
    console.error("B5120 ürünü bulunamadı.");
    process.exit(1);
  }

  console.log(`Ürün: ${product.name}`);
  console.log(`Mevcut özellik satırı: ${product.productFeatureValues.length}\n`);

  const defs = await prisma.featureDefinition.findMany({
    where: { name: { in: ROWS.map((r) => r.feature) } },
    select: { id: true, name: true, unit: true },
  });

  const pending: {
    featureId: string;
    feature: string;
    valueText: string | null;
    valueNumber: string | null;
    unit: string | null;
    order: number;
  }[] = [];
  const skipped: string[] = [];

  for (const row of ROWS) {
    const def = defs.find((d) => d.name === row.feature);
    if (!def) {
      skipped.push(`${row.feature} — özellik tanımı yok`);
      continue;
    }
    if (product.productFeatureValues.some((v) => v.feature?.name === row.feature)) {
      skipped.push(`${row.feature} — satır zaten var`);
      continue;
    }

    const shown =
      row.text ?? `${row.number}${def.unit ? ` ${def.unit}` : ""}`;
    console.log(`  ${row.feature.padEnd(16)} ${shown}`);
    console.log(`     ${row.why}`);

    pending.push({
      featureId: def.id,
      feature: row.feature,
      valueText: row.text ?? null,
      valueNumber: row.number !== undefined ? String(row.number) : null,
      unit: def.unit ?? null,
      order: row.order,
    });
  }

  if (skipped.length) {
    console.log(`\n${"═".repeat(78)}`);
    console.log("ATLANANLAR");
    console.log("═".repeat(78));
    for (const s of skipped) console.log(`  ${s}`);
  }

  console.log(`\n${"═".repeat(78)}`);
  console.log("GÖZDEN GEÇİR — açıklama metnindeki sayısal iddialar");
  console.log("═".repeat(78));
  const claims = new Set(stripHtml(product.description ?? "").match(CLAIM_PATTERN) ?? []);
  console.log(`  ${[...claims].join(" · ") || "(yok)"}`);

  console.log(`\nToplam ${pending.length} satır eklenecek.`);

  if (!apply) {
    console.log("\nDeneme çalışmasıydı. Yazmak için --apply ekleyin.");
    return;
  }

  if (pending.length === 0) {
    console.log("\nEklenecek bir şey yok.");
    return;
  }

  await prisma.productFeatureValue.createMany({
    data: pending.map((p) => ({
      productId: product.id,
      featureId: p.featureId,
      valueText: p.valueText,
      valueNumber: p.valueNumber,
      unit: p.unit,
      displayOrder: p.order,
    })),
  });

  console.log(`\n${pending.length} satır eklendi.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
