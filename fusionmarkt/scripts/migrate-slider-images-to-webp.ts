/**
 * Slider görsel yollarını .png <-> .webp arasında çevirir.
 *
 * scripts/convert-sliders-to-webp.mjs public/sliders altındaki PNG'leri WebP'ye
 * çevirir ama DB'deki Slider.desktopImage / mobileImage kolonları hâlâ .png
 * yollarını tutar. Bu script yalnızca /sliders/ ile başlayan yerel yolları
 * hedefler; CDN'e (cdn.fusionmarkt.com) yüklenmiş görsellere dokunmaz.
 *
 * SIRALAMA UYARISI: DB tek, deploy ayrı. Yeni .webp dosyaları sunucuya
 * inmeden DB'yi çevirirsen slider görselleri production'da 404 verir.
 * Doğru sıra: önce deploy, sonra --apply. Yanlış sırada gittiyse --revert
 * ile DB'yi .png'ye geri al.
 *
 * Çalıştırma (fusionmarkt klasöründe). tsx .env.local'i kendiliğinden okumaz,
 * bu yüzden --env-file gerekiyor:
 *   npx tsx --env-file=.env.local scripts/migrate-slider-images-to-webp.ts
 *   npx tsx --env-file=.env.local scripts/migrate-slider-images-to-webp.ts --apply
 *   npx tsx --env-file=.env.local scripts/migrate-slider-images-to-webp.ts --revert --apply
 *
 * Idempotent: hedef uzantıya zaten çevrilmiş kayıtları atlar.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@repo/db";

const APPLY = process.argv.includes("--apply");
const REVERT = process.argv.includes("--revert");
const PUBLIC_DIR = join(process.cwd(), "public");

const FROM = REVERT ? ".webp" : ".png";
const TO = REVERT ? ".png" : ".webp";

function convert(path: string | null): string | null {
  if (!path?.startsWith("/sliders/") || !path.toLowerCase().endsWith(FROM)) return null;

  const next = path.replace(new RegExp(`\\${FROM}$`, "i"), TO);

  // Revert'te disk kontrolü yapılmıyor: geri dönülen hedef eski deployment'ın
  // dosya seti, bu makinedeki public/ klasörü değil. PNG'ler burada silinmiş
  // olsa da sunucuda duruyor olabilir.
  if (!REVERT && !existsSync(join(PUBLIC_DIR, next))) {
    console.warn(`  ! ${next} diskte yok, atlanıyor. Önce convert-sliders-to-webp.mjs çalıştırın.`);
    return null;
  }
  return next;
}

async function main() {
  console.log(`Mod: ${FROM} -> ${TO}${APPLY ? "" : "  (DRY RUN)"}\n`);

  const sliders = await prisma.slider.findMany({
    select: { id: true, name: true, desktopImage: true, mobileImage: true },
  });

  let changed = 0;

  for (const slider of sliders) {
    const desktopImage = convert(slider.desktopImage);
    const mobileImage = convert(slider.mobileImage);
    if (!desktopImage && !mobileImage) continue;

    changed++;
    console.log(`${slider.name}`);
    if (desktopImage) console.log(`  desktop: ${slider.desktopImage} -> ${desktopImage}`);
    if (mobileImage) console.log(`  mobile:  ${slider.mobileImage} -> ${mobileImage}`);

    if (APPLY) {
      await prisma.slider.update({
        where: { id: slider.id },
        data: {
          ...(desktopImage ? { desktopImage } : {}),
          ...(mobileImage ? { mobileImage } : {}),
        },
      });
    }
  }

  console.log(
    changed === 0
      ? "\nGüncellenecek kayıt yok."
      : `\n${changed} slider ${APPLY ? "güncellendi." : "güncellenecek (DRY RUN). --apply ile çalıştırın."}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
