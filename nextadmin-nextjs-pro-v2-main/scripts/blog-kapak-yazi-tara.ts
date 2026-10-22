/**
 * Yayındaki üretilmiş kapakları Gemini ile denetler: okunabilir yazı, rakam,
 * logo veya tabela var mı; taşınabilir güç kaynağı (ya da benzeri batarya,
 * jeneratör) görünüyor mu. `--apply` ile işaretlenenleri yeniden üretir.
 *
 * Yeniden üretimde yazıya uygun ürünümüzün görseli referans olarak gider
 * (`coverProduct`); eski kapakta cihaz görünüyorsa konu ne olursa olsun bir
 * güç kaynağımız seçilir. Yeni kapak da denetlenir: yazı olmamalı, cihaz
 * varsa referans ürünle aynı olmalı, başka marka cihaz olmamalı. Uymazsa
 * en fazla DENEME kez farklı sahneyle üretilir; temiz çıkmazsa eskisi kalır.
 *
 * Çalıştırma:
 * cd nextadmin-nextjs-pro-v2-main
 * node --env-file=.env.local --import tsx scripts/blog-kapak-yazi-tara.ts            # yalnızca tara
 * node --env-file=.env.local --import tsx scripts/blog-kapak-yazi-tara.ts --apply    # tara + yeniden üret
 *
 * Seçenekler:
 *   --include=slug1,slug2   Denetim sonucundan bağımsız olarak bu yazılar da yenilenir.
 *   --offset=3              Denemeler 4, 5, 6 olur; önceki turdan farklı sahneler dener.
 *   --only=slug1,slug2      Yalnızca bu yazılar taranır.
 */

import { prisma } from "@/libs/prismaDb";
import {
  COVER_MODEL,
  coverProduct,
  generateCover,
  storeCover,
  type CoverProduct,
} from "@/lib/blog/server";
import { revalidateBlog } from "@/lib/revalidate-frontend";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const include = new Set(
  args
    .find((arg) => arg.startsWith("--include="))
    ?.split("=")[1]
    .split(",")
    .filter(Boolean) ?? []
);
const only = args
  .find((arg) => arg.startsWith("--only="))
  ?.split("=")[1]
  .split(",")
  .filter(Boolean);
const offset = Number(args.find((arg) => arg.startsWith("--offset="))?.split("=")[1]) || 0;
const CHECK_MODEL = process.env.GEMINI_CHECK_MODEL || "gemini-3.8-flash";
const DENEME = 3;
const PARALEL = 6;
const URETIM_PARALEL = 3;

/** 402 gelince yeni istek başlatılmaz; o ana kadar yenilenenler kaydedilmiş olur. */
let krediBitti = false;

interface Check {
  hasText: boolean;
  hasPowerStation: boolean;
  /** Yalnızca referans ürünle denetimde: ürün görünüyor ve referansla aynı. */
  matchesProduct?: boolean;
  /** Yalnızca referans ürünle denetimde: referans dışında güç kaynağı/batarya/jeneratör var. */
  otherDevice?: boolean;
  detail: string;
}

function mimeOf(buffer: Buffer): string {
  if (buffer.subarray(0, 4).toString("hex") === "89504e47") return "image/png";
  if (buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return "image/jpeg";
}

const urunGorselleri = new Map<string, Promise<Buffer>>();

function urunGorseli(url: string): Promise<Buffer> {
  if (!urunGorselleri.has(url)) {
    urunGorselleri.set(
      url,
      fetch(url).then(async (response) => {
        if (!response.ok) throw new Error(`Ürün görseli indirilemedi (${response.status}).`);
        return Buffer.from(await response.arrayBuffer());
      })
    );
  }
  return urunGorselleri.get(url)!;
}

async function check(image: Buffer, product: CoverProduct | null = null): Promise<Check> {
  const parts: object[] = [{ inlineData: { mimeType: mimeOf(image), data: image.toString("base64") } }];
  const properties: Record<string, object> = {
    hasText: { type: "BOOLEAN" },
    hasPowerStation: {
      type: "BOOLEAN",
      description:
        "Any portable power station, battery box, power bank, generator, inverter or UPS-like device is visible. Solar panels alone do not count.",
    },
    detail: { type: "STRING", description: "Where the text/device is and what it is, in a few words." },
  };
  let question =
    "Image 1 is a blog cover photo. Does it contain any readable or clearly visible text, letters, numbers, " +
    "words, logos, brand names, signage, labels, licence plates or watermarks? " +
    "Count it even if it is small, partial or gibberish pseudo-text. " +
    "Ignore only shapes so blurred that no characters can be made out. " +
    "Also: is any portable power station, battery box, power bank, generator, inverter or UPS-like device visible?";

  if (product) {
    parts.push({ inlineData: { mimeType: "image/png", data: (await urunGorseli(product.image)).toString("base64") } });
    question +=
      ` Image 2 is the white-background reference photo of our product "${product.name}".` +
      " Ignore the small original markings printed on this product itself when judging text; count any other text in the scene." +
      " matchesProduct: the product from image 2 appears in image 1 and looks like the same product (same shape, colour, proportions and front layout), not a different design." +
      " otherDevice: any power station, battery box, power bank, generator or inverter in image 1 other than that product.";
    properties.matchesProduct = { type: "BOOLEAN" };
    properties.otherDevice = { type: "BOOLEAN" };
  }
  parts.push({ text: question });

  const body = JSON.stringify({
    contents: [{ parts }],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: { type: "OBJECT", properties, required: Object.keys(properties) },
    },
  });

  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${CHECK_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
        body,
        signal: AbortSignal.timeout(90_000),
      }
    );
    if (response.ok) {
      const data = await response.json();
      const answer: { text?: string; thought?: boolean }[] = data.candidates?.[0]?.content?.parts ?? [];
      const raw = answer.find((part) => part.text && !part.thought)?.text ?? "";
      return JSON.parse(raw) as Check;
    }
    const capped =
      response.status === 429 && /spending cap/i.test((await response.clone().text().catch(() => "")) ?? "");
    if (response.status === 402 || capped) {
      krediBitti = true;
      throw new Error(`Denetim servisi: kredi/harcama limiti doldu (${response.status}).`);
    }
    if ((response.status !== 429 && response.status < 500) || attempt >= 4) {
      throw new Error(`Denetim servisi hata verdi (${response.status}).`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000 * 2 ** attempt));
  }
}

/** Yeni kapak kabul koşulu. */
function temiz(result: Check, product: CoverProduct | null): boolean {
  if (result.hasText) return false;
  if (!product) return !result.hasPowerStation;
  if (result.otherDevice) return false;
  return product.kind === "station" ? result.matchesProduct === true : !result.hasPowerStation;
}

async function download(url: string): Promise<Buffer> {
  const small = url.replace(/-1600\.webp$/, "-800.webp");
  const response = await fetch(small);
  if (!response.ok) throw new Error(`Kapak indirilemedi (${response.status}).`);
  return Buffer.from(await response.arrayBuffer());
}

async function havuz<T>(items: T[], size: number, run: (item: T, index: number) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length && !krediBitti) {
        const index = next++;
        await run(items[index], index);
      }
    })
  );
}

async function main() {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY tanımlı değil.");

  const posts = await prisma.blogPost.findMany({
    // Yalnızca üretilmiş kapaklar; elle yüklenmiş ürün fotoğraflarına dokunulmaz.
    where: {
      status: "PUBLISHED",
      featuredImage: { contains: "/blog/kapak/" },
      ...(only && { slug: { in: only } }),
    },
    orderBy: { publishedAt: "desc" },
    select: { id: true, slug: true, title: true, content: true, category: true, featuredImage: true },
  });

  console.log(`Görsel modeli: ${COVER_MODEL} · denetim modeli: ${CHECK_MODEL}`);
  console.log(`${posts.length} kapak taranıyor…\n`);

  type Post = (typeof posts)[number];
  const flagged: { post: Post; station: boolean }[] = [];
  let withText = 0;
  let withStation = 0;
  let errors = 0;
  await havuz(posts, PARALEL, async (post) => {
    try {
      // Kapakta referans ürünümüz birebir görünüyorsa sorun değil; başka cihaz görünüyorsa yenilenir.
      const reference = await coverProduct({ ...post, attempt: 0 });
      const result = await check(await download(post.featuredImage!), reference);
      const yabanciCihaz =
        result.otherDevice === true ||
        (result.hasPowerStation && !(reference?.kind === "station" && result.matchesProduct));
      if (result.hasText) withText += 1;
      if (yabanciCihaz) withStation += 1;
      if (result.hasText || yabanciCihaz || include.has(post.slug)) {
        flagged.push({ post, station: result.hasPowerStation });
        const etiket = [result.hasText && "yazı", yabanciCihaz && "cihaz"].filter(Boolean).join("+");
        console.log(`✗ [${etiket || "zorla"}] ${post.title}\n    ${result.detail}`);
      }
    } catch (error) {
      errors += 1;
      console.log(`? ${post.title}\n    ${error instanceof Error ? error.message : error}`);
    }
  });

  console.log(
    `\n${posts.length} kapak tarandı: ${withText} yazılı, ${withStation} cihazlı, ` +
      `${flagged.length} yenilenecek${errors ? `, ${errors} denetlenemedi` : ""}.`
  );
  if (!apply || flagged.length === 0) {
    if (flagged.length > 0) console.log("Yeniden üretmek için --apply ekleyin.");
    return;
  }

  const done: string[] = [];
  const kept: string[] = [];
  await havuz(flagged, URETIM_PARALEL, async ({ post, station }, index) => {
    const label = `[${index + 1}/${flagged.length}] ${post.title}`;
    const product = await coverProduct({ ...post, attempt: 0 }, { station });
    let replaced = false;
    for (let attempt = offset + 1; attempt <= offset + DENEME && !replaced && !krediBitti; attempt += 1) {
      try {
        const image = await generateCover({ ...post, attempt }, product);
        const result = await check(image, product);
        if (!temiz(result, product)) {
          const neden = [
            result.hasText && "yazı",
            product?.kind === "station" && !result.matchesProduct && "ürün uymuyor",
            result.otherDevice && "başka cihaz",
            !product && result.hasPowerStation && "cihaz",
          ]
            .filter(Boolean)
            .join(", ");
          console.log(`  · ${label} deneme ${attempt}: ${neden} (${result.detail})`);
          continue;
        }
        const src = await storeCover(image);
        await prisma.blogPost.update({ where: { id: post.id }, data: { featuredImage: src } });
        done.push(post.slug);
        replaced = true;
        console.log(`✓ ${label}${product ? ` · ${product.name}` : ""}\n    ${src}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/kredi|tavan|402/.test(message)) krediBitti = true;
        console.log(`  · ${label} deneme ${attempt}: ${message}`);
      }
    }
    if (!replaced) {
      kept.push(post.title);
      console.log(`✗ ${label}: ${DENEME} denemede temiz kapak çıkmadı, eskisi kaldı.`);
    }
  });

  if (krediBitti) console.log("\n!! Gemini kredisi veya harcama tavanı doldu; kalan yazılar işlenmedi.");
  console.log(`\n${done.length} kapak yenilendi, ${kept.length} kapak olduğu gibi kaldı.`);
  for (const title of kept) console.log(`  - ${title}`);

  for (let start = 0; start < done.length; start += 18) {
    const result = await revalidateBlog(done.slice(start, start + 18));
    if (!result.success) {
      console.log(`Mağaza önbelleği tazelenemedi (${result.error}).`);
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
