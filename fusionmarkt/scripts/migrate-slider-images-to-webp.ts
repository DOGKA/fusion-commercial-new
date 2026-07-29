/**
 * Slider görsel yollarını .png -> .webp olarak günceller.
 *
 * scripts/convert-sliders-to-webp.mjs public/sliders altındaki PNG'leri WebP'ye
 * çevirir ama DB'deki Slider.desktopImage / mobileImage kolonları hâlâ .png
 * yollarını tutar. Bu script yalnızca /sliders/ ile başlayan yerel yolları
 * hedefler; CDN'e (cdn.fusionmarkt.com) yüklenmiş görsellere dokunmaz.
 *
 * Çalıştırma (fusionmarkt klasöründe). tsx .env.local'i kendiliğinden okumaz,
 * bu yüzden --env-file gerekiyor:
 *   npx tsx --env-file=.env.local scripts/migrate-slider-images-to-webp.ts
 *   npx tsx --env-file=.env.local scripts/migrate-slider-images-to-webp.ts --apply
 *
 * Idempotent: zaten .webp olan kayıtları atlar.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@repo/db";

const APPLY = process.argv.includes("--apply");
const PUBLIC_DIR = join(process.cwd(), "public");

function toWebp(path: string | null): string | null {
  if (!path?.startsWith("/sliders/") || !path.toLowerCase().endsWith(".png")) return null;

  const next = path.replace(/\.png$/i, ".webp");
  if (!existsSync(join(PUBLIC_DIR, next))) {
    console.warn(`  ! ${next} diskte yok, atlanıyor. Önce convert-sliders-to-webp.mjs çalıştırın.`);
    return null;
  }
  return next;
}

async function main() {
  const sliders = await prisma.slider.findMany({
    select: { id: true, name: true, desktopImage: true, mobileImage: true },
  });

  let changed = 0;

  for (const slider of sliders) {
    const desktopImage = toWebp(slider.desktopImage);
    const mobileImage = toWebp(slider.mobileImage);
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
