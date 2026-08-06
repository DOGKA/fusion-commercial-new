/**
 * Marka sayfasında listelenecek ürünler.
 *
 * Marka sayfaları bugüne kadar yalnızca üretici hikâyesini anlatıyordu; hangi
 * ürünlerin o markaya ait olduğu sayfada hiç geçmiyordu. "IEETek Türkiye'de
 * hangi modelleri satıyor" gibi sorularda alıntılanacak sayfa burası olduğu
 * için liste sunucuda üretiliyor.
 */

import { prisma } from "@/lib/prisma";
import type { Partner } from "@/lib/partners-data";

export interface BrandProduct {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  sku: string | null;
  thumbnail: string | null;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  inStock: boolean;
}

export async function getBrandProducts(partner: Partner): Promise<BrandProduct[]> {
  const keys = partner.productMatch?.length ? partner.productMatch : [partner.name];

  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: keys.flatMap((key) => [
        { brand: { contains: key, mode: "insensitive" as const } },
        { name: { contains: key, mode: "insensitive" as const } },
      ]),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      sku: true,
      thumbnail: true,
      shortDescription: true,
      price: true,
      comparePrice: true,
      stock: true,
      variants: {
        where: { isActive: true },
        select: { stock: true },
      },
    },
    orderBy: [{ price: "desc" }],
  });

  return rows.map((row) => {
    const variantStock = row.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const stock = row.variants.length > 0 ? variantStock : row.stock;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      brand: row.brand,
      sku: row.sku,
      thumbnail: row.thumbnail,
      shortDescription: row.shortDescription,
      price: Number(row.price),
      comparePrice: row.comparePrice != null ? Number(row.comparePrice) : null,
      inStock: stock > 0,
    };
  });
}
