import { prisma } from "@/lib/prisma";

/**
 * Anasayfa kategori vitrini kartlarındaki fiyatları canlı ürün/bundle
 * fiyatlarıyla günceller.
 *
 * Kartın `link` alanı `/urun/<slug>` formatındadır; slug üzerinden önce
 * Product, yoksa Bundle bulunur ve `price` (müşterinin ödeyeceği güncel
 * fiyat) karta yazılır. Eşleşme bulunamazsa admin panelde girilmiş fiyat
 * olduğu gibi kalır.
 */

type ShowcaseProductLike = {
  price: string | null;
  link: string | null;
};

function slugFromLink(link: string | null): string | null {
  if (!link) return null;
  const slug = link.split("/urun/")[1]?.split(/[?#]/)[0]?.replace(/\/+$/, "");
  return slug || null;
}

export async function applyLiveShowcasePrices<T extends ShowcaseProductLike>(
  sections: { products: T[] }[]
): Promise<void> {
  const slugs = new Set<string>();
  for (const section of sections) {
    for (const product of section.products) {
      const slug = slugFromLink(product.link);
      if (slug) slugs.add(slug);
    }
  }
  if (slugs.size === 0) return;

  const slugList = [...slugs];
  const [products, bundles] = await Promise.all([
    prisma.product.findMany({
      where: { slug: { in: slugList }, isActive: true },
      select: { slug: true, price: true },
    }),
    prisma.bundle.findMany({
      where: { slug: { in: slugList }, isActive: true },
      select: { slug: true, price: true },
    }),
  ]);

  const priceBySlug = new Map<string, number>();
  // Ürün sayfası slug çözümünde Product öncelikli olduğu için bundle'lar
  // önce yazılır, aynı slug'lı product varsa üzerine yazar.
  for (const bundle of bundles) priceBySlug.set(bundle.slug, Number(bundle.price));
  for (const product of products) priceBySlug.set(product.slug, Number(product.price));

  for (const section of sections) {
    for (const product of section.products) {
      const slug = slugFromLink(product.link);
      const livePrice = slug ? priceBySlug.get(slug) : undefined;
      if (livePrice != null && Number.isFinite(livePrice)) {
        product.price = livePrice.toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
    }
  }
}
