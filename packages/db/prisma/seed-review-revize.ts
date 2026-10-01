/**
 * FusionMarkt — Yorum Düzenleme (Fusionmarkt_Yorum_Duzenleme_Tablosu_Guncel.pdf)
 *
 * Yalnız onaylı (`isApproved`) yorumlara dokunur. Ürün/paket puanı ayrı bir
 * alanda tutulmuyor, yorumlardan hesaplanıyor; silme sonrası ortalama ve adet
 * kendiliğinden güncellenir.
 *
 * Güvenlik:
 *  - Varsayılan KURU ÇALIŞMA: hiçbir şey değişmez, yalnız plan yazdırılır.
 *  - `--apply` ile tek transaction içinde uygulanır.
 *  - Ürün adı eşleşmesi tek değilse, mevcut yorum adedi tablodan farklıysa,
 *    silinecek yorum metni bulunamazsa ya da sonuç hedefle uyuşmazsa betik
 *    hiçbir şey yazmadan durur.
 *
 * Kullanım:
 *   cd packages/db && npx tsx prisma/seed-review-revize.ts           # kuru çalışma
 *   cd packages/db && npx tsx prisma/seed-review-revize.ts --apply   # uygula
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

interface DeleteByText {
  text: string;
  /** Verilirse yorumun puanı da tutmalı. */
  rating?: number;
}

interface Target {
  label: string;
  /** Aynı kod paket adlarında da geçtiği için aranacak kayıt türü. */
  kind: "product" | "bundle";
  /** Sırayla denenir; ilk "tam bir eşleşme" veren desen kullanılır. */
  patterns: RegExp[];
  before: { count: number; avg: number };
  after: { count: number; avg?: number };
  deleteTexts?: DeleteByText[];
  /** Bu puandaki yorumların hepsi silinir; adet `expected` olmalı. */
  deleteRating?: { rating: number; expected: number };
  /** Yorum ve başlıklardaki cümle arası virgülleri kaldır. */
  stripCommas?: boolean;
}

const TARGETS: Target[] = [
  {
    label: "P1800 Full",
    kind: "product",
    patterns: [/P\s*-?\s*1800.*full/i, /\bP\s*-?\s*1800\b/i],
    before: { count: 18, avg: 4.9 },
    after: { count: 18, avg: 4.9 },
    stripCommas: true,
  },
  {
    label: "Solar Elite",
    kind: "bundle",
    patterns: [/solar\s*elite/i],
    before: { count: 12, avg: 4.8 },
    after: { count: 10 },
    deleteTexts: [
      { text: "fiyatı düşündürdü ama kalitesi belli, pişman değiliz" },
      { text: "kaliteli set, kargo sağlam geldi" },
    ],
  },
  {
    label: "Solar Usta",
    kind: "bundle",
    patterns: [/solar\s*usta/i],
    before: { count: 5, avg: 4.8 },
    after: { count: 4, avg: 5.0 },
    deleteTexts: [{ text: "memnunum, sorunsuz set", rating: 4 }],
  },
  {
    label: "Solar Operatör",
    kind: "bundle",
    patterns: [/solar\s*operat[öo]r/i],
    before: { count: 11, avg: 4.8 },
    after: { count: 9, avg: 5.0 },
    deleteTexts: [
      {
        text: "set olarak güzel düşünülmüş. yoğun kullanımda panelin dolumu yetişmeyebiliyor, biz bir panel daha ekledik sorun çözüldü. onun dışında dört dörtlük",
      },
      { text: "iyi set, tavsiye ederim" },
    ],
  },
  {
    label: "Solar Performans",
    kind: "bundle",
    patterns: [/solar\s*performans/i],
    before: { count: 5, avg: 4.8 },
    after: { count: 3 },
    deleteTexts: [
      { text: "güzel paket" },
      {
        text: "karavan için aldık, singo nun gücü panelin desteğiyle tam olmuş. uzun yolculuklarda rahatız",
      },
    ],
  },
  {
    label: "SP200",
    kind: "product",
    patterns: [/\bSP\s*-?\s*200\b/i],
    before: { count: 13, avg: 4.8 },
    after: { count: 11, avg: 5.0 },
    deleteRating: { rating: 4, expected: 2 },
  },
  {
    label: "SP400",
    kind: "product",
    patterns: [/\bSP\s*-?\s*400\b/i],
    before: { count: 13, avg: 4.8 },
    after: { count: 12 },
    deleteTexts: [
      {
        text: "panel gayet iyi çalışıyor, verimden memnunum. taşıma kılıfı biraz daha kaliteli olabilirdi, fermuarı naif geldi bana. dikkatli kullanınca sorun yok",
        rating: 4,
      },
    ],
  },
  {
    label: "10.24kWh",
    kind: "bundle",
    patterns: [/10[.,]\s*24\s*kwh/i],
    before: { count: 5, avg: 4.8 },
    after: { count: 4, avg: 5.0 },
    deleteRating: { rating: 4, expected: 1 },
  },
  {
    label: "B5120",
    kind: "product",
    patterns: [/^\s*B\s*-?\s*5120\b/i],
    before: { count: 5, avg: 4.8 },
    after: { count: 4, avg: 5.0 },
    deleteTexts: [{ text: "beklediğim gibi, sorunsuz çalışıyor" }],
  },
  {
    label: "SH4000",
    kind: "product",
    patterns: [/^\s*SH\s*-?\s*4000\b/i],
    before: { count: 6, avg: 4.8 },
    after: { count: 5, avg: 5.0 },
    deleteTexts: [{ text: "cihaz sağlam, gücü fazlasıyla yeterli" }],
  },
  {
    label: "Singo2000Pro",
    kind: "product",
    patterns: [/singo\s*-?\s*2000\s*pro/i],
    before: { count: 15, avg: 4.8 },
    after: { count: 14 },
    deleteTexts: [
      {
        text: "Ürün gayet güçlü ve kaliteli. Yalnız yük artınca fan devreye giriyor ve sesi belirgin, kapalı alanda fark ediliyor. Onun dışında bir eksiği yok.",
      },
    ],
  },
  {
    label: "Solar Veteran",
    kind: "bundle",
    patterns: [/solar\s*veteran/i],
    before: { count: 11, avg: 4.8 },
    after: { count: 10 },
    deleteTexts: [{ text: "güzel paket, sorunsuz", rating: 4 }],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

/** Büyük/küçük harf, noktalama ve tırnak farklarını yok sayar. */
function normalize(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sayı içindeki virgüle ("1,5 saat") dokunmadan cümle arası virgülleri kaldırır. */
function stripCommas(value: string): string {
  return value
    .replace(/(?<!\d),|,(?!\d)/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([.!?])/g, "$1")
    .trim();
}

const avg = (ratings: number[]) =>
  ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : 0;
const round1 = (v: number) => Math.round(v * 10) / 10;

interface Item {
  kind: "product" | "bundle";
  id: string;
  name: string;
}

interface Plan {
  target: Target;
  item: Item;
  deleteIds: string[];
  commaUpdates: { id: string; comment: string; title: string | null }[];
}

async function loadItems(): Promise<Item[]> {
  const [products, bundles] = await Promise.all([
    prisma.product.findMany({
      where: { reviews: { some: { isApproved: true } } },
      select: { id: true, name: true },
    }),
    prisma.bundle.findMany({
      where: { reviews: { some: { isApproved: true } } },
      select: { id: true, name: true },
    }),
  ]);
  return [
    ...products.map((p) => ({ kind: "product" as const, id: p.id, name: p.name })),
    ...bundles.map((b) => ({ kind: "bundle" as const, id: b.id, name: b.name })),
  ];
}

function resolveItem(target: Target, items: Item[]): Item {
  for (const pattern of target.patterns) {
    const matches = items.filter((item) => item.kind === target.kind && pattern.test(item.name));
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      throw new Error(
        `${target.label}: "${pattern}" birden fazla kayıtla eşleşti → ${matches.map((m) => m.name).join(" | ")}`
      );
    }
  }
  throw new Error(`${target.label}: yorumlu ürün/paket bulunamadı`);
}

async function buildPlan(target: Target, items: Item[]): Promise<Plan> {
  const item = resolveItem(target, items);
  const reviews = await prisma.review.findMany({
    where: {
      isApproved: true,
      ...(item.kind === "product" ? { productId: item.id } : { bundleId: item.id }),
    },
    select: { id: true, rating: true, comment: true, title: true },
  });

  const problems: string[] = [];

  const beforeAvg = round1(avg(reviews.map((r) => r.rating)));
  if (reviews.length !== target.before.count) {
    problems.push(`mevcut yorum ${reviews.length}, tabloda ${target.before.count}`);
  }
  if (beforeAvg !== target.before.avg) {
    console.warn(`  ! ${target.label}: mevcut ortalama ${beforeAvg}, tabloda ${target.before.avg}`);
  }

  const deleteIds = new Set<string>();

  for (const del of target.deleteTexts ?? []) {
    const wanted = normalize(del.text);
    const hits = reviews.filter(
      (r) => normalize(r.comment) === wanted && (del.rating === undefined || r.rating === del.rating)
    );
    if (hits.length !== 1) {
      problems.push(`"${del.text}" için ${hits.length} eşleşme (1 bekleniyor)`);
      continue;
    }
    deleteIds.add(hits[0].id);
  }

  if (target.deleteRating) {
    const hits = reviews.filter((r) => r.rating === target.deleteRating!.rating);
    if (hits.length !== target.deleteRating.expected) {
      problems.push(
        `${target.deleteRating.rating} puanlı ${hits.length} yorum var, ${target.deleteRating.expected} bekleniyor`
      );
    }
    hits.forEach((r) => deleteIds.add(r.id));
  }

  const remaining = reviews.filter((r) => !deleteIds.has(r.id));
  const afterAvg = round1(avg(remaining.map((r) => r.rating)));
  if (remaining.length !== target.after.count) {
    problems.push(`sonuç ${remaining.length} yorum, hedef ${target.after.count}`);
  }
  if (target.after.avg !== undefined && afterAvg !== target.after.avg) {
    problems.push(`sonuç ortalama ${afterAvg}, hedef ${target.after.avg}`);
  }

  const commaUpdates: Plan["commaUpdates"] = [];
  if (target.stripCommas) {
    for (const r of remaining) {
      const comment = stripCommas(r.comment);
      const title = r.title ? stripCommas(r.title) : r.title;
      if (comment !== r.comment || title !== r.title) {
        commaUpdates.push({ id: r.id, comment, title });
      }
    }
  }

  console.log(`\n■ ${target.label} → ${item.kind} "${item.name}"`);
  console.log(`  önce: ${reviews.length} yorum / ${beforeAvg}   sonra: ${remaining.length} yorum / ${afterAvg}`);
  for (const r of reviews.filter((r) => deleteIds.has(r.id))) {
    console.log(`  - SİL (${r.rating}★) ${r.comment}`);
  }
  for (const u of commaUpdates) {
    console.log(`  ~ VİRGÜL ${u.comment}`);
  }
  for (const p of problems) console.log(`  ✗ ${p}`);

  if (problems.length) {
    // Teşhis için eşleşmeyen metinleri görmek gerekebilir.
    if (target.deleteTexts?.length) {
      console.log("  mevcut yorumlar:");
      for (const r of reviews) console.log(`    (${r.rating}★) ${r.comment}`);
    }
    throw new Error(`${target.label}: ${problems.length} sorun`);
  }

  return { target, item, deleteIds: [...deleteIds], commaUpdates };
}

async function main() {
  console.log(APPLY ? "UYGULAMA MODU" : "KURU ÇALIŞMA (değişiklik yok, uygulamak için --apply)");

  const items = await loadItems();
  const plans: Plan[] = [];
  const errors: string[] = [];

  for (const target of TARGETS) {
    try {
      plans.push(await buildPlan(target, items));
    } catch (error) {
      errors.push((error as Error).message);
    }
  }

  const totalDeletes = plans.reduce((s, p) => s + p.deleteIds.length, 0);
  const totalUpdates = plans.reduce((s, p) => s + p.commaUpdates.length, 0);
  console.log(`\nÖzet: ${totalDeletes} yorum silinecek, ${totalUpdates} yorumda virgül düzeltilecek.`);

  if (errors.length) {
    console.error(`\n${errors.length} hedefte sorun var, hiçbir şey yazılmadı:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }

  if (!APPLY) return;

  await prisma.$transaction(async (tx) => {
    for (const plan of plans) {
      if (plan.deleteIds.length) {
        const res = await tx.review.deleteMany({ where: { id: { in: plan.deleteIds } } });
        if (res.count !== plan.deleteIds.length) {
          throw new Error(`${plan.target.label}: ${res.count}/${plan.deleteIds.length} silindi, geri alınıyor`);
        }
      }
      for (const u of plan.commaUpdates) {
        await tx.review.update({ where: { id: u.id }, data: { comment: u.comment, title: u.title } });
      }
    }
  });

  console.log("\n✓ Uygulandı.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
