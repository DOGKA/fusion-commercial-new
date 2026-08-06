/**
 * SSS çıktısını gerçek katalog verisiyle gözden geçirmek için:
 *   npx tsx scripts/faq-preview.ts fixtures.json [ad filtresi]
 *
 * Fixture dosyası ürün adı, kategori slug'ı, özellik ve varyant listesini
 * içeriyor; üretim verisini kopyalamadan kural değişikliklerinin tüm
 * kategorilerde nasıl göründüğünü görmeyi sağlıyor.
 */
import { readFileSync } from "node:fs";
import { buildProductFaq, type ProductFaqInput } from "../src/lib/product-faq";

const fixtures: Array<Omit<ProductFaqInput, "freeShipping">> = JSON.parse(
  readFileSync(process.argv[2], "utf8"),
);
const filter = process.argv[3]?.toLocaleLowerCase("tr-TR");

for (const fixture of fixtures) {
  if (filter && !fixture.name.toLocaleLowerCase("tr-TR").includes(filter)) continue;

  const faq = buildProductFaq({ ...fixture, freeShipping: true });

  console.log(`\n=== ${fixture.name}`);
  console.log(`    [${fixture.categorySlug}] ${faq.eyebrow} / ${faq.title} — ${faq.items.length} soru`);
  for (const item of faq.items) {
    console.log(`\nS: ${item.question}`);
    console.log(`C: ${item.intro}`);
    for (const row of item.rows ?? []) console.log(`   - ${row.name}: ${row.value}`);
    console.log(`   [şema ${item.answer.split(/\s+/).length} kelime]`);
  }
}
