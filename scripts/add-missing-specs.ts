/**
 * Ürün teknik özellik tablosunda eksik olan datasheet satırlarını ekler.
 *
 * ── Neden ──────────────────────────────────────────────────────────────────
 * Sitede güç kaynaklarının solar giriş **voltaj** limiti yayınlanıyor ama
 * **akım** limiti yayınlanmıyor. Voltaj limiti panellerin seri bağlanıp
 * bağlanamayacağını, akım limiti ise paralel bağlanıp bağlanamayacağını
 * belirler. Aynı şekilde panellerin kısa devre akımı (Isc) da tabloda yok;
 * paralel dizide toplanan değer odur. Yani müşteri bugün paralel bağlantı
 * kontrolünü sitedeki verilerle yapamıyor.
 *
 * SH4000'de ek bir boşluk var: cihazın iki solar girişi olmasına rağmen
 * tabloda yalnızca HV (MC4) girişi görünüyor. LV (XT60) girişi hiç yok.
 * Yalnızca HV akımını eklemek yanıltıcı olurdu — tek giriş varmış gibi
 * okunurdu — bu yüzden LV girişinin satırları da ekleniyor.
 *
 * Değerler scripts/datasheet-reference.ts'ten okunur, elle yazılmaz.
 *
 * ── Kullanım (repo kökünden) ───────────────────────────────────────────────
 *   npx tsx scripts/add-missing-specs.ts            # rapor, hiçbir şey yazmaz
 *   npx tsx scripts/add-missing-specs.ts --apply    # yazar
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { POWER_STATIONS, SOLAR_PANELS } from "./datasheet-reference";

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

interface SpecRow {
  /** datasheet-reference anahtarı; ürün slug'ıyla eşleştirilir. */
  key: string;
  group: string;
  order: number;
  label: string;
  value: string;
}

function station(key: string) {
  const s = POWER_STATIONS.find((p) => p.key === key);
  if (!s) throw new Error(`datasheet-reference'ta güç kaynağı yok: ${key}`);
  return s;
}

function panel(key: string) {
  const p = SOLAR_PANELS.find((x) => x.key === key);
  if (!p) throw new Error(`datasheet-reference'ta panel yok: ${key}`);
  return p;
}

const sh4000 = station("sh4000");

const ROWS: SpecRow[] = [
  // ── Güç kaynakları: solar giriş akımı limiti ──────────────────────────────
  // "DC Giriş Voltaj Aralığı" 22. sırada; akım limiti hemen ardına geliyor.
  ...(["p800", "p1800", "p3200", "singo2000pro"] as const).map((key) => ({
    key,
    group: "DC Giriş",
    order: 23,
    label: "Max Solar Giriş Akımı",
    value: `${station(key).maxPvCurrentA}A`,
  })),

  // ── SH4000: HV girişinin akımı ────────────────────────────────────────────
  {
    key: "sh4000",
    group: "DC Giriş (HV)",
    order: 22,
    label: "Max Solar Giriş Akımı (HV)",
    value: `${sh4000.hvMaxPvCurrentA}A`,
  },

  // ── SH4000: tabloda hiç bulunmayan LV (XT60) girişi ───────────────────────
  {
    key: "sh4000",
    group: "DC Giriş (LV)",
    order: 19,
    label: "Araç Şarj Gücü",
    value: `${sh4000.carChargingW}W`,
  },
  {
    key: "sh4000",
    group: "DC Giriş (LV)",
    order: 20,
    label: "Max Solar Giriş (LV)",
    value: `${sh4000.solarMaxW}W`,
  },
  {
    key: "sh4000",
    group: "DC Giriş (LV)",
    order: 21,
    label: "DC Giriş Voltaj Aralığı (LV)",
    value: `${sh4000.dcInputRangeV}V`,
  },
  {
    key: "sh4000",
    group: "DC Giriş (LV)",
    order: 22,
    label: "Max Solar Giriş Akımı (LV)",
    value: `${sh4000.maxPvCurrentA}A`,
  },

  // ── Paneller: kısa devre akımı ────────────────────────────────────────────
  // "Çalışma Voltajı" 6. sırada; Isc onun ardına geliyor.
  ...(["sp100", "sp200", "sp400"] as const).map((key) => ({
    key,
    group: "Elektriksel",
    order: 7,
    label: "Kısa Devre Akımı",
    value: `${panel(key).iscA}A`,
  })),
];

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  technicalSpecs: { label: string }[];
};

/** audit-datasheet-consistency.ts ile aynı eşleştirme mantığı. */
function matchProduct(products: DbProduct[], key: string): DbProduct | undefined {
  const candidates = products.filter((p) => p.slug.toLowerCase().includes(key));
  if (candidates.length <= 1) return candidates[0];

  return (
    candidates.find((p) => p.slug.toLowerCase().endsWith(key)) ??
    candidates.sort((a, b) => b.technicalSpecs.length - a.technicalSpecs.length)[0]
  );
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
      technicalSpecs: { select: { label: true } },
    },
  });

  const pending: (SpecRow & { productId: string; productName: string })[] = [];
  const skipped: string[] = [];
  const missing: string[] = [];

  for (const row of ROWS) {
    const product = matchProduct(products, row.key);
    if (!product) {
      missing.push(`${row.key} — eşleşen ürün bulunamadı`);
      continue;
    }

    const exists = product.technicalSpecs.some(
      (s) => s.label.trim() === row.label
    );
    if (exists) {
      skipped.push(`${product.name} · ${row.label} (zaten var)`);
      continue;
    }

    pending.push({ ...row, productId: product.id, productName: product.name });
  }

  const byProduct = new Map<string, typeof pending>();
  for (const row of pending) {
    const list = byProduct.get(row.productName) ?? [];
    list.push(row);
    byProduct.set(row.productName, list);
  }

  console.log("═".repeat(78));
  console.log("EKLENECEK SATIRLAR");
  console.log("═".repeat(78));

  for (const [name, rows] of byProduct) {
    console.log(`\n${name}`);
    for (const r of rows) {
      console.log(
        `  [${r.group}] ${String(r.order).padStart(2)}  ${r.label.padEnd(30)} ${r.value}`
      );
    }
  }

  if (skipped.length) {
    console.log(`\n${"═".repeat(78)}`);
    console.log("ATLANANLAR");
    console.log("═".repeat(78));
    for (const s of skipped) console.log(`  ${s}`);
  }

  if (missing.length) {
    console.log(`\n${"═".repeat(78)}`);
    console.log("UYARI — ürün eşleşmedi");
    console.log("═".repeat(78));
    for (const m of missing) console.log(`  ${m}`);
  }

  console.log(`\nToplam ${pending.length} satır eklenecek.`);

  if (!apply) {
    console.log("\nDeneme çalışmasıydı. Yazmak için --apply ekleyin.");
    return;
  }

  if (pending.length === 0) {
    console.log("\nEklenecek bir şey yok.");
    return;
  }

  await prisma.technicalSpec.createMany({
    data: pending.map((r) => ({
      productId: r.productId,
      label: r.label,
      value: r.value,
      group: r.group,
      order: r.order,
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
