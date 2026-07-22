/**
 * Mağaza sayfası - Server Component
 *
 * Veri (banner, kategori, ürün, bundle, featured, bestseller, kargo limiti)
 * SSR sırasında Prisma'dan direkt çekilir ve StorePageClient'a prop olarak
 * geçirilir. Böylece sayfa ilk boyamada içerikle gelir:
 * - CLS: skeleton -> içerik geçişi olmaz (layout shift ortadan kalkar)
 * - LCP: ürün görselleri HTML'de hazır olduğu için tarayıcı hemen indirmeye başlar
 *
 * Sayfa 60 saniyede bir yeniden oluşturulur (ISR) - public API'lerin
 * s-maxage=60 cache süresiyle aynı tazelik.
 */

import StorePageClient, { type StoreInitialData } from "./StorePageClient";
import {
  getStoreBanners,
  getStoreCategories,
  getStoreProducts,
  getStoreBundles,
  getFreeShippingThreshold,
} from "@/server/store-data";

export const revalidate = 60;

export default async function StorePage() {
  const [banners, categories, products, bundles, featured, bestseller, freeShippingThreshold] =
    await Promise.all([
      getStoreBanners(),
      getStoreCategories(),
      getStoreProducts({ limit: 100 }),
      getStoreBundles(100),
      getStoreProducts({ featured: true, limit: 12 }),
      getStoreProducts({ bestseller: true, inStock: true, limit: 6 }),
      getFreeShippingThreshold(),
    ]);

  const initialData = {
    banners,
    categories,
    products,
    bundles,
    featured,
    bestseller,
    freeShippingThreshold,
  } as StoreInitialData;

  return <StorePageClient initialData={initialData} />;
}
