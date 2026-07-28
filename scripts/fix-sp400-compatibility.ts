/**
 * SP400 panelinin uyumsuz güç kaynaklarıyla eşleştirildiği blog içeriklerini
 * düzeltir.
 *
 * ── Sorun ──────────────────────────────────────────────────────────────────
 * SP400'ün açık devre voltajı (Voc) 52.8V. Bir panel MPPT girişine
 * bağlandığında cihazın gördüğü ilk değer Voc'dur; yük çekilmeden önceki bu an
 * cihazın giriş tavanının altında kalmak zorundadır. Datasheet değerleriyle:
 *
 *   Cihaz              PV giriş        Max akım   SP400 (Voc 52.8V)
 *   ─────────────────────────────────────────────────────────────────────────
 *   P800               12–60V          10A        girer, ama 300W tavanı var
 *   P1800              10–52V          11A        ✗ tavanı aşar
 *   Singo 2000 / Pro   10–50V          11A        ✗ tavanı aşar
 *   P3200              12–80V          16A        ✓ tek veya 2× paralel
 *   SH4000 LV (XT60)   12–50V          16A        ✗ tavanı aşar
 *   SH4000 HV (MC4)    70–450V         16A        ✓ ama yalnızca 2+ seri
 *
 * Voc sıcaklıkla ters orantılı: monokristal panelde ~-0,3%/°C. 52.8V değeri
 * 25°C içindir; 0°C'de ~56.8V'a çıkar. En yüksek Voc açık ve soğuk bir kış
 * sabahında, yani panelin tipik olarak bağlandığı anda görülür. Bu yüzden
 * P1800'ün 52V tavanıyla arasındaki 0.8V bir tolerans payı değil, kesin aşımdır.
 *
 * SH4000'in HV girişi için ayrı bir hata daha var: paralel bağlanan paneller
 * voltajı yükseltmez, 52.8V'ta kalır. HV girişi 70V'tan başladığı için paralel
 * bağlantı devreyi hiç başlatmaz — seri bağlamak zorunludur.
 *
 * ── Kaynak ─────────────────────────────────────────────────────────────────
 * Tüm değerler üreticinin resmî datasheet'lerinden alındı:
 *   cdn.fusionmarkt.com/fusionmarkt/manuals/datasheets/<model>-datasheet.pdf
 *
 * ── Kapsam ─────────────────────────────────────────────────────────────────
 * Aynı HTML hem veritabanındaki blog_posts.content içinde hem de bu içeriği
 * üreten seed dosyalarında duruyor. Yalnızca veritabanı düzeltilirse seed'in
 * yeniden çalıştırılması hatayı geri getirir; bu yüzden ikisi birlikte
 * güncelleniyor.
 *
 * ── Kullanım (repo kökünden) ───────────────────────────────────────────────
 *   npx tsx scripts/fix-sp400-compatibility.ts            # rapor, hiçbir şey yazmaz
 *   npx tsx scripts/fix-sp400-compatibility.ts --apply    # yazar
 *
 * `--apply` öncesinde etkilenen yazıların mevcut içeriği
 * scripts/.sp400-content-backup.json dosyasına kaydedilir.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(SCRIPT_DIR);

/** Prisma Client .env okumaz; istemciyi kurmadan önce yükleniyor. */
function loadDatabaseEnv() {
  if (process.env.DATABASE_URL) return;

  const candidates = [
    "fusionmarkt/.env",
    "fusionmarkt/.env.local",
    "packages/db/.env",
    ".env",
  ].map((relativePath) => join(REPO_ROOT, relativePath));

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    process.loadEnvFile(candidate);
    if (process.env.DATABASE_URL) return;
  }

  console.error(
    "DATABASE_URL bulunamadı. Aranan dosyalar:\n" +
      candidates.map((path) => `  ${path}`).join("\n")
  );
  process.exit(1);
}

loadDatabaseEnv();

const prisma = new PrismaClient();

type Rule = {
  id: string;
  why: string;
  find: string | RegExp;
  replace: string;
};

/**
 * Kurallar sırayla uygulanır ve her biri kendi tam metnini hedefler; bu yüzden
 * birbirlerinin çıktısını bozmazlar. Metinler veritabanındaki HTML'den birebir
 * kopyalandı, tire karakterleri (– en dash) dahil.
 */
const RULES: Rule[] = [
  {
    id: "p1800-uyumluluk-maddesi",
    why: "SP400 'sınırda' deniyordu; 52.8V, 52V tavanının üzerinde ve soğukta daha da yükseliyor.",
    find: `<li><strong>P1800 (DC giriş 10–52V):</strong> SP100 ✅, SP200 ✅, <strong>SP400 sınırda</strong> (52.8V ≈ 52V limiti).</li>`,
    replace: `<li><strong>P1800 (DC giriş 10–52V, max 11A / 500W):</strong> SP100 ✅, SP200 ✅. <strong>SP400 bağlanmaz</strong> — açık devre voltajı 52.8V, cihazın 52V tavanının üzerinde. Voc soğuk havada yükseldiği için aradaki fark tolerans payı değildir.</li>`,
  },
  {
    id: "p1800-sp400-tablo-satiri",
    why: "Karşılaştırma tablosunda P1800 + SP400 satırı vardı; bu kombinasyon kurulamaz. Aynı tabloda P1800 + SP200 satırı zaten mevcut.",
    find: /\n[ \t]*<tr>\s*\n[ \t]*<td>P1800 \(1024Wh\) \+ SP400<\/td>[\s\S]*?<\/tr>/,
    replace: "",
  },
  {
    id: "karavan-capraz-eslestirme",
    why: "'P1800 veya P3200 … SP200 veya SP400' ifadesi çapraz okunduğunda P1800 + SP400 sonucunu veriyordu.",
    find: `gibi bir taşınabilir güç kaynağının, <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> veya <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> gibi katlanabilir bir solar panelle eşleştirilmesiyle oluşturulur.`,
    replace: `gibi bir taşınabilir güç kaynağının, <a href="/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200">SP200</a> (P1800 için) veya <a href="/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400">SP400</a> (P3200 için) gibi katlanabilir bir solar panelle eşleştirilmesiyle oluşturulur.`,
  },
  {
    id: "p800-giris-araligi",
    why: "DC giriş aralığı 10–30V yazıyordu; datasheet 12–60V. SP200 'sınırda' değil, rahatça uyumlu. SP400 ise aralığa giriyor ama 300W tavanına takılıyor.",
    find: `<li><strong>P800 (DC giriş 10–30V):</strong> SP100 ✅, SP200 — Voc 28.8V sınırda, öğle güneşinde dikkatli; <strong>SP400 bağlanmaz</strong> (52.8V limit aşımı).</li>`,
    replace: `<li><strong>P800 (DC giriş 12–60V, max 10A / 300W):</strong> SP100 ✅, SP200 ✅. <strong>SP400 önerilmez</strong> — 52.8V açık devre voltajı aralığa girer, ancak P800'ün solar tavanı 300W olduğu için panelin 400W'ı kullanılamaz.</li>`,
  },
  {
    id: "p3200-seri-uyarisi",
    why: "Paralel bağlantı doğruydu ama seri bağlamanın 105.6V ile 80V tavanını aştığı yazmıyordu.",
    find: `<li><strong>P3200 (DC giriş 12–80V):</strong> SP100 ✅, SP200 ✅, <strong>SP400 ideal</strong> ve iki adet <em>paralel</em> bağlanabilir.</li>`,
    replace: `<li><strong>P3200 (DC giriş 12–80V, max 16A / 1000W):</strong> SP100 ✅, SP200 ✅, <strong>SP400 ideal</strong> — tek panel veya iki panel <em>paralel</em>. Seri bağlamayın; 2× SP400 seri 105.6V yapar ve 80V tavanını aşar.</li>`,
  },
  {
    id: "sh4000-uyumluluk-maddesi",
    why: "'SP400 paralel … HV MC4 girişine (seri bağlamak kaçınılmaz)' ifadesi kendi içinde çelişkiliydi. HV girişi 70V'tan başlar, paralel bağlantı 52.8V'ta kalır.",
    find: `<li><strong>SH4000 (LV XT60 12–50V, HV MC4 70–450V):</strong> SP100–200 XT60 girişine, <strong>SP400 paralel 2–3 adet HV MC4 girişine</strong> (seri bağlamak kaçınılmaz).</li>`,
    replace: `<li><strong>SH4000 (LV XT60 12–50V / 600W, HV MC4 70–450V / 3000W):</strong> SP100–SP200 LV XT60 girişine. <strong>SP400 yalnızca HV MC4 girişine ve mutlaka seri bağlanır</strong> — tek panel 52.8V ile HV girişinin 70V alt sınırına ulaşmaz, paralel bağlamak voltajı yükseltmediği için çözüm değildir; en az 2 panel seri (105.6V) gerekir. SP400, LV XT60 girişine bağlanmaz (52.8V > 50V).</li>`,
  },
  {
    id: "hizli-cevap-kutusu",
    why: "'iki taneye kadar paralel bağlanabilir' ifadesi P3200 için doğru, SH4000 için yanlış.",
    find: `Ev/yazlık ve P3200/SH4000 için <strong>SP400</strong> (16.3 kg, iki taneye kadar paralel bağlanabilir).`,
    replace: `Ev/yazlık ve P3200/SH4000 için <strong>SP400</strong> (16.3 kg; P3200'de tek veya iki panel paralel, SH4000'de HV girişine en az iki panel seri).`,
  },
  {
    id: "klima-sh4000-paralel",
    why: "HV MC4 girişine 'paralel bağlanacak 6–8 adet SP400' deniyordu; paralel dizi 52.8V'ta kalır ve 70V alt sınırını geçemez. 8 panel seri ise soğukta 450V tavanına dayanır, bu yüzden 6–7'ye çekildi.",
    find: `<p>SH4000'in HV MC4 solar girişine (3000W) paralel bağlanacak 6–8 adet SP400 paneli, yaz aylarında günlük klima tüketiminin çoğunu üretim tarafında karşılar ve evin tamamen off-grid çalışmasını destekler.</p>`,
    replace: `<p>SH4000'in HV MC4 solar girişine (3000W) <strong>seri</strong> bağlanacak 6–7 adet SP400 paneli, yaz aylarında günlük klima tüketiminin çoğunu üretim tarafında karşılar ve evin tamamen off-grid çalışmasını destekler. HV girişi 70–450V arasında çalıştığı için paneller paralel değil seri bağlanmalıdır; paralel bağlantı 52.8V'ta kaldığı için giriş hiç devreye girmez.</p>`,
  },
];

/** products-reference.md gelecekteki blogların referansı; oradaki hata da düzeltiliyor. */
const REFERENCE_RULES: Rule[] = [
  {
    id: "referans-sp400-kullanim",
    why: "SP400 için 'SH4000 LV solar girişi' yazıyordu; LV girişi 12–50V, SP400 oraya bağlanmaz.",
    find: `- **Kullanım:** P3200 hızlı solar şarj, SH4000 LV solar girişi, yazlık/bağ evi`,
    replace: `- **Kullanım:** P3200 hızlı solar şarj (tek panel veya 2× paralel), SH4000 **HV MC4** girişi (en az 2× seri), yazlık/bağ evi
- **UYUMSUZ:** P1800 (10–52V), Singo 2000 / 2000 Pro (10–50V), SH4000 LV XT60 (12–50V) — Voc 52.8V bu girişlerin tavanını aşar`,
  },
  {
    id: "referans-p1800-sarj",
    why: "Giriş akımı limiti yazmıyordu; panel eşleştirmesinde voltaj kadar belirleyici.",
    find: `- **Şarj:** AC 1200W (~1.2 sa), Araç 120W, Max Solar 500W (10–52V)`,
    replace: `- **Şarj:** AC 1200W (~1.2 sa), Araç 120W, Max Solar 500W (10–52V, max 11A)`,
  },
  {
    id: "referans-p800-sarj",
    why: "P800 için PV giriş aralığı hiç yazmıyordu; blogda 10–30V diye yanlış aktarılmıştı.",
    find: `- **Şarj:** AC 600W (~1.2 sa), Araç 120W, Max Solar 300W, 3-4 sa solar ile tam şarj`,
    replace: `- **Şarj:** AC 600W (~1.2 sa), Araç 120W, Max Solar 300W (12–60V, max 10A), 3-4 sa solar ile tam şarj`,
  },
];

/** Blog HTML'ini barındıran seed dosyaları. */
const SEED_FILES = [
  "packages/db/prisma/seed-blog-02.ts",
  "packages/db/prisma/seed-blog-05.ts",
  "packages/db/prisma/seed-blog-06.ts",
];

const REFERENCE_FILE = "packages/db/prisma/products-reference.md";

function applyRules(text: string, rules: Rule[]): { text: string; applied: string[] } {
  let result = text;
  const applied: string[] = [];

  for (const rule of rules) {
    const before = result;
    result =
      typeof rule.find === "string"
        ? result.split(rule.find).join(rule.replace)
        : result.replace(rule.find, rule.replace);
    if (result !== before) applied.push(rule.id);
  }

  return { text: result, applied };
}

function ruleById(id: string): Rule {
  return [...RULES, ...REFERENCE_RULES].find((rule) => rule.id === id)!;
}

function printApplied(applied: string[], indent: string) {
  for (const id of applied) {
    console.log(`${indent}• ${id}`);
    console.log(`${indent}  ${ruleById(id).why}`);
  }
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(
    apply
      ? "MOD: --apply — değişiklikler yazılacak\n"
      : "MOD: deneme çalışması — hiçbir şey yazılmayacak\n"
  );

  // ── 1) Veritabanı ────────────────────────────────────────────────────────
  console.log("═".repeat(78));
  console.log("VERİTABANI (blog_posts)");
  console.log("═".repeat(78));

  const posts = await prisma.blogPost.findMany({
    select: { id: true, slug: true, title: true, content: true },
    orderBy: { slug: "asc" },
  });

  const pending: { id: string; slug: string; content: string; applied: string[] }[] = [];

  for (const post of posts) {
    const { text, applied } = applyRules(post.content, RULES);
    if (applied.length === 0) continue;

    console.log(`\n${post.title}`);
    console.log(`  /blog/${post.slug}`);
    printApplied(applied, "  ");

    pending.push({ id: post.id, slug: post.slug, content: text, applied });
  }

  if (pending.length === 0) {
    console.log("\n  Değişiklik gerektiren yazı yok.");
  } else {
    console.log(`\n  Toplam ${pending.length} yazı güncellenecek.`);
  }

  // ── 2) Seed dosyaları ────────────────────────────────────────────────────
  console.log(`\n${"═".repeat(78)}`);
  console.log("SEED DOSYALARI");
  console.log("═".repeat(78));

  const fileWrites: { path: string; text: string }[] = [];

  for (const relativePath of [...SEED_FILES, REFERENCE_FILE]) {
    const fullPath = join(REPO_ROOT, relativePath);
    if (!existsSync(fullPath)) {
      console.log(`\n  ATLANDI (dosya yok): ${relativePath}`);
      continue;
    }

    const original = readFileSync(fullPath, "utf8");
    const rules = relativePath === REFERENCE_FILE ? REFERENCE_RULES : RULES;
    const { text, applied } = applyRules(original, rules);

    if (applied.length === 0) continue;

    console.log(`\n${relativePath}`);
    printApplied(applied, "  ");
    fileWrites.push({ path: fullPath, text });
  }

  if (fileWrites.length === 0) {
    console.log("\n  Değişiklik gerektiren dosya yok.");
  }

  // ── 3) Yazma ─────────────────────────────────────────────────────────────
  if (!apply) {
    console.log(`\n${"═".repeat(78)}`);
    console.log("Deneme çalışmasıydı. Yazmak için --apply ekleyin.");
    return;
  }

  if (pending.length > 0) {
    const backupPath = join(SCRIPT_DIR, ".sp400-content-backup.json");
    writeFileSync(
      backupPath,
      JSON.stringify(
        posts
          .filter((post) => pending.some((entry) => entry.id === post.id))
          .map((post) => ({ slug: post.slug, content: post.content })),
        null,
        2
      )
    );
    console.log(`\nYedek: ${relative(REPO_ROOT, backupPath)}`);

    for (const entry of pending) {
      await prisma.blogPost.update({
        where: { id: entry.id },
        data: { content: entry.content },
      });
      console.log(`  güncellendi: /blog/${entry.slug}`);
    }
  }

  for (const file of fileWrites) {
    writeFileSync(file.path, file.text);
    console.log(`  yazıldı: ${relative(REPO_ROOT, file.path)}`);
  }

  console.log("\nTamamlandı.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
