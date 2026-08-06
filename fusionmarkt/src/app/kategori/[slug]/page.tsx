/**
 * Kategori sayfası — sunucu kabuğu.
 *
 * Ürün listesi BURADA çekiliyor, istemcide değil. Eskiden sayfanın tamamı
 * `"use client"` idi ve liste `useEffect` ile geliyordu; sunucunun ürettiği
 * HTML'de tek bir ürün adı yoktu. Arama motorları ikinci tarama dalgasında
 * JavaScript'i çalıştırıp listeyi görebiliyor, ama LLM tarayıcıları (GPTBot,
 * PerplexityBot, ClaudeBot) sayfayı boş görüyordu.
 *
 * Etkileşim (filtre, sıralama, sayfalama) hâlâ istemcide; sunucu yalnızca ilk
 * listeyi hazırlıyor.
 */

import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo";
import { generateItemListSchema } from "@/lib/seo";
import { getCategoryWithProducts } from "@/lib/category-products";
import { prisma } from "@/lib/prisma";
import CategoryPageClient, {
  type CategoryInitialData,
} from "./_components/CategoryPageClient";

/** Fiyat ve stok değiştiği için liste 5 dakikada bir tazeleniyor. */
export const revalidate = 300;

/**
 * Slug listesi olmadan Next dinamik segmenti her istekte baştan render ediyor
 * ve `revalidate` hiç devreye girmiyordu; kategori sayfası veritabanına ziyaret
 * başına bir kez gidiyordu. Slug'lar burada sayılınca sayfa ISR'ye geçiyor.
 *
 * Listede olmayan bir slug (ör. sonradan açılan kategori veya paket sayfası)
 * ilk istekte üretilip önbelleğe alınıyor; `dynamicParams` varsayılan olarak
 * açık, o yüzden ayrıca ele almaya gerek yok.
 */
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  return categories.map(({ slug }) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ListedProduct {
  name?: string;
  slug?: string;
  sku?: string | null;
  brand?: string | null;
  thumbnail?: string | null;
  shortDescription?: string | null;
  price?: number | string | null;
  stock?: number | null;
  isBundle?: boolean;
}

/**
 * URL'deki `sort` bilerek okunmuyor: `searchParams`e dokunan bir sayfa dinamik
 * render'a düşer, `revalidate` devre dışı kalır ve her ziyaret veritabanına
 * gider. Varsayılan sıralamayla üretilen HTML önbelleğe alınabildiği için
 * ziyaretçilerin büyük çoğunluğu sayfayı hazır alıyor; sıralama içeren bir
 * bağlantıyla gelen kullanıcı için istemci mount'tan sonra listeyi kendisi
 * tazeliyor (bkz. CategoryPageClient).
 */
export default async function KategoriPage({ params }: PageProps) {
  const { slug } = await params;
  const sort = "newest" as const;

  /**
   * İstemcinin bugünkü isteğiyle aynı: tek seferde 200 kayıt. Filtreleme
   * istemcide tüm liste üzerinde yapılıyor, daha küçük bir sayfa gönderirsek
   * filtreler eksik sonuç verirdi.
   */
  const result = await getCategoryWithProducts(slug, { page: 1, limit: 200, sort });

  if (!result.ok) {
    notFound();
  }

  const data = result.data as {
    category: CategoryInitialData["category"];
    products: ListedProduct[];
    pagination: CategoryInitialData["pagination"];
    isBundle?: boolean;
  };

  /**
   * Prisma nesneleri (Decimal, Date) istemci prop'u olarak geçemez; JSON
   * turundan geçirmek API ucunun döndürdüğü şeklin birebir aynısını üretiyor.
   */
  const initialData: CategoryInitialData = JSON.parse(
    JSON.stringify({
      category: data.category,
      products: data.products,
      pagination: data.pagination,
      isBundle: Boolean(data.isBundle),
      sort,
    })
  );

  const listSchema = generateItemListSchema({
    name: initialData.category?.name
      ? `${initialData.category.name} — FusionMarkt`
      : "FusionMarkt Ürünleri",
    description: initialData.category?.description ?? undefined,
    url: `/kategori/${slug}`,
    items: initialData.products.slice(0, 60).map((product: ListedProduct) => ({
      name: String(product.name ?? ""),
      url: `/urun/${product.slug}`,
      image: product.thumbnail ?? undefined,
      price: product.price != null ? Number(product.price) : undefined,
      brand: product.brand ?? undefined,
      sku: product.sku ?? undefined,
      inStock: typeof product.stock === "number" ? product.stock > 0 : undefined,
      description: product.shortDescription ?? undefined,
    })),
  });

  return (
    <>
      <JsonLd data={listSchema} />
      <CategoryPageClient initialData={initialData} />
    </>
  );
}
