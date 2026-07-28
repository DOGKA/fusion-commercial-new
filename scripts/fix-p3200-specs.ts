/**
 * P3200'ün yayınlanan teknik verilerindeki datasheet uyuşmazlıklarını düzeltir.
 *
 * ── Neden ──────────────────────────────────────────────────────────────────
 * Ürün sayfasındaki tablo `product_feature_values`'tan render ediliyor ve orada
 * üç hata vardı. Datasheet (p3200-datasheet.pdf, DC Input / General Data):
 *
 *   Max. Solar Charging Input Power (W)  1000     → sitede 6400W yazıyordu
 *   Dimensions (W/H/D) (mm)              445*298*371  → sitede 311 yazıyordu
 *   DC Input Voltage Range (V)           12–80    → açıklamada 12–60V
 *   Max DC/PV Input Current (A)          16       → açıklamada 15A
 *
 * 6400W aslında surge (tepe çıkış) gücü; solar giriş satırına kopyalanmış.
 * 1000W'lık sınırın 6400W diye duyurulması müşteriyi panel seçiminde
 * yanıltıyordu. Yedek tablodaki (`technical_specs`) değerler zaten doğruydu.
 *
 * ── Kullanım (repo kökünden) ───────────────────────────────────────────────
 *   npx tsx scripts/fix-p3200-specs.ts            # rapor, hiçbir şey yazmaz
 *   npx tsx scripts/fix-p3200-specs.ts --apply    # yazar
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

const p3200 = POWER_STATIONS.find((p) => p.key === "p3200")!;

/** Tablodaki (product_feature_values) düzeltmeler. */
const FEATURE_FIXES = [
  {
    feature: "Max. Solar Şarj",
    from: "6400W",
    to: `${p3200.solarMaxW}W`,
    why: "6400W surge gücü; datasheet solar giriş limiti 1000W.",
  },
  {
    feature: "Boyutlar",
    from: "445×298×311 mm",
    to: "445×298×371 mm",
    why: "Datasheet General Data: 445*298*371 mm.",
  },
];

/** Açıklama metnindeki düzeltmeler. HTML'de boşluklar &nbsp; olarak kodlu. */
const TEXT_FIXES = [
  {
    from: "12–60V,&nbsp;15A",
    to: "12–80V,&nbsp;16A",
    why: "Datasheet DC Input: 12–80V, max 16A.",
  },
];

/** Gözden geçirme için: metindeki voltaj/akım ifadelerini listeler. */
const REVIEW_PATTERN = /\d+\s*[–-]\s*\d+\s*V|\d+(?:\.\d+)?\s*A\b/g;

type FeatureRow = {
  id: string;
  valueText: string | null;
  valueNumber: unknown;
  unit: string | null;
  feature: { name: string } | null;
};

/**
 * Değer ya `valueText`'te ya da `valueNumber` + `unit` ikilisinde tutuluyor;
 * hangisinin kullanıldığı özelliğe göre değişiyor.
 */
function renderValue(row: FeatureRow): string {
  if (row.valueText !== null) return row.valueText;
  if (row.valueNumber === null || row.valueNumber === undefined) return "";
  return `${String(row.valueNumber)}${row.unit ?? ""}`;
}

/** "1000W" → { number: 1000, unit: "W" } */
function splitValue(value: string): { number: string; unit: string } {
  const m = value.match(/^([\d.]+)(.*)$/);
  if (!m) throw new Error(`sayısal değer ayrıştırılamadı: ${value}`);
  return { number: m[1], unit: m[2] };
}

function stripHtml(s: string) {
  return s.replace(/&nbsp;/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(
    apply
      ? "MOD: --apply — değişiklikler yazılacak\n"
      : "MOD: deneme çalışması — hiçbir şey yazılmayacak\n"
  );

  const product = await prisma.product.findFirst({
    where: { slug: { contains: "p3200" } },
    select: {
      id: true,
      name: true,
      description: true,
      productFeatureValues: {
        select: {
          id: true,
          valueText: true,
          valueNumber: true,
          unit: true,
          feature: { select: { name: true } },
        },
      },
    },
  });

  if (!product) {
    console.error("P3200 ürünü bulunamadı.");
    process.exit(1);
  }

  console.log(`Ürün: ${product.name}\n`);

  console.log("═".repeat(78));
  console.log("TABLO SATIRLARI");
  console.log("═".repeat(78));

  const featureUpdates: {
    id: string;
    data: { valueText: string } | { valueNumber: string; unit: string };
  }[] = [];

  for (const fix of FEATURE_FIXES) {
    const row = product.productFeatureValues.find(
      (v) => v.feature?.name === fix.feature
    );
    if (!row) {
      console.log(`\n  ATLANDI · ${fix.feature} — satır yok`);
      continue;
    }

    const current = renderValue(row);
    if (current !== fix.from) {
      console.log(
        `\n  ATLANDI · ${fix.feature} — beklenen "${fix.from}", bulunan "${current}"`
      );
      continue;
    }

    const numeric = row.valueText === null;
    console.log(`\n  ${fix.feature}${numeric ? "  (sayısal alan)" : ""}`);
    console.log(`    önce:  ${fix.from}`);
    console.log(`    sonra: ${fix.to}`);
    console.log(`    neden: ${fix.why}`);

    if (numeric) {
      const { number, unit } = splitValue(fix.to);
      featureUpdates.push({ id: row.id, data: { valueNumber: number, unit } });
    } else {
      featureUpdates.push({ id: row.id, data: { valueText: fix.to } });
    }
  }

  console.log(`\n${"═".repeat(78)}`);
  console.log("AÇIKLAMA METNİ");
  console.log("═".repeat(78));

  let description = product.description ?? "";
  let textChanged = false;

  for (const fix of TEXT_FIXES) {
    const count = description.split(fix.from).length - 1;
    if (count === 0) {
      console.log(`\n  ATLANDI · "${fix.from}" bulunamadı`);
      continue;
    }
    console.log(`\n  "${fix.from}" → "${fix.to}"  (${count} yer)`);
    console.log(`    neden: ${fix.why}`);
    description = description.split(fix.from).join(fix.to);
    textChanged = true;
  }

  console.log(`\n${"═".repeat(78)}`);
  console.log("GÖZDEN GEÇİR — metinde kalan voltaj/akım ifadeleri");
  console.log("═".repeat(78));
  const plain = stripHtml(description);
  const seen = new Set(plain.match(REVIEW_PATTERN) ?? []);
  console.log(`  ${[...seen].join(" · ")}`);

  if (!apply) {
    console.log("\nDeneme çalışmasıydı. Yazmak için --apply ekleyin.");
    return;
  }

  for (const u of featureUpdates) {
    await prisma.productFeatureValue.update({
      where: { id: u.id },
      data: u.data,
    });
  }

  if (textChanged) {
    await prisma.product.update({
      where: { id: product.id },
      data: { description },
    });
  }

  console.log(
    `\n${featureUpdates.length} tablo satırı güncellendi${textChanged ? ", açıklama metni güncellendi" : ""}.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
