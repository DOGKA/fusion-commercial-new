"use client";

/**
 * "Tekrar al" sekmesinin verisi.
 *
 * Yeni uç açılmadı: `GET /api/orders` teslim edilmiş ve iptal edilmiş
 * siparişlerin kalemlerini ürün bilgisiyle birlikte zaten döndürüyor. Burada
 * o kalemler ürün bazında tekilleştiriliyor.
 *
 * Fiyat bilinçli olarak GÖSTERİLMİYOR: sipariş kaleminin fiyatı satın alma
 * anındaki fiyattır, güncel fiyat değil. Güncel fiyat "Sepete ekle" sırasında
 * `useReorder` içinde üründen taze okunuyor.
 */

import { useCallback, useEffect, useState } from "react";

export interface ReorderProduct {
  /** Kalem kimliği — `useReorder` meşguliyet takibi için kullanıyor */
  id: string;
  productId: string;
  slug: string;
  title: string;
  brand: string;
  image: string | null;
  quantity: number;
  /** Satın alındığı andaki birim fiyat */
  purchasedPrice: number;
  variantInfo: { id?: string; name?: string; value?: string } | null;
  lastOrderedAt: string;
  orderNumber: string;
}

interface OrdersResponse {
  orders?: {
    orderNumber: string;
    status: string;
    deliveredAt: string | null;
    createdAt: string;
    items: {
      id: string;
      productId: string | null;
      quantity: number;
      price: number;
      variantInfo: { variant?: { id?: string; name?: string; value?: string } } | null;
      product: {
        id: string;
        name: string;
        slug: string;
        thumbnail: string | null;
        images: string[];
        brand: string | null;
        isActive: boolean;
      } | null;
    }[];
  }[];
}

export function useReorderProducts(enabled = true) {
  const [products, setProducts] = useState<ReorderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders?limit=50");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Geçmiş siparişleriniz alınamadı");
        return;
      }
      const data: OrdersResponse = await res.json();
      const orders = data.orders ?? [];

      // Ürün bazında tekilleştirme; en son alınan kayıt kazanır.
      const byProduct = new Map<string, ReorderProduct>();

      for (const order of orders) {
        if (order.status !== "DELIVERED" && order.status !== "CANCELLED") continue;
        const orderedAt = order.deliveredAt || order.createdAt;

        for (const item of order.items) {
          const product = item.product;
          // Katalogdan kalkmış ya da pasif ürün tekrar alınamaz.
          if (!product || !product.isActive) continue;

          const variant = item.variantInfo?.variant ?? null;
          const key = `${product.id}::${variant?.id ?? ""}`;
          const existing = byProduct.get(key);
          if (existing && existing.lastOrderedAt >= orderedAt) continue;

          byProduct.set(key, {
            id: item.id,
            productId: product.id,
            slug: product.slug,
            title: product.name,
            brand: product.brand || "",
            image: product.thumbnail || product.images[0] || null,
            quantity: item.quantity,
            purchasedPrice: item.price,
            variantInfo: variant,
            lastOrderedAt: orderedAt,
            orderNumber: order.orderNumber,
          });
        }
      }

      setProducts(
        [...byProduct.values()].sort((a, b) =>
          b.lastOrderedAt.localeCompare(a.lastOrderedAt)
        )
      );
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  return { products, loading: enabled && loading, error, reload: load };
}
