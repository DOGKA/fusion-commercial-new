/**
 * public/sliders altındaki PNG kaynaklarını WebP'ye dönüştürür.
 *
 * Next.js image optimizer tarayıcıya zaten AVIF/WebP servis ediyor; buradaki
 * kazanç kaynak dosyalarda: cache miss anında optimizer'ın decode etmesi
 * gereken bayt miktarı ve deploy boyutu düşüyor.
 *
 *   node scripts/convert-sliders-to-webp.mjs           # dönüştür, PNG'leri bırak
 *   node scripts/convert-sliders-to-webp.mjs --delete  # dönüştür + PNG'leri sil
 */
import { readdir, stat, unlink } from "node:fs/promises";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SLIDERS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sliders");
const QUALITY = 82;
const deletePng = process.argv.includes("--delete");

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);

async function main() {
  const files = (await readdir(SLIDERS_DIR)).filter((f) => extname(f).toLowerCase() === ".png");

  if (files.length === 0) {
    console.log("Dönüştürülecek PNG bulunamadı.");
    return;
  }

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const src = join(SLIDERS_DIR, file);
    const dest = join(SLIDERS_DIR, `${basename(file, ".png")}.webp`);

    const before = (await stat(src)).size;
    await sharp(src).webp({ quality: QUALITY, effort: 6 }).toFile(dest);
    const after = (await stat(dest)).size;

    totalBefore += before;
    totalAfter += after;

    const saved = (((before - after) / before) * 100).toFixed(1);
    console.log(`${file}  ${mb(before)} MB -> ${mb(after)} MB  (-${saved}%)`);

    if (deletePng) await unlink(src);
  }

  console.log(
    `\nToplam: ${mb(totalBefore)} MB -> ${mb(totalAfter)} MB ` +
      `(-${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%)`
  );
  if (!deletePng) console.log("PNG kaynakları korundu. Silmek için --delete ile tekrar çalıştırın.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
