import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@repo/db";

/**
 * Header ve MobileMenu'deki "Kategoriler" açılır listesi.
 *
 * Bu liste eskiden iki bileşene ayrı ayrı gömülüydü; admin panelden eklenen
 * kategori menüye hiçbir şekilde yansımıyordu. Artık `showInMenu` işaretli
 * kayıtlar sunucuda okunup prop olarak geçiliyor.
 *
 * `cookie-banner-settings` ile aynı `unstable_cache` kalıbı. Etiket bilinçli
 * olarak "categories": `/api/revalidate` bu etiketi zaten kabul ediyordu ama
 * hiçbir sorgu onunla işaretli olmadığı için etkisizdi; admin kategori
 * kaydettiğinde menü bu sayede anında tazeleniyor.
 */
export interface MenuCategory {
  name: string;
  href: string;
}

export const getMenuCategories = unstable_cache(
  async (): Promise<MenuCategory[]> => {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true, showInMenu: true },
        select: { name: true, slug: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      });

      return categories.map((c) => ({
        name: c.name,
        href: `/kategori/${c.slug}`,
      }));
    } catch {
      // Veritabanı erişilemezse menü kategorisiz render edilir; sayfanın geri
      // kalanının çökmemesi tek bir açılır listeden daha önemli.
      return [];
    }
  },
  ["menu-categories"],
  { revalidate: 300, tags: ["categories"] }
);
