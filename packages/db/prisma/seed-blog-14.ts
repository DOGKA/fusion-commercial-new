/**
 * FusionMarkt Blog Seed — 14 (2026 SEO + GEO serisi, 20 yazı)
 *
 * İçerikler `seed-blog-14-data/yazilar-*.ts` dosyalarındadır. Bu seed yalnızca
 * EKLEME yapar: veritabanında aynı slug'a sahip bir yazı varsa ona dokunulmaz.
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-blog-14.ts            # kuru çalışma (yazmaz)
 *   cd packages/db && npx tsx prisma/seed-blog-14.ts --apply    # eksik yazıları ekler
 *
 * DATABASE_URL ortamda yoksa: node --env-file=<.env dosyası> --import tsx prisma/seed-blog-14.ts --apply
 */
import { PrismaClient } from "@prisma/client";

import type { BlogInput } from "./seed-blog-14-data/tip";
import { yazilar as a } from "./seed-blog-14-data/yazilar-a";
import { yazilar as b } from "./seed-blog-14-data/yazilar-b";
import { yazilar as c } from "./seed-blog-14-data/yazilar-c";
import { yazilar as d } from "./seed-blog-14-data/yazilar-d";
import { yazilar as e } from "./seed-blog-14-data/yazilar-e";
import { yazilar as f } from "./seed-blog-14-data/yazilar-f";
import { yazilar as g } from "./seed-blog-14-data/yazilar-g";
import { yazilar as h } from "./seed-blog-14-data/yazilar-h";
import { yazilar as i } from "./seed-blog-14-data/yazilar-i";
import { yazilar as j } from "./seed-blog-14-data/yazilar-j";

const prisma = new PrismaClient();

const tumu: BlogInput[] = [...a, ...b, ...c, ...d, ...e, ...f, ...g, ...h, ...i, ...j];

/** Yayın sırası ve tarihleri (TSİ). Gelecek tarih yok; son yazı 21 Ekim 2026. */
const takvim: [slug: string, tarih: string][] = [
  ["solar-jenerator-nedir-gunes-enerjili-jenerator", "2026-10-02T10:15:00+03:00"],
  ["gunes-paneli-guc-kaynagi-uyumluluk-solar-sarj-suresi", "2026-10-03T11:40:00+03:00"],
  ["planli-elektrik-kesintisi-sorgulama-ve-hazirlik", "2026-10-04T09:20:00+03:00"],
  ["karavan-buzdolabi-12v-power-station-kac-gun-gider", "2026-10-05T14:05:00+03:00"],
  ["solar-paket-secimi-2026-hangi-solar-paket", "2026-10-06T10:30:00+03:00"],
  ["airfryer-kettle-power-station-ile-calisir-mi", "2026-10-07T12:10:00+03:00"],
  ["ev-tipi-enerji-depolama-sistemi-10-kwh-ev-bataryasi", "2026-10-08T09:45:00+03:00"],
  ["power-station-uzatma-kablosu-grup-priz-kullanimi", "2026-10-09T15:25:00+03:00"],
  ["tasinabilir-gunes-paneli-mi-cati-gunes-paneli-mi", "2026-10-10T11:00:00+03:00"],
  ["oyun-bilgisayari-playstation-power-station-kac-saat", "2026-10-11T13:35:00+03:00"],
  ["karavanda-yolda-sarj-arac-sarji-ile-power-station", "2026-10-12T10:50:00+03:00"],
  ["bebekli-evde-elektrik-kesintisi-guc-kaynagi", "2026-10-13T09:10:00+03:00"],
  ["p3200-mu-sh4000-mu-ev-yedek-guc-karsilastirma", "2026-10-14T14:20:00+03:00"],
  ["aricilar-icin-gunes-paneli-ve-tasinabilir-enerji", "2026-10-15T10:05:00+03:00"],
  ["elektrikli-scooter-bisiklet-power-station-ile-sarj", "2026-10-16T12:45:00+03:00"],
  ["oksijen-konsantratoru-power-station-ile-calisir-mi", "2026-10-17T09:30:00+03:00"],
  ["bahce-aletleri-cim-bicme-power-station-ile-calisir-mi", "2026-10-18T11:55:00+03:00"],
  ["tasinabilir-solar-sistem-geri-odeme-suresi-hesaplama", "2026-10-19T10:25:00+03:00"],
  ["akvaryum-elektrik-kesintisi-hava-motoru-yedek-guc", "2026-10-20T13:15:00+03:00"],
  ["bungalov-glamping-tesisi-icin-solar-enerji", "2026-10-21T10:40:00+03:00"],
];

function dogrula() {
  const sluglar = tumu.map((y) => y.slug);
  if (tumu.length !== 20) throw new Error(`20 yazı bekleniyordu, ${tumu.length} bulundu`);
  if (new Set(sluglar).size !== sluglar.length) throw new Error("Tekrarlanan slug var");
  const takvimSet = new Set(takvim.map(([s]) => s));
  const eksik = sluglar.filter((s) => !takvimSet.has(s));
  if (eksik.length || takvim.length !== tumu.length) throw new Error(`Takvim uyuşmuyor: ${eksik.join(", ")}`);
  const simdi = Date.now();
  for (const [s, t] of takvim) {
    if (new Date(t).getTime() > simdi) throw new Error(`Gelecek tarihli yayın: ${s} ${t}`);
  }
}

async function main() {
  const uygula = process.argv.includes("--apply");
  dogrula();
  console.log(`🚀 Blog Seed 14 — ${tumu.length} yazı (${uygula ? "UYGULA" : "KURU ÇALIŞMA"})\n`);

  const mevcut = await prisma.blogPost.findMany({
    where: { slug: { in: tumu.map((y) => y.slug) } },
    select: { slug: true },
  });
  const mevcutSet = new Set(mevcut.map((m) => m.slug));
  const yayin = new Map(takvim);

  let eklenen = 0;
  for (const y of tumu) {
    if (mevcutSet.has(y.slug)) {
      console.log(`⏭️  zaten var, dokunulmadı: ${y.slug}`);
      continue;
    }
    if (uygula) {
      await prisma.blogPost.create({
        data: {
          slug: y.slug,
          title: y.title,
          content: y.content,
          excerpt: y.excerpt,
          category: y.category,
          tags: y.tags,
          metaTitle: y.metaTitle,
          metaDescription: y.metaDescription,
          metaKeywords: y.metaKeywords,
          featuredImage: null,
          status: "PUBLISHED",
          authorName: "FusionMarkt",
          viewCount: 0,
          publishedAt: new Date(yayin.get(y.slug)!),
        },
      });
    }
    eklenen++;
    console.log(`${uygula ? "✅" : "📝"} ${yayin.get(y.slug)!.slice(0, 10)}  [${y.category}]  ${y.slug}`);
  }

  console.log(
    `\n${uygula ? "🎉 Eklendi" : "ℹ️  Eklenecek"}: ${eklenen} · Atlanan (mevcut): ${mevcutSet.size}` +
      (uygula ? "" : "\nYazmak için --apply ile çalıştırın.")
  );
}

main()
  .catch((err) => {
    console.error("❌ Hata:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
