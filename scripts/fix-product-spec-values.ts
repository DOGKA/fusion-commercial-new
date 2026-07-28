/**
 * Ürün sayfasındaki teknik özellik tablosunu datasheet'lere göre düzeltir.
 *
 * Tablo `product_feature_values`'tan render ediliyor (technical_specs yalnızca
 * feature değeri olmayan ürünlerde yedek). Aşağıdaki uyuşmazlıklar üreticinin
 * datasheet PDF'leri ve o PDF'lerdeki ürün fotoğraflarındaki port etiketleri
 * okunarak tespit edildi.
 *
 * ── Port sayıları ──────────────────────────────────────────────────────────
 * P800 datasheet DC Output: TYPE-C1 (100W), TYPE-C2/TYPE-C3 (30W),
 * USB-A1/USB-A2 (30W) → 3 Type-C, 2 USB-A. Sitede ikisi ters yazılmıştı.
 *
 * P1800 datasheet DC Output: TYPE-C1, TYPE-C2/TYPE-C3, USB-A1/USB-A2/USB-A3
 * → 3 Type-C, 3 USB-A. Sitede Type-C 2 yazıyordu.
 *
 * Singo2000Pro datasheet DC Output: USB-A (x1) 12W, QC3.0 (x2) 18W,
 * USB-TypeC (x2) 100W. QC3.0 portları da fiziksel olarak A tipi; ürün
 * fotoğrafında biri beyaz "USB-A", ikisi mavi "Quick Charge" olarak
 * etiketlenmiş → toplam 3 A tipi port. Sitede 1 yazıyordu.
 *
 * ── Boyutlar ───────────────────────────────────────────────────────────────
 * P800 datasheet General Data: 299*191.4*196.6 mm. Sitede 191 yazıyordu.
 *
 * SH4000 datasheet General Data: "510*673*266mm (Inverter: 510*216*208 mm;
 * Battery: 510*375*198 mm; Base: 510*82*256 mm)". Yani 510×673×266 toplam
 * ölçü; sitede bu değer inverterin ölçüsü gibi etiketlenmişti.
 *
 * ── Kullanım (repo kökünden) ───────────────────────────────────────────────
 *   npx tsx scripts/fix-product-spec-values.ts            # rapor, yazmaz
 *   npx tsx scripts/fix-product-spec-values.ts --apply    # yazar
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

interface Rule {
  /** Ürün slug'ında aranan model anahtarı. */
  key: string;
  feature: string;
  /** Veritabanındaki mevcut değer; eşleşmezse satır atlanır. */
  from: string;
  to: string;
  why: string;
}

const RULES: Rule[] = [
  {
    key: "p800",
    feature: "USB-C Port",
    from: "2",
    to: "3",
    why: "Datasheet: TYPE-C1 + TYPE-C2/C3 = 3 port.",
  },
  {
    key: "p800",
    feature: "USB-A Port",
    from: "3",
    to: "2",
    why: "Datasheet: USB-A1/USB-A2 = 2 port.",
  },
  {
    key: "p800",
    feature: "Boyutlar",
    from: "299×191×196.6 mm",
    to: "299×191.4×196.6 mm",
    why: "Datasheet General Data: 299*191.4*196.6 mm.",
  },
  {
    key: "p1800",
    feature: "USB-C Port",
    from: "2",
    to: "3",
    why: "Datasheet: TYPE-C1 + TYPE-C2/C3 = 3 port.",
  },
  {
    key: "singo2000pro",
    feature: "USB-A Port",
    from: "1",
    to: "3",
    why: "Datasheet: USB-A (x1) + QC3.0 (x2); üçü de A tipi port.",
  },
  {
    key: "sh4000",
    feature: "Boyutlar",
    from: "510×673×266 mm (Inverter) / 510×375×198 mm (Batarya)",
    to: "510×673×266 mm (toplam) / Inverter 510×216×208 mm / Batarya 510×375×198 mm / Kaide 510×82×256 mm",
    why: "510×673×266 toplam ölçü; datasheet'te inverter 510*216*208 olarak ayrı veriliyor.",
  },
];

type Row = {
  id: string;
  valueText: string | null;
  valueNumber: unknown;
  feature: { name: string } | null;
};

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  productFeatureValues: Row[];
};

function matchProduct(products: DbProduct[], key: string): DbProduct | undefined {
  const candidates = products.filter((p) => p.slug.toLowerCase().includes(key));
  if (candidates.length <= 1) return candidates[0];

  return (
    candidates.find((p) => p.slug.toLowerCase().endsWith(key)) ??
    candidates.sort(
      (a, b) => b.productFeatureValues.length - a.productFeatureValues.length
    )[0]
  );
}

/** Sayısal alanlarda birim ayrı sütunda; karşılaştırma ham değer üzerinden yapılır. */
function rawValue(row: Row): string {
  if (row.valueText !== null) return row.valueText;
  if (row.valueNumber === null || row.valueNumber === undefined) return "";
  return String(row.valueNumber);
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(
    apply
      ? "MOD: --apply — değişiklikler yazılacak\n"
      : "MOD: deneme çalışması — hiçbir şey yazılmayacak\n"
  );

  const products: DbProduct[] = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      productFeatureValues: {
        select: {
          id: true,
          valueText: true,
          valueNumber: true,
          feature: { select: { name: true } },
        },
      },
    },
  });

  const updates: { id: string; data: Record<string, string>; label: string }[] = [];
  const skipped: string[] = [];

  for (const rule of RULES) {
    const product = matchProduct(products, rule.key);
    if (!product) {
      skipped.push(`${rule.key} · ${rule.feature} — ürün bulunamadı`);
      continue;
    }

    const row = product.productFeatureValues.find(
      (v) => v.feature?.name === rule.feature
    );
    if (!row) {
      skipped.push(`${rule.key} · ${rule.feature} — satır yok`);
      continue;
    }

    const current = rawValue(row);
    if (current !== rule.from) {
      skipped.push(
        `${rule.key} · ${rule.feature} — beklenen "${rule.from}", bulunan "${current}"`
      );
      continue;
    }

    const numeric = row.valueText === null;
    console.log(`${rule.key.toUpperCase()} · ${rule.feature}${numeric ? "  (sayısal)" : ""}`);
    console.log(`   önce:  ${rule.from}`);
    console.log(`   sonra: ${rule.to}`);
    console.log(`   neden: ${rule.why}\n`);

    updates.push({
      id: row.id,
      data: numeric ? { valueNumber: rule.to } : { valueText: rule.to },
      label: `${rule.key} · ${rule.feature}`,
    });
  }

  if (skipped.length) {
    console.log("═".repeat(78));
    console.log("ATLANANLAR");
    console.log("═".repeat(78));
    for (const s of skipped) console.log(`  ${s}`);
    console.log();
  }

  console.log(`Toplam ${updates.length} satır güncellenecek.`);

  if (!apply) {
    console.log("\nDeneme çalışmasıydı. Yazmak için --apply ekleyin.");
    return;
  }

  for (const u of updates) {
    await prisma.productFeatureValue.update({ where: { id: u.id }, data: u.data });
  }

  console.log(`\n${updates.length} satır güncellendi.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
