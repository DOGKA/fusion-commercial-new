/**
 * Blog kategorilerini beşe indirir.
 *
 * Önceki durumda 11 kategori vardı ve 73 yazının 46'sı tek başına "Enerji"
 * altındaydı; filtre pratikte hiçbir şeyi ayırmıyordu. Yazılar okuma amacına
 * göre yeniden dağıtıldı:
 *
 *   Rehber         → kullanım senaryoları, kapasite/Wh hesapları, bakım
 *   Teknik         → batarya, invertör, sertifika, ürün tanıtımı
 *   Solar          → güneş paneli, MPPT, solar kablolama
 *   Karşılaştırma  → "x mi y mi", model ve marka kıyasları
 *   İş Güvenliği   → eldiven, yalıtkan merdiven, saha güvenliği
 *
 * Kullanım (repo kökünden):
 *   npx tsx scripts/consolidate-blog-categories.ts
 *   npx tsx scripts/consolidate-blog-categories.ts --apply
 *
 * `--apply` verilmeden yalnızca rapor basar. Yazmadan önce mevcut eşleşmeyi
 * scripts/.blog-category-backup.json dosyasına kaydeder.
 */

import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(SCRIPT_DIR);

/**
 * Prisma Client .env okumaz; ortam dosyası yerel ve sunucuda farklı yerlerde
 * durduğu için import'tan önce yükleniyor.
 */
function loadDatabaseEnv() {
  if (process.env.DATABASE_URL) return;

  const candidates = [
    "fusionmarkt/.env",
    "fusionmarkt/.env.local",
    "packages/db/.env",
    ".env",
  ].map((relative) => join(REPO_ROOT, relative));

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

// Prisma bağlantı dizesini ilk sorguda okuyor; istemciyi kurmadan önce yeterli.
loadDatabaseEnv();

const prisma = new PrismaClient();

const REHBER = "Rehber";
const TEKNIK = "Teknik";
const SOLAR = "Solar";
const KARSILASTIRMA = "Karşılaştırma";
const IS_GUVENLIGI = "İş Güvenliği";

/** Slug → yeni kategori. Slug bazlı çünkü başlıklar düzenlenebiliyor. */
const CATEGORY_BY_SLUG: Record<string, string> = {
  // ── Rehber ───────────────────────────────────────────────────────────────
  "elektrik-kesintisinde-kac-wh-gerekir": REHBER,
  "ev-icin-tasinabilir-guc-kaynagi-kac-saat-calisir": REHBER,
  "power-station-ile-klima-calisir-mi": REHBER,
  "tasinabilir-guc-kaynagi-fiyatlari-2026-kapasite-rehberi": REHBER,
  "uc-zamanli-tarife-power-station-elektrik-tasarrufu": REHBER,
  "balikcilik-ve-teknede-tasinabilir-guc-kaynagi": REHBER,
  "buzdolabi-icin-kac-wh-gerekir": REHBER,
  "cpap-cihazi-icin-tasinabilir-guc-kaynagi-rehberi": REHBER,
  "deprem-cantasi-icin-guc-kaynagi-afete-hazirlik": REHBER,
  "drone-pilotlari-saha-enerji-planlamasi": REHBER,
  "elektrik-kesintisinde-ev-icin-guc-kaynagi": REHBER,
  "ev-tipi-klima-isitici-guc-kaynagi-watt-hesaplama": REHBER,
  "festival-acik-hava-etkinlikleri-enerji-planlamasi": REHBER,
  "fotografcilar-icerik-ureticileri-saha-enerji-cozumleri": REHBER,
  "guc-kaynagi-garanti-servis-rehberi": REHBER,
  "guc-istasyonu-ile-ucaga-binmek-tsa-iata-kurallari": REHBER,
  "kamp-icin-tasinabilir-guc-kaynagi-rehberi": REHBER,
  "karavan-icin-guc-kaynagi-ve-solar-panel-sistemi": REHBER,
  "kisin-guc-istasyonu-kullanimi-soguk-hava-performans-rehberi": REHBER,
  "food-truck-mobil-gida-tiri-enerji-cozumleri": REHBER,
  "off-grid-yasam-guc-kaynagi-ve-enerji-bagimsizligi": REHBER,
  "tasinabilir-guc-kaynagi-bakim-ve-depolama-rehberi": REHBER,
  "tasinabilir-guc-kaynagi-nasil-secilir-2026-rehberi": REHBER,
  "uzaktan-calisanlar-icin-tasinabilir-enerji-laptop-modem": REHBER,
  "insaat-santiye-sahasi-tasinabilir-enerji-cozumleri": REHBER,
  "hayat-kurtaran-guc-kaynaklari": REHBER,
  "tasinabilir-guc-kaynaklari-her-yerde-enerji-ozgurlugu": REHBER,

  // ── Teknik ───────────────────────────────────────────────────────────────
  "batarya-voc-degeri-nedir-neden-yukselir": TEKNIK,
  "dc5525-cikis-nedir-hangi-cihazlar-kullanilir": TEKNIK,
  "guc-baslatma-ve-enerji-depolama-akuleri": TEKNIK,
  "guc-istasyonunda-pass-through-sarj-ups-modu": TEKNIK,
  "ip20-ip54-ip65-ip67-koruma-sinifi-rehberi": TEKNIK,
  "lifepo4-batarya-nedir-avantajlari-nelerdir": TEKNIK,
  "saf-sinus-dalga-vs-modifiye-sinus-fark-nedir": TEKNIK,
  "usb-pd-power-delivery-nedir-usb-if-sertifikasi": TEKNIK,
  "watt-volt-amper-wh-enerji-birimleri-rehberi": TEKNIK,
  "4000-dongu-ne-demek-power-station-kac-yil-dayanir": TEKNIK,
  "gercek-kullanilabilir-kapasite-wh-verim-kayiplari": TEKNIK,
  "hibrit-invertor-ats-nedir-ev-panosu-baglanti": TEKNIK,
  "lityum-batarya-yangin-riski-lifepo4-guvenlik": TEKNIK,
  "power-station-nedir-jenerator-farki": TEKNIK,
  "p800-tasinabilir-guc-istasyonu": TEKNIK,
  "p1800-tasinabilir-guc-istasyonu-gunes-enerjisi-jeneratoru": TEKNIK,

  // ── Solar ────────────────────────────────────────────────────────────────
  "balkonda-gunes-paneli-apartman-solar-kurulum": SOLAR,
  "gunes-paneli-monokristal-polikristal-esnek-fark": SOLAR,
  "solar-kablo-konnektor-mc4-xt60-anderson-kesit-hesabi": SOLAR,
  "tasinabilir-gunes-paneli-secimi-100w-200w-400w": SOLAR,
  "turkiye-il-il-gunes-paneli-verimli-gunes-saati": SOLAR,
  "en-iyi-tasinabilir-gunes-paneli-100w-200w-400w-karsilastirma": SOLAR,
  "eviniz-icin-gunes-enerjisi-paneli-kurulum-rehberi": SOLAR,
  "gunes-paneli-verimi-mevsimler-hava-durumu-cografya": SOLAR,
  "mppt-vs-pwm-sarj-kontrolcusu-fark-nedir": SOLAR,
  "solar-panel-seri-paralel-baglanti-rehberi": SOLAR,
  "solar-panel-ile-guc-istasyonu-sarj-etme-rehberi": SOLAR,
  "yazlik-bag-evi-solar-enerji-sistemi-kurulumu": SOLAR,

  // ── Karşılaştırma ────────────────────────────────────────────────────────
  "jackery-ecoflow-bluetti-anker-ieetek-karsilastirma": KARSILASTIRMA,
  "tasinabilir-guc-kaynagi-yorumlari-p800-p1800-p3200": KARSILASTIRMA,
  "ups-mi-power-station-mi": KARSILASTIRMA,
  "1024wh-yeter-mi-2048wh-mi-almali": KARSILASTIRMA,
  "ecoflow-alternatifi-ieetek": KARSILASTIRMA,
  "jenerator-mu-power-station-mi": KARSILASTIRMA,
  "p1800-vs-p2400-karsilastirma": KARSILASTIRMA,
  "p800-vs-p1800-karsilastirma": KARSILASTIRMA,
  "tasinabilir-guc-istasyonu-vs-jenerator-vs-aku-karsilastirma": KARSILASTIRMA,
  "tasinabilir-guc-kaynagi-fiyatlari-2026-karsilastirma": KARSILASTIRMA,
  "sessiz-jenerator-alternatifi-power-station": KARSILASTIRMA,
  "karavan-icin-power-station-mi-solar-paket-mi": KARSILASTIRMA,

  // ── İş Güvenliği ─────────────────────────────────────────────────────────
  "137-kanton-fuari-davetimiz-kevlar-yalitkan": IS_GUVENLIGI,
  "kevlar-yalitkan-merdivenleri-avantajlari-ve-kullanim-alanlari": IS_GUVENLIGI,
  "yalitkan-merdiven-nedir-elektrik-guvenligi": IS_GUVENLIGI,
  "is-guvenligi-eldiveni-secim-rehberi": IS_GUVENLIGI,
  "tg1290-x-dura-ultra-pu-glove": IS_GUVENLIGI,
  "traffi-karbon-notr-guvenlik-cozumlerinde-endustri-lideri": IS_GUVENLIGI,
};

async function main() {
  const apply = process.argv.includes("--apply");

  const posts = await prisma.blogPost.findMany({
    select: { slug: true, title: true, category: true },
  });

  const unmapped = posts.filter((post) => !CATEGORY_BY_SLUG[post.slug]);
  const changes = posts.filter((post) => {
    const target = CATEGORY_BY_SLUG[post.slug];
    return target && target !== post.category;
  });

  const distribution = new Map<string, number>();
  for (const post of posts) {
    const target = CATEGORY_BY_SLUG[post.slug] ?? post.category ?? "(kategorisiz)";
    distribution.set(target, (distribution.get(target) ?? 0) + 1);
  }

  console.log(`Toplam yazı: ${posts.length}`);
  console.log(`Değişecek yazı: ${changes.length}`);
  console.log(`Eşlenmemiş yazı: ${unmapped.length}`);

  console.log("\nYeni dağılım:");
  for (const [category, count] of [...distribution].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${category.padEnd(16)} ${count}`);
  }

  if (unmapped.length > 0) {
    console.log("\nEşlenmemiş yazılar (kategorisi değişmeyecek):");
    for (const post of unmapped) console.log(`  - ${post.slug} (${post.category ?? "—"})`);
  }

  if (!apply) {
    console.log("\nDeneme çalışması. Yazmak için --apply ekleyin.");
    return;
  }

  // Script hangi dizinden çağrılırsa çağrılsın yedek yanına düşsün.
  const backupPath = join(SCRIPT_DIR, ".blog-category-backup.json");
  writeFileSync(
    backupPath,
    JSON.stringify(
      posts.map((post) => ({ slug: post.slug, category: post.category })),
      null,
      2
    )
  );
  console.log(`\nYedek: ${backupPath}`);

  for (const post of changes) {
    await prisma.blogPost.update({
      where: { slug: post.slug },
      data: { category: CATEGORY_BY_SLUG[post.slug] },
    });
  }

  console.log(`${changes.length} yazının kategorisi güncellendi.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
