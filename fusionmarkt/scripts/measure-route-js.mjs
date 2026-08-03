/**
 * Bir build'in rota başına istemci JS'ini ölçer (ham + gzip).
 *
 * `next build` tablosu "First Load JS" veriyor ama iki build'i karşılaştırırken
 * yuvarlaması (0.1 kB) ve paylaşılan chunk'ları toplama biçimi küçük kazançları
 * gizliyor. Burada app-build-manifest.json'daki dosya listesi birebir toplanıyor.
 *
 * Kullanım: node scripts/measure-route-js.mjs <distDir> [rota ...]
 */

import { readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const [distDir, ...routes] = process.argv.slice(2);
if (!distDir) {
  console.error("kullanım: node scripts/measure-route-js.mjs <distDir> [rota ...]");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(distDir, "app-build-manifest.json"), "utf8"));
const targets = routes.length ? routes : Object.keys(manifest.pages);

const rows = targets.map((route) => {
  const files = manifest.pages[route];
  if (!files) return { route, raw: NaN, gzip: NaN, count: 0 };
  let raw = 0;
  let gzip = 0;
  for (const file of files) {
    const path = join(distDir, file);
    raw += statSync(path).size;
    gzip += gzipSync(readFileSync(path)).length;
  }
  return { route, raw, gzip, count: files.length };
});

const kb = (n) => (n / 1024).toFixed(1).padStart(7);
for (const { route, raw, gzip, count } of rows) {
  console.log(`${route.padEnd(40)} raw ${kb(raw)} kB  gzip ${kb(gzip)} kB  (${count} dosya)`);
}
