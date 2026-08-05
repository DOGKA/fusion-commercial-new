/**
 * Misafir favorilerinin stok durumu.
 *
 * Oturumlu kullanıcının listesi `Wishlist` tablosundan geldiği için stok her
 * istekte üründen taze okunuyor. Misafirin listesi ise `localStorage`'da
 * duruyor ve orada stok bilgisi yok; bu uç aradaki farkı kapatır, böylece
 * tükenmiş bir seçenek favoride durabilir ama sepete eklenemez.
 *
 * Yalnızca stok/aktiflik döndürür — fiyat gibi alanlar bilinçli olarak dışarıda:
 * misafir kartındaki fiyat favoriye eklendiği andaki fiyattır.
 */

import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

/** Tek istekte okunacak kalem sayısı; favori listesi bundan uzun olmuyor. */
const MAX_ITEMS = 200;

interface StatusRequestItem {
  productId?: string;
  bundleId?: string;
  variantId?: string;
}

interface StatusResponseItem {
  productId: string | null;
  bundleId: string | null;
  variantId: string | null;
  stock: number;
  isActive: boolean;
  requiresVariant: boolean;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const input: StatusRequestItem[] = Array.isArray(body.items) ? body.items : [];

    if (input.length === 0) {
      return NextResponse.json({ items: [] });
    }
    if (input.length > MAX_ITEMS) {
      return NextResponse.json({ error: "Çok fazla kalem" }, { status: 400 });
    }

    const productIds = [
      ...new Set(
        input
          .filter((item) => !item.bundleId && typeof item.productId === "string")
          .map((item) => item.productId as string)
      ),
    ];
    const bundleIds = [
      ...new Set(
        input
          .filter((item) => typeof item.bundleId === "string")
          .map((item) => item.bundleId as string)
      ),
    ];

    const [products, bundles] = await Promise.all([
      productIds.length > 0
        ? prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
              id: true,
              stock: true,
              isActive: true,
              variants: {
                where: { isActive: true },
                select: { id: true, stock: true },
              },
            },
          })
        : Promise.resolve([]),
      bundleIds.length > 0
        ? prisma.bundle.findMany({
            where: { id: { in: bundleIds } },
            select: {
              id: true,
              isActive: true,
              items: {
                select: { quantity: true, product: { select: { stock: true } } },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    const productMap = new Map(products.map((product) => [product.id, product]));
    const bundleMap = new Map(bundles.map((bundle) => [bundle.id, bundle]));

    const items: StatusResponseItem[] = input.map((item) => {
      if (item.bundleId) {
        const bundle = bundleMap.get(item.bundleId);
        // Paket stoğu, `lib/wishlist.ts` ile aynı kural: kalemler arasındaki
        // en düşük "kaç set çıkar" değeri.
        const stock =
          bundle && bundle.items.length > 0
            ? Math.min(
                ...bundle.items.map((bundleItem) =>
                  Math.floor(bundleItem.product.stock / bundleItem.quantity)
                )
              )
            : 0;
        return {
          productId: null,
          bundleId: item.bundleId,
          variantId: null,
          stock,
          isActive: bundle?.isActive ?? false,
          requiresVariant: false,
        };
      }

      const product = item.productId ? productMap.get(item.productId) : undefined;
      if (!product) {
        return {
          productId: item.productId ?? null,
          bundleId: null,
          variantId: item.variantId ?? null,
          stock: 0,
          isActive: false,
          requiresVariant: false,
        };
      }

      const variant = item.variantId
        ? product.variants.find((candidate) => candidate.id === item.variantId)
        : undefined;

      return {
        productId: product.id,
        bundleId: null,
        variantId: item.variantId ?? null,
        // Varyantlı favoride stok varyantın stoğu; ürün stoğu yanıltıcı olurdu.
        stock: item.variantId ? (variant?.stock ?? 0) : product.stock,
        isActive: product.isActive && (!item.variantId || variant != null),
        requiresVariant: product.variants.length > 0,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Wishlist status error:", error);
    return NextResponse.json(
      { error: "Stok durumu alınamadı" },
      { status: 500 }
    );
  }
}
