/**
 * SP200'ün elektriksel değerlerinin yanlış aktarıldığı iki blog yazısını
 * düzeltir.
 *
 * ── Sorun ──────────────────────────────────────────────────────────────────
 * Datasheet'e göre SP200: Voc 28.8V, Vmp 24V, Isc 9.12A, Imp 8.33A.
 * Yazılarda Voc 24V, Isc ise 11A olarak geçiyor. Yani:
 *
 *   - Voc yerine Vmp (24V) yazılmış. Bu iki değer karıştırıldığında panel
 *     uyumluluğu olduğundan güvenli görünür; Voc cihazın gördüğü tepe değerdir.
 *   - Isc yerine P1800'ün giriş akımı limiti (11A) yazılmış. Panelin kendi
 *     kısa devre akımı 9.12A.
 *
 * Hata yalnızca iki sayıda kalmıyor; yazılar bu sayılardan hesap türetiyor:
 * seri dizide 24+24=48V, paralel dizide 11+11=22A gibi. Gerçek değerlerle
 * 2× SP200 seri 57.6V yapar ve P1800'ün 52V limitini soğuk hava payı hesaba
 * katılmadan bile aşar. Yazı bu durumu "riskli" diye niteliyordu; doğrusu
 * kombinasyonun kurulmaması gerektiği.
 *
 * Bu yazılar okuyucuya hesap yöntemi öğrettiği için sayıların doğruluğu
 * ayrıca önemli: yanlış örnek üzerinden çalışan biri kendi paneliyle de
 * yanlış sonuca varır.
 *
 * ── Kaynak ─────────────────────────────────────────────────────────────────
 * scripts/datasheet-reference.ts (üretici datasheet'lerinden birebir)
 *
 * ── Kullanım (repo kökünden) ───────────────────────────────────────────────
 *   npx tsx scripts/fix-sp200-voc.ts            # rapor, hiçbir şey yazmaz
 *   npx tsx scripts/fix-sp200-voc.ts --apply    # yazar
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = dirname(SCRIPT_DIR);

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
  console.error("DATABASE_URL bulunamadı.");
  process.exit(1);
}

loadDatabaseEnv();

const prisma = new PrismaClient();

type Rule = { id: string; why: string; find: string; replace: string };

const RULES: Rule[] = [
  // ── Seri/paralel rehberi: örnek tablolar ─────────────────────────────────
  {
    id: "seri-tablosu",
    why: "Voc 24V (aslında Vmp) ve Isc 11A (aslında P1800'ün giriş limiti) yazıyordu.",
    find: `<tr><td>VOC</td><td>24V</td><td><strong>48V</strong> (24+24)</td></tr>
<tr><td>ISC</td><td>11A</td><td><strong>11A</strong> (değişmez)</td></tr>`,
    replace: `<tr><td>VOC</td><td>28.8V</td><td><strong>57.6V</strong> (28.8+28.8)</td></tr>
<tr><td>ISC</td><td>9.12A</td><td><strong>9.12A</strong> (değişmez)</td></tr>`,
  },
  {
    id: "paralel-tablosu",
    why: "Paralel dizide akım toplamı 11+11=22A yazıyordu; doğrusu 9.12+9.12=18.24A.",
    find: `<tr><td>VOC</td><td>24V</td><td><strong>24V</strong> (değişmez)</td></tr>
<tr><td>ISC</td><td>11A</td><td><strong>22A</strong> (11+11)</td></tr>`,
    replace: `<tr><td>VOC</td><td>28.8V</td><td><strong>28.8V</strong> (değişmez)</td></tr>
<tr><td>ISC</td><td>9.12A</td><td><strong>18.24A</strong> (9.12+9.12)</td></tr>`,
  },

  // ── Seri/paralel rehberi: örnek hesaplamalar ─────────────────────────────
  {
    id: "hesap-p1800-seri",
    why: "2× SP200 seri gerçekte 57.6V yapıyor ve 52V limitini soğuk hava payı olmadan da aşıyor; 'riskli' nitelemesi durumu hafife alıyordu.",
    find: `<li>Toplam VOC: 24V + 24V = 48V → Soğukta: 48 × 1.20 = 57.6V → P1800 limiti 52V → <strong>RİSKLİ! Seri bağlamayın.</strong></li>`,
    replace: `<li>Toplam VOC: 28.8V + 28.8V = 57.6V → P1800 limiti 52V → <strong>YAPMAYIN.</strong> Dizi, soğuk hava payı hesaba katılmadan bile limitin üzerinde; soğukta 57.6 × 1.20 = 69.1V'a çıkar.</li>`,
  },
  {
    id: "hesap-p1800-paralel",
    why: "Voc ve akım değerleri yanlıştı; sonuç (güvenli / akım limiti aşılıyor) değişmiyor ama sayılar tutmuyordu.",
    find: `<li>VOC: 24V (değişmez) → Soğukta: 28.8V → P1800 limiti 52V → <strong>GÜVENLİ</strong></li>
<li>Toplam akım: 11A + 11A = 22A → P1800 limiti 11A → <strong>AŞIYOR! Güç istasyonu otomatik sınırlayacak.</strong> Güç kaybı olur ama zarar vermez.</li>`,
    replace: `<li>VOC: 28.8V (değişmez) → Soğukta: 28.8 × 1.20 = 34.6V → P1800 limiti 52V → <strong>GÜVENLİ</strong></li>
<li>Toplam akım: 9.12A + 9.12A = 18.24A → P1800 limiti 11A → <strong>AŞIYOR! Güç istasyonu otomatik sınırlayacak.</strong> Güç kaybı olur ama zarar vermez.</li>`,
  },
  {
    id: "hesap-p3200-seri",
    why: "Soğuk hava hesabı iki kez uygulanmıştı; 48V zaten yanlış başlangıç değeriydi.",
    find: `<li>Toplam VOC: 48V → Soğukta: 57.6V → P3200 limiti 80V → <strong>GÜVENLİ (ama sınırda, dikkatli olun)</strong></li>`,
    replace: `<li>Toplam VOC: 57.6V → Soğukta: 57.6 × 1.20 = 69.1V → P3200 limiti 80V → <strong>GÜVENLİ</strong></li>`,
  },
  {
    // Seed'deki metin veritabanındakinden farklı: yazı sonradan admin
    // panelinden düzenlenmiş ve "büyük marjla" ifadesi "sınırda" olmuş.
    id: "hesap-p3200-seri-seed-varyanti",
    why: "seed-blogs-v4.ts'teki farklı sürüm; aynı hatalı 48V başlangıç değeri.",
    find: `<li>Toplam VOC: 48V → Soğukta: 57.6V → P3200 limiti 80V → <strong>GÜVENLİ (büyük marjla)</strong></li>`,
    replace: `<li>Toplam VOC: 57.6V → Soğukta: 57.6 × 1.20 = 69.1V → P3200 limiti 80V → <strong>GÜVENLİ</strong></li>`,
  },
  {
    id: "hesap-sp400-eklendi",
    why: "SP400'ün hangi cihazlara bağlanamayacağı en sık sorulan konu; yazıda hiç örneklenmemişti.",
    find: `<p><strong>P3200 + 2× SP200 Seri:</strong></p>`,
    replace: `<p><strong>P1800 + 1× SP400:</strong></p>
<ul>
<li>VOC: 52.8V (tek panel; seri/paralel farketmez) → P1800 limiti 52V → <strong>YAPMAYIN.</strong> Tek panelde bile limit aşılıyor. SP400 yalnızca P3200 (80V limit) ya da SH4000'in HV MC4 girişiyle (en az 2 panel seri) kullanılır.</li>
</ul>

<p><strong>P3200 + 2× SP200 Seri:</strong></p>`,
  },

  // ── Seri/paralel rehberi: hibrit bağlantı şeması ─────────────────────────
  {
    id: "hibrit-string1",
    why: "String değerleri yanlış Voc/Isc'den türetilmişti.",
    find: `String 1: Panel A + Panel B (seri) → 48V, 11A`,
    replace: `String 1: Panel A + Panel B (seri) → 57.6V, 9.12A`,
  },
  {
    id: "hibrit-string2",
    why: "String değerleri yanlış Voc/Isc'den türetilmişti.",
    find: `String 2: Panel C + Panel D (seri) → 48V, 11A`,
    replace: `String 2: Panel C + Panel D (seri) → 57.6V, 9.12A`,
  },
  {
    id: "hibrit-toplam",
    why: "Hibrit dizinin toplam voltaj ve akımı yanlış hesaplanmıştı.",
    find: `├──── Paralel birleştirme → 48V, 22A → Güç İstasyonu`,
    replace: `├──── Paralel birleştirme → 57.6V, 18.24A → Güç İstasyonu`,
  },

  // ── Seri/paralel rehberi: limit tablosu ──────────────────────────────────
  {
    id: "limit-tablosu-eksik-modeller",
    why: "Tabloda Singo 2000 Pro ve SH4000 yoktu; SP400 uyumsuzluğunun gözden kaçmasının bir nedeni de bu.",
    find: `<tr><td>P3200</td><td>80V</td><td>16A</td><td>1000W</td></tr>
</table>`,
    replace: `<tr><td>P3200</td><td>80V</td><td>16A</td><td>1000W</td></tr>
<tr><td>Singo 2000 Pro</td><td>50V</td><td>11A</td><td>500W</td></tr>
<tr><td>SH4000 — LV (XT60)</td><td>50V</td><td>16A</td><td>600W</td></tr>
<tr><td>SH4000 — HV (MC4)</td><td>450V</td><td>16A</td><td>3000W</td></tr>
</table>

<p>SH4000'in HV girişi diğerlerinden farklı olarak bir <strong>alt sınıra</strong> da sahiptir: dizi voltajı 70V'un altındaysa giriş hiç devreye girmez. Bu yüzden HV girişine bağlanan paneller mutlaka seri bağlanır.</p>`,
  },

  // ── VOC rehberi ──────────────────────────────────────────────────────────
  {
    id: "voc-rehberi-sp200-tanimi",
    why: "Yazının kendi tanımıyla çelişiyordu: 24V, SP200'ün Vmp değeri; Voc 28.8V.",
    find: `Örneğin IEETek SP200 güneş panelinin VOC değeri yaklaşık <strong>24V</strong>'dur.`,
    replace: `Örneğin IEETek SP200 güneş panelinin VOC değeri <strong>28.8V</strong>'tur; aynı panelin çalışma voltajı (Vmp) ise 24V'tur. Etiketteki bu iki değeri karıştırmamak önemli, çünkü cihazın giriş limitiyle karşılaştırılması gereken VOC'dir.`,
  },
  {
    id: "voc-rehberi-soguk-ornegi",
    why: "Örnek yanlış etiket değeri üzerinden veriliyordu.",
    find: `Örneğin etiket VOC'si 24V olan panel, soğukta 27-28V üretebilir.`,
    replace: `Örneğin etiket VOC'si 28.8V olan SP200, soğukta 32-35V üretebilir.`,
  },
  {
    id: "voc-rehberi-formul-ornegi",
    why: "Hesap yanlış başlangıç değeriyle yapılıyordu; ayrıca cümlenin ikinci yarısı ('Ama … güvenlidir') anlamsız kalmıştı.",
    find: `<p>Örnek: SP200 panelin etiket VOC'si 24V → Soğukta tahmini maks: 24 × 1.20 = <strong>28.8V</strong>. Bu, P1800'ün 52V limitinin çok altındadır, güvenlidir. Ama P800'ün 60V limitinin çok altındadır, güvenlidir.</p>`,
    replace: `<p>Örnek: SP200 panelin etiket VOC'si 28.8V → Soğukta tahmini maks: 28.8 × 1.20 = <strong>34.6V</strong>. Bu değer hem P1800'ün 52V hem de P800'ün 60V limitinin altında kaldığı için güvenlidir.</p>

<p>Karşı örnek: SP400'ün etiket VOC'si <strong>52.8V</strong>. Soğuk hava payı hesaba katılmadan bile P1800'ün 52V ve Singo 2000 Pro'nun 50V limitinin üzerindedir; bu panel o cihazlara bağlanmaz. P3200'ün 80V limiti içinse rahatça uygundur.</p>`,
  },
  {
    // Seed'deki cümle "Ama" yerine "de" kullanıyor; veritabanı kopyası
    // sonradan düzenlenmiş.
    id: "voc-rehberi-formul-ornegi-seed-varyanti",
    why: "seed-blogs-v2.ts'teki farklı sürüm; aynı hatalı 24V başlangıç değeri.",
    find: `<p>Örnek: SP200 panelin etiket VOC'si 24V → Soğukta tahmini maks: 24 × 1.20 = <strong>28.8V</strong>. Bu, P1800'ün 52V limitinin çok altındadır, güvenlidir. P800'ün 60V limitinin de çok altındadır, güvenlidir.</p>`,
    replace: `<p>Örnek: SP200 panelin etiket VOC'si 28.8V → Soğukta tahmini maks: 28.8 × 1.20 = <strong>34.6V</strong>. Bu değer hem P1800'ün 52V hem de P800'ün 60V limitinin altında kaldığı için güvenlidir.</p>

<p>Karşı örnek: SP400'ün etiket VOC'si <strong>52.8V</strong>. Soğuk hava payı hesaba katılmadan bile P1800'ün 52V ve Singo 2000 Pro'nun 50V limitinin üzerindedir; bu panel o cihazlara bağlanmaz. P3200'ün 80V limiti içinse rahatça uygundur.</p>`,
  },
  {
    id: "voc-rehberi-seri-ipucu",
    why: "Pratik ipucu yanlış Voc değeri üzerinden örnekleniyordu.",
    find: `<li>Birden fazla paneli <strong>seri</strong> bağladığınızda VOC değerleri toplanır! 2× 24V VOC panel seri bağlanırsa toplam VOC 48V olur</li>`,
    replace: `<li>Birden fazla paneli <strong>seri</strong> bağladığınızda VOC değerleri toplanır! 2× SP200 (28.8V VOC) seri bağlanırsa toplam VOC 57.6V olur — bu değer P1800'ün 52V limitini aşar</li>`,
  },
  {
    id: "voc-rehberi-limit-tablosu",
    why: "Tabloda Singo 2000 Pro ve SH4000 yoktu.",
    find: `<tr><td>IEETek P3200</td><td>80V</td></tr>
</table>`,
    replace: `<tr><td>IEETek P3200</td><td>80V</td></tr>
<tr><td>IEETek Singo 2000 Pro</td><td>50V</td></tr>
<tr><td>IEETek SH4000</td><td>LV girişi 50V · HV girişi 450V (alt sınır 70V)</td></tr>
</table>`,
  },
  {
    id: "voc-rehberi-genel-iddia",
    why: "'Tüm IEETek panelleri tüm IEETek cihazlarıyla uyumlu' iddiası doğru değil; SP400 üç modele bağlanmıyor.",
    find: `IEETek güneş panelleri, IEETek güç istasyonlarıyla tam uyumlu VOC aralığında tasarlanmıştır.`,
    replace: `IEETek panelleri IEETek güç istasyonlarıyla birlikte kullanılmak üzere tasarlanmıştır, ancak her panel her modele uymaz: SP400'ün 52.8V VOC değeri P1800 (52V), Singo 2000 Pro (50V) ve SH4000'in LV girişi (50V) için fazla yüksektir. Satın almadan önce panelin VOC değerini cihazınızın giriş limitiyle karşılaştırın.`,
  },
];

const SEED_FILES = ["scripts/seed-blogs-v2.ts", "scripts/seed-blogs-v4.ts"];

const SLUGS = [
  "solar-panel-seri-paralel-baglanti-rehberi",
  "batarya-voc-degeri-nedir-neden-yukselir",
];

function applyRules(text: string): { text: string; applied: string[] } {
  let result = text;
  const applied: string[] = [];
  for (const rule of RULES) {
    if (!result.includes(rule.find)) continue;
    result = result.split(rule.find).join(rule.replace);
    applied.push(rule.id);
  }
  return { text: result, applied };
}

function printApplied(applied: string[]) {
  for (const id of applied) {
    const rule = RULES.find((r) => r.id === id)!;
    console.log(`  • ${id}`);
    console.log(`    ${rule.why}`);
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(
    apply
      ? "MOD: --apply — değişiklikler yazılacak\n"
      : "MOD: deneme çalışması — hiçbir şey yazılmayacak\n"
  );

  console.log("═".repeat(78));
  console.log("VERİTABANI");
  console.log("═".repeat(78));

  const posts = await prisma.blogPost.findMany({
    where: { slug: { in: SLUGS } },
    select: { id: true, slug: true, title: true, content: true },
  });

  const pending: { id: string; slug: string; content: string }[] = [];
  const matchedAnywhere = new Set<string>();

  for (const post of posts) {
    const { text, applied } = applyRules(post.content);
    if (applied.length === 0) continue;
    applied.forEach((id) => matchedAnywhere.add(id));
    console.log(`\n${post.title}`);
    console.log(`/blog/${post.slug}`);
    printApplied(applied);
    pending.push({ id: post.id, slug: post.slug, content: text });
  }

  console.log(`\n${"═".repeat(78)}`);
  console.log("SEED DOSYALARI");
  console.log("═".repeat(78));

  const fileWrites: { path: string; text: string }[] = [];
  for (const relativePath of SEED_FILES) {
    const fullPath = join(REPO_ROOT, relativePath);
    if (!existsSync(fullPath)) continue;
    const { text, applied } = applyRules(readFileSync(fullPath, "utf8"));
    if (applied.length === 0) continue;
    applied.forEach((id) => matchedAnywhere.add(id));
    console.log(`\n${relativePath}`);
    printApplied(applied);
    fileWrites.push({ path: fullPath, text });
  }

  // Hiçbir hedefte tutmayan kural, metnin değiştiği ya da kuralın yanlış
  // yazıldığı anlamına gelir; sessizce atlanmamalı.
  const unmatched = RULES.filter((rule) => !matchedAnywhere.has(rule.id));
  if (unmatched.length) {
    console.log(`\n${"═".repeat(78)}`);
    console.log("UYARI — hiçbir yerde eşleşmeyen kurallar");
    console.log("═".repeat(78));
    for (const rule of unmatched) console.log(`  ${rule.id}`);
  }

  if (!apply) {
    console.log(`\n${"═".repeat(78)}`);
    console.log("Deneme çalışmasıydı. Yazmak için --apply ekleyin.");
    return;
  }

  if (pending.length) {
    const backupPath = join(SCRIPT_DIR, ".sp200-voc-backup.json");
    writeFileSync(
      backupPath,
      JSON.stringify(
        posts.map((post) => ({ slug: post.slug, content: post.content })),
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
