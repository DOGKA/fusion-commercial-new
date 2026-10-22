/**
 * Kapağı olmayan blog yazılarına Gemini ile kapak üretir.
 *
 * Paneldeki "Kapak üret" ile aynı yönergeyi ve aynı depolamayı kullanır.
 * Varsayılan kuru çalıştırmadır: yalnızca hangi yazılara kapak üretileceğini
 * listeler. `--apply` verilmeden görsel üretilmez ve veritabanı değişmez.
 *
 * Çalıştırma:
 * cd nextadmin-nextjs-pro-v2-main
 * node --env-file=.env.local --import tsx scripts/blog-kapak-uret.ts            # liste
 * node --env-file=.env.local --import tsx scripts/blog-kapak-uret.ts --apply    # üret
 *
 * Seçenekler:
 *   --limit=5        En fazla bu kadar yazı işlenir.
 *   --slug=<slug>    Yalnızca bu yazı (kapağı olsa bile yeniden üretilir).
 *   --prompt         Kuru çalıştırmada ilk yazının yönergesini de yazdırır.
 *   --attempt=2      Farklı kişi/çekim/sahne dener (paneldeki "yeniden üret" gibi).
 *   --hint="..."     Yazıya özel ek yönerge (İngilizce), ör. sahnede neyin baskın olacağı.
 *   --out=/tmp/x.png --apply ile birlikte: görseli yalnızca bu dosyaya yazar, yüklemez ve kaydetmez.
 *   --from=/tmp/x.png --slug ve --apply ile: üretmeden bu dosyayı kapak olarak yükler (önizlemeyi onaylamak için).
 */

import { readFile, writeFile } from "node:fs/promises";
import { prisma } from "@/libs/prismaDb";
import {
  COVER_MODEL,
  coverProduct,
  coverPrompt,
  generateCover,
  storeCover,
  type CoverProduct,
} from "@/lib/blog/server";
import { revalidateBlog } from "@/lib/revalidate-frontend";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const showPrompt = args.includes("--prompt");
const attempt = Number(args.find((arg) => arg.startsWith("--attempt="))?.split("=")[1]) || 0;
const hint = args.find((arg) => arg.startsWith("--hint="))?.slice("--hint=".length) || undefined;
const out = args.find((arg) => arg.startsWith("--out="))?.slice("--out=".length);
const from = args.find((arg) => arg.startsWith("--from="))?.slice("--from=".length);
const limit = Number(args.find((arg) => arg.startsWith("--limit="))?.split("=")[1]) || undefined;
const slug = args.find((arg) => arg.startsWith("--slug="))?.split("=")[1];

async function main() {
  const posts = await prisma.blogPost.findMany({
    where: slug ? { slug } : { status: "PUBLISHED", featuredImage: null },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: { id: true, slug: true, title: true, content: true, category: true },
  });

  if (posts.length === 0) {
    console.log(slug ? `"${slug}" adresli yazı bulunamadı.` : "Kapağı olmayan yayında yazı yok.");
    return;
  }

  console.log(`Model: ${COVER_MODEL}`);
  console.log(`${posts.length} yazı ${apply ? "işlenecek" : "kapak bekliyor (kuru çalıştırma)"}:\n`);
  const products = new Map<string, CoverProduct | null>();
  for (const post of posts) {
    const product = await coverProduct({ ...post, attempt });
    products.set(post.id, product);
    console.log(`  - [${post.category ?? "-"}] ${post.title}${product ? `\n      ürün: ${product.name}` : ""}`);
  }

  if (!apply) {
    if (showPrompt) {
      const first = posts[0];
      console.log(`\nİlk yazının yönergesi:\n\n${coverPrompt({ ...first, attempt, hint }, products.get(first.id))}`);
    }
    console.log("\nÜretmek için --apply ekleyin.");
    return;
  }

  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY tanımlı değil.");

  const done: string[] = [];
  const failed: { title: string; error: string }[] = [];

  for (const [index, post] of posts.entries()) {
    const label = `[${index + 1}/${posts.length}] ${post.title}`;
    try {
      const image = from
        ? await readFile(from)
        : await generateCover({ ...post, attempt, hint }, products.get(post.id));
      if (out) {
        await writeFile(posts.length > 1 ? out.replace(/(\.\w+)?$/, `-${post.slug}$1`) : out, image);
        console.log(`· ${label}\n    önizleme: ${out} (yüklenmedi)`);
        continue;
      }
      const src = await storeCover(image);
      await prisma.blogPost.update({ where: { id: post.id }, data: { featuredImage: src } });
      done.push(post.slug);
      console.log(`✓ ${label}\n    ${src}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failed.push({ title: post.title, error: message });
      console.log(`✗ ${label}\n    ${message}`);
    }
  }

  console.log(`\n${done.length} kapak üretildi, ${failed.length} başarısız.`);
  if (failed.length > 0) {
    console.log("Başarısız olanlar betiği yeniden çalıştırınca tekrar denenir.");
  }

  // Tazeleme ucu istek başına en fazla 20 yol alıyor; "/" ve "/blog" her istekte gidiyor.
  for (let start = 0; start < done.length; start += 18) {
    const result = await revalidateBlog(done.slice(start, start + 18));
    if (!result.success) {
      console.log(`Mağaza önbelleği tazelenemedi (${result.error}). Canlıda /api/revalidate ile tazeleyin.`);
      break;
    }
    if (start + 18 >= done.length) console.log("Mağaza önbelleği tazelendi.");
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
