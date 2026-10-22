import { randomBytes } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { prisma } from "@/libs/prismaDb";
import { STORAGE_BUCKET, STORAGE_PREFIX, getClient, getPublicUrl } from "@/lib/s3";
import { BLOG_STATUSES, SLUG_PATTERN, type BlogPostInput, type BlogStatus } from "./shared";

/** Gemini kapakları birkaç MB; yüklemeler de aynı tavanı kullanıyor. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function putObject(key: string, data: Buffer): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
      Body: data,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
}

function newId(): string {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `${day}-${randomBytes(6).toString("hex")}`;
}

export function assertImage(file: File): void {
  if (!IMAGE_TYPES.has(file.type)) throw new Error("Yalnızca JPG, PNG, WebP veya GIF yüklenebilir.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Görsel en fazla 20 MB olabilir.");
}

/** Yazı içi görsel: genişliği 1600'ü aşmayan WebP. */
export async function storeContentImage(input: Buffer): Promise<string> {
  const data = await sharp(input, { animated: true })
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toBuffer();
  const key = `${STORAGE_PREFIX}/blog/icerik/${newId()}.webp`;
  await putObject(key, data);
  return getPublicUrl(key);
}

/**
 * Kapak: 16:9, `-1600` ve `-800` WebP. Mağaza `-1600` adresinden küçük
 * sürümü türetiyor; `featuredImage` büyük sürümü tutar.
 */
export async function storeCover(input: Buffer): Promise<string> {
  const base = `${STORAGE_PREFIX}/blog/kapak/${newId()}`;
  for (const width of [1600, 800]) {
    const data = await sharp(input)
      .rotate()
      .resize({ width, height: Math.round((width * 9) / 16), fit: "cover" })
      .webp({ quality: width > 800 ? 72 : 70, effort: 5 })
      .toBuffer();
    await putObject(`${base}-${width}.webp`, data);
  }
  return getPublicUrl(`${base}-1600.webp`);
}

/* ---- Kapak üretimi ---- */

/** Konu anahtar kelimesi → olası mekânlar. İlk eşleşen kullanılır. */
const KONU_SAHNE: { match: RegExp; scene: string }[] = [
  {
    match: /karavan|kamp|doğa|outdoor|yayla|tekne|off-?grid/i,
    scene:
      "a caravan parked by a lake, a campsite in a pine forest, a high mountain plateau, a quiet beach camp, a sailboat at a small marina, a van on a coastal road, a desert campsite, a cabin in snowy woods, a riverside picnic spot, a festival campground",
  },
  {
    match: /tarım|sera|sulama|pompa|hidrofor|bahçe|çiftlik|kuyu/i,
    scene:
      "an irrigated orchard, a greenhouse in the countryside, a village garden with a water well, a farm field with drip irrigation lines, a vineyard on a hillside, a vegetable patch behind a farmhouse, a small olive grove, an allotment garden, a livestock barn, a water tank on a rural property",
  },
  {
    match: /güneş|solar|panel|fotovoltaik|eğim|mppt/i,
    scene:
      "a sunny apartment balcony with a couple of solar panels, a village house rooftop with solar panels, a terrace garden in clear daylight, an open field under a wide blue sky, a detached house with a solar roof, a barn roof with panels, a cabin with a small panel array, a coastal town of white houses, a technician cleaning panels on a roof, a sunlit parking area with a solar canopy",
  },
  {
    match: /iş güvenliği|eldiven|şantiye|atölye|endüstri|fabrika|depo/i,
    scene:
      "a clean workshop, a construction site, a warehouse aisle, a factory floor, a woodworking shop, a metal fabrication bench, a loading dock, a road works site, a car repair garage, a logistics centre; workers wear plain unbranded gloves and safety gear",
  },
  {
    match: /ofis|işletme|dükkan|mağaza|kafe/i,
    scene:
      "a small neighbourhood shop, a bright office, a café counter, a small business in the morning before opening, a bakery, a hair salon, a co-working space, a market stall, a florist, a small clinic reception",
  },
  {
    match: /kesinti|buzdolab|kombi|ev|evde|evin|ups|klima|tarife/i,
    scene:
      "a bright apartment living room, a family kitchen, a home office corner, a cosy bedroom in daylight, an apartment balcony overlooking the street, a suburban house porch, a children's room, a laundry room, a dining table set for dinner, a quiet residential street",
  },
  {
    match: /batarya|bms|döngü|lityum|lifepo4|kapasite|sertifika|yangın|şarj|wh|watt|teknik|sözlük/i,
    scene:
      "a tidy electronics repair bench, a bright engineering lab, a technician's hands checking wiring, a modern garage with a workbench, a quality control station, a school science classroom, a calm warehouse with neatly stacked boxes",
  },
];

const VARSAYILAN_SAHNE =
  "everyday modern life where reliable electricity matters: at home, on a balcony, in a garden, on a road trip, at a small business, at a campsite, in a workshop, on a farm";

/** Global görünüm için kişilerin kökeni. */
const KOKENLER = [
  "European",
  "Mediterranean",
  "East Asian",
  "South Asian",
  "Latin American",
  "Middle Eastern",
  "African",
  "Scandinavian",
  "mixed-background",
];

const MEVSIMLER = [
  "clear spring morning",
  "bright summer midday",
  "crisp autumn afternoon with clear sky",
  "sunny winter day with snow on the ground",
  "fresh morning after rain, sky clearing",
  "late morning with soft high clouds",
  "breezy sunny day",
  "bright overcast day with even soft light",
];

const KISILER = [
  "a young woman in her late twenties",
  "a couple in their thirties",
  "a retired man in his sixties",
  "a family with two young children",
  "a young man in his early twenties",
  "a woman in her forties",
  "no people at all; let the place tell the story",
  "an elderly woman with her adult daughter",
  "a man in his forties",
  "a young professional woman in her thirties",
  "two friends in their twenties",
  "a father and his teenage son",
  "a grandmother with her grandchild",
  "a middle-aged farmer",
  "a technician in plain work clothes",
  "a young couple with a dog",
  "a group of three hikers",
  "a woman in her fifties gardening",
  "a remote worker in his thirties, away from the screen",
  "only hands at work, face out of frame",
  "a small team of two colleagues",
  "no people; empty room or landscape with signs of daily life",
];

const CEKIMLER = [
  "wide establishing shot outdoors",
  "medium shot at eye level",
  "close-up detail shot with a shallow depth of field",
  "over-the-shoulder shot",
  "street-level view with depth and perspective",
  "high-angle view from a balcony or window",
  "low-angle shot looking up against the sky",
  "aerial drone view from above",
  "candid documentary moment, slightly off-centre",
  "symmetrical composition, centred subject",
  "framed through a doorway or window",
  "environmental portrait with the place filling most of the frame",
  "side profile shot with soft background blur",
  "wide panoramic landscape with a small subject",
  "detail shot of hands and objects on a surface",
  "three-quarter view at mid distance",
];

function sec<T>(liste: T[], anahtar: string, tuz: number): T {
  let h = tuz;
  for (const ch of anahtar) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return liste[h % liste.length];
}

export function plainText(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface CoverRequest {
  title: string;
  content: string;
  category: string | null;
  /** Aynı yazı için her "yeniden üret" farklı kişi ve çekim dener. */
  attempt: number;
  /** Yazıya özel ek yönerge (İngilizce); sahne, kişi ve çekim seçiminin önüne geçer. */
  hint?: string;
}

/* ---- Ürün referansı ---- */

type UrunTuru = "station" | "panel" | "glove";

/**
 * Yazıda model adı, ürün bağlantısı veya ürün görseli yoksa başlığa bakılır:
 * konusu ürünün sahada kullanımı olan yazılar ürün gösterir, teknik ve genel
 * yazılar sahne olarak kalır. İlk eşleşen kullanılır.
 */
const URUN_KONULARI: { match: RegExp; kind: UrunTuru }[] = [
  { match: /taşınabilir güneş paneli|solar panel ile güç/i, kind: "panel" },
  { match: /eldiven/i, kind: "glove" },
  {
    match:
      /off-?grid|kamp|karavan|tekne|balıkçı|festival|açık hava|food truck|gıda tırı|drone|fotoğrafçı|şantiye|enerji özgürlüğü|deprem çantası|kesintisine hazırlık/i,
    kind: "station",
  },
];

/** Konudan seçilen güç kaynağı bu modellerden biri olur; adı geçen model her zaman önceliklidir. */
const VARSAYILAN_ISTASYONLAR = ["P800", "P1800", "P3200"];

/** Türkçe küçük harfe çevrilmiş metinde aranır ("İstasyonu" → "istasyonu"). */
const GENEL_ISTASYON =
  /power ?station|güç istasyon|güç kaynağ|solar jeneratör|güneş enerjisi jeneratör|jeneratör alternatif/;

const URUN_YERLESIM: Record<UrunTuru, string> = {
  station:
    "standing on a stable surface where it is actually being used (a camp table, the ground, a caravan step, a kitchen counter), at the realistic size of a portable power station. At most one plain cable to a single appliance",
  panel: "unfolded on its own kickstand, angled towards the sun, at realistic size",
  glove: "worn on the hands of the person at work (these gloves replace any plain gloves mentioned above)",
};

export interface CoverProduct {
  name: string;
  kind: UrunTuru;
  image: string;
}

interface UrunSatiri {
  name: string;
  slug: string;
  images: string[];
}

function kisaAd(name: string): string {
  return name.split(/\s[|/-]\s/)[0].replace(/\s+/g, " ").trim();
}

/** "P800 512Wh | ..." → "P800"; "Singo2000PRO" yazıda "Singo 2000 Pro" diye de geçebilir. */
function modelKodu(name: string): string {
  return name.split(/\s/)[0];
}

function modelDeseni(kod: string): RegExp {
  const esnek = kod.replace(/(?<=[a-z])(?=\d)|(?<=\d)(?=[a-z])/gi, "\\s?");
  return new RegExp(`(?<![\\p{L}\\d])${esnek}(?![\\p{L}\\d])`, "giu");
}

function istasyonlar(): Promise<UrunSatiri[]> {
  return prisma.product.findMany({
    where: {
      isActive: true,
      // Genişletme modülü ve aksesuarlar değil, güç kaynağının kendisi.
      name: { contains: "Taşınabilir Güç Kaynağı" },
      category: { name: "Taşınabilir Güç Kaynakları" },
    },
    orderBy: { slug: "asc" },
    select: { name: true, slug: true, images: true },
  });
}

/** Başlıkta adı geçen > ürün bağlantısı/görseli > yazıda en çok adı geçen. */
function anilanIstasyon(title: string, content: string, adaylar: UrunSatiri[]): UrunSatiri | null {
  let best: { product: UrunSatiri; puan: number } | null = null;
  for (const product of adaylar) {
    const desen = modelDeseni(modelKodu(product.name));
    const puan =
      (title.match(desen)?.length ?? 0) * 1000 +
      (content.split(`/urun/${product.slug}`).length - 1) * 50 +
      product.images.filter((image) => content.includes(image)).length * 50 +
      (content.match(desen)?.length ?? 0);
    if (puan > 0 && (!best || puan > best.puan)) best = { product, puan };
  }
  return best?.product ?? null;
}

/**
 * Kapakta gösterilecek ürün ve beyaz fonlu, önden çekilmiş ana görseli
 * (ürünün ilk görseli). Aynı yazı her zaman aynı ürünü seçer.
 *
 * Güç kaynağı: yazıda modelimizin adı, ürün bağlantısı veya görseli geçiyorsa
 * o model; yalnızca "güç istasyonu / güç kaynağı / power station" gibi genel
 * bir ifade geçiyorsa P800/P1800/P3200'den biri. `station: true` hiçbiri
 * geçmese de bir güç kaynağı döndürür (eski kapakta cihaz görünüyorsa).
 */
export async function coverProduct(
  { title, content, category }: CoverRequest,
  options: { station?: boolean } = {}
): Promise<CoverProduct | null> {
  const konu = category === "Teknik" ? undefined : URUN_KONULARI.find((item) => item.match.test(title));

  if (konu?.kind !== "glove" && category !== "İş Güvenliği") {
    const adaylar = (await istasyonlar()).filter((product) => product.images[0]);
    const genel = GENEL_ISTASYON.test(`${title} ${plainText(content)}`.toLocaleLowerCase("tr"));
    const istasyon =
      anilanIstasyon(title, content, adaylar) ??
      (genel || konu?.kind === "station" || options.station
        ? sec(
            adaylar.filter((product) => VARSAYILAN_ISTASYONLAR.includes(modelKodu(product.name))),
            title,
            31
          )
        : null);
    if (istasyon) return { name: kisaAd(istasyon.name), kind: "station", image: istasyon.images[0] };
  }
  if (!konu || konu.kind === "station") return null;

  const products = await prisma.product.findMany({
    where:
      konu.kind === "panel"
        ? { isActive: true, category: { name: "Güneş Panelleri" } }
        : {
            isActive: true,
            category: { name: "Endüstriyel Eldivenler" },
            // Tek kullanımlık kutular ve çoklu paketler değil, tek çift eldiven.
            NOT: [{ name: { startsWith: "TD" } }, { name: { contains: "ÇİFT" } }],
          },
    orderBy: { slug: "asc" },
    select: { name: true, images: true },
  });
  const adaylar = products.filter((product) => product.images[0]);
  if (adaylar.length === 0) return null;
  const secilen =
    adaylar.find((product) => modelDeseni(modelKodu(product.name)).test(title)) ?? sec(adaylar, title, 31);
  return { name: kisaAd(secilen.name), kind: konu.kind, image: secilen.images[0] };
}

async function referenceImage(url: string): Promise<{ mimeType: string; data: string }> {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Ürün görseli indirilemedi (${response.status}).`);
  // Gönderim boyutunu küçük tutmak için 1024 px JPEG; beyaz fon korunur.
  const data = await sharp(Buffer.from(await response.arrayBuffer()))
    .flatten({ background: "#ffffff" })
    .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
  return { mimeType: "image/jpeg", data: data.toString("base64") };
}

function productRules(product: CoverProduct | null): string[] {
  if (!product) {
    return [
      "Do not show any portable power station, battery box, power bank, generator, inverter, UPS or charger anywhere in the frame, not even in the background. Solar panels are fine.",
      "No electronic gadget is the subject. The image is about the setting and the people, not about a product.",
    ];
  }
  return [
    // Ürün adı yazılmıyor: model adı cihazın üzerine etiket olarak basıyor.
    "The attached image is the reference: a white-background, front-view product photo of our own product. It is a reference only; do not reuse its white background or studio framing.",
    `Show exactly this product in the scene, ${URUN_YERLESIM[product.kind]}. Keep the same shape, colour, materials, proportions and front panel layout (display, buttons, sockets, handles) as in the reference. Do not redesign, restyle or simplify it.`,
    "Place it naturally in the setting with matching light, shadows and perspective, as a clearly visible but secondary element: the place and the people still tell the story.",
    product.kind === "station"
      ? "This is the only power station in the image. No other power station, battery box, power bank, generator or inverter of any other design or brand anywhere in the frame."
      : "Show only this one product of its kind. No portable power station, battery box, power bank or generator anywhere in the frame.",
    "Do not invent or add any logos, labels or text on the product. Its original small front markings may stay, but keep the camera far enough that they are not readable.",
  ];
}

export function coverPrompt(
  { title, content, category, attempt, hint }: CoverRequest,
  product: CoverProduct | null = null
): string {
  const konu = `${category ?? ""} ${title}`;
  const sahneler = (KONU_SAHNE.find((item) => item.match.test(konu))?.scene ?? VARSAYILAN_SAHNE).split(/,\s*/);
  const ozet = plainText(content).slice(0, 700);
  const anahtar = `${title}#${attempt}`;
  const sahne = sec(sahneler, anahtar, 3);
  return [
    "Create a cover photo for a blog article (written in Turkish) published by an online store that sells portable power stations and solar panels.",
    `Article title (Turkish): "${title}"`,
    `Article summary (Turkish): "${ozet}"`,
    `Category: ${category ?? "Enerji"}. Setting: ${sahne} (or a close variation that fits the article better).`,
    "Show the real-life place and moment this article is about, so a reader instantly connects the image to the title.",
    `Subject: ${sec(KISILER, anahtar, 7)}; if people appear, they are ${sec(KOKENLER, anahtar, 17)}. Framing: ${sec(CEKIMLER, anahtar, 13)}. Time and weather: ${sec(MEVSIMLER, anahtar, 23)}.`,
    "The setting comes first. If the subject, framing or weather does not make sense in that setting, replace it with the closest option that naturally belongs there.",
    ...(/güneş paneli|solar panel|güneş enerjisi paneli/i.test(title)
      ? [
          "The article is about solar panels: show real full-size framed solar panels clearly and prominently, filling a large part of the frame, not tiny panels in the distance.",
        ]
      : []),
    ...(hint ? [`Specific direction for this cover, which overrides the setting, subject and framing above: ${hint}`] : []),
    ...productRules(product),
    "Avoid the cliché of someone sitting at a desk reading papers or looking at a laptop or phone. No paperwork in the frame.",
    "Style: photorealistic editorial photography, as if shot on a full-frame camera with a 35mm or 50mm lens. Natural skin texture, real materials and believable proportions. It must not look like CGI, a 3D render, an illustration or a stock-photo cliché. Soft depth of field, clean composition with some empty space.",
    "Lighting: always bright and clearly lit. Use clean daylight outdoors, or even neutral indoor light. The main subject must be easy to see, not lost in shadow.",
    "Do not make the scene gloomy, dark or pessimistic, even when the topic is a power cut. Show the calm moment of the situation in daylight instead of darkness.",
    "Colour: natural and neutral. Do not apply a yellow, amber, sepia, golden-hour or warm tungsten colour grade.",
    "People, places and vehicles should look contemporary and international, not tied to any specific country.",
    "The title and summary are context only: never write them, or any headline, caption, label or overlay, on the image. This is a plain photograph, not a blog banner or magazine cover.",
    "Do not include any text, letters, numbers, logos, flags, watermarks, licence plates or brand names. No charts, no UI screenshots, no collage.",
    "Keep shop signs, information boards and screens out of frame, or so blurred that nothing is legible. Vehicles are generic unbadged models with blank or hidden plates.",
    "No whiteboards, chalkboards, wall charts, diagrams, posters, books, manuals, packaging or labelled boxes. Appliances such as fridges, kettles and tools are plain and unbranded.",
  ].join("\n");
}

/** Nano Banana Pro (Gemini 3 Pro Image). `GEMINI_IMAGE_MODEL` ile değiştirilebilir. */
export const COVER_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image";

/** Çözünürlük seçeneği yalnızca Gemini 3 görsel modellerinde (Nano Banana Pro / 2) var. */
const IMAGE_SIZE_SUPPORTED = /^(gemini-3|nano-banana-pro)/.test(COVER_MODEL);

/**
 * Kapak görselini üretir. Konusu ürün kullanımı olan yazılarda mağazadaki
 * ürünün ana görseli referans olarak gönderilir (`product: null` ile kapatılır).
 */
export async function generateCover(
  request: CoverRequest,
  product?: CoverProduct | null
): Promise<Buffer> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Sunucuda GEMINI_API_KEY tanımlı değil.");

  const urun = product === undefined ? await coverProduct(request) : product;
  const parts: object[] = [];
  if (urun) parts.push({ inlineData: await referenceImage(urun.image) });
  parts.push({ text: coverPrompt(request, urun) });

  const body = JSON.stringify({
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: IMAGE_SIZE_SUPPORTED ? { aspectRatio: "16:9", imageSize: "2K" } : { aspectRatio: "16:9" },
    },
  });

  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${COVER_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body,
        // Pro modeli düşünerek üretiyor; tek görsel 1-2 dakika sürebilir.
        signal: AbortSignal.timeout(180_000),
      }
    );
    if (response.ok) {
      const data = await response.json();
      const parts: { inlineData?: { data?: string }; thought?: boolean }[] =
        data.candidates?.[0]?.content?.parts ?? [];
      // Düşünme aşamasındaki ara görseller değil, son görsel.
      const image = parts.filter((part) => part.inlineData?.data && !part.thought).at(-1);
      if (!image?.inlineData?.data) {
        const reason = data.candidates?.[0]?.finishReason ?? data.promptFeedback?.blockReason;
        throw new Error(`Görsel üretilemedi (${reason ?? "yanıt boş"}). Tekrar deneyin.`);
      }
      return Buffer.from(image.inlineData.data, "base64");
    }
    if ([400, 401, 402, 403].includes(response.status)) {
      const detail = await response.json().catch(() => null);
      const message: string | undefined = detail?.error?.message;
      throw new Error(
        response.status === 400 && message
          ? `Görsel servisi isteği reddetti: ${message}`
          : "Görsel servisi isteği kabul etmedi (API anahtarı veya kredi)."
      );
    }
    if (response.status === 429) {
      // Aylık harcama tavanı da 429 döner; beklemekle geçmez.
      const detail = await response.json().catch(() => null);
      if (/spend(ing)? cap|credits/i.test(detail?.error?.message ?? "")) {
        throw new Error("Görsel servisi: Gemini kredisi veya aylık harcama tavanı doldu (AI Studio).");
      }
    }
    const retry = response.status === 429 || response.status >= 500;
    if (!retry || attempt >= 3) {
      throw new Error(`Görsel servisi hata verdi (${response.status}). Tekrar deneyin.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000 * 2 ** attempt));
  }
}

/* ---- Yazı doğrulama ---- */

function text(value: unknown, field: string, max: number, required = false): string | null {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${field} zorunlu.`);
    return null;
  }
  if (typeof value !== "string") throw new Error(`${field} geçersiz.`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new Error(`${field} zorunlu.`);
  if (trimmed.length > max) throw new Error(`${field} en fazla ${max} karakter olabilir.`);
  return trimmed || null;
}

export function validatePost(raw: unknown): BlogPostInput {
  if (!raw || typeof raw !== "object") throw new Error("Geçersiz istek.");
  const body = raw as Record<string, unknown>;

  const slug = text(body.slug, "Adres (slug)", 120, true)!;
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error("Adres yalnızca küçük harf, rakam ve tire içerebilir.");
  }

  const status = (body.status ?? "DRAFT") as BlogStatus;
  if (!BLOG_STATUSES.includes(status)) throw new Error("Durum geçersiz.");

  const category = text(body.category, "Kategori", 80);
  if (status === "PUBLISHED" && !category) throw new Error("Yayınlamak için kategori seçin.");

  const content = typeof body.content === "string" ? body.content : "";
  if (content.length > 500_000) throw new Error("İçerik çok uzun.");
  if (status === "PUBLISHED" && !plainText(content)) throw new Error("Yayınlamak için içerik girin.");

  const featured = text(body.featuredImage, "Kapak görseli", 500);
  if (featured && !/^https?:\/\//i.test(featured)) throw new Error("Kapak görseli adresi geçersiz.");

  return {
    slug,
    title: text(body.title, "Başlık", 200, true)!,
    category,
    status,
    featuredImage: featured,
    content,
    excerpt: text(body.excerpt, "Kısa özet", 400),
    metaTitle: text(body.metaTitle, "SEO başlığı", 120),
    metaDescription: text(body.metaDescription, "SEO açıklaması", 300),
  };
}

/** Prisma benzersizlik hatasını okunur mesaja çevirir. */
export function blogDbError(error: unknown): Error {
  if (error && typeof error === "object" && (error as { code?: string }).code === "P2002") {
    return new Error("Bu adres (slug) başka bir yazıda kullanılıyor.");
  }
  return error instanceof Error ? error : new Error("Veritabanı hatası.");
}
