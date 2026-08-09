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

import { useCallback, useEffect, useRef, useState } from "react";

/** `/api/public/wishlist-status` tek istekte bu kadar kalem okuyor. */
const STOCK_BATCH_LIMIT = 200;

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
  /** Güncel stok; okunana kadar `undefined` — o hâlde "Tükendi" basılmaz. */
  stock?: number;
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
  /** Art arda gelen yüklemelerde geç dönen stok yanıtını yok saymak için. */
  const loadTicket = useRef(0);

  /**
   * Stok, sipariş kaleminden değil üründen okunur: kalem satın alma anını
   * taşıyor, aradan geçen sürede ürün tükenmiş olabilir. Misafir favorilerini
   * zenginleştiren uç kullanılıyor — varyantlı kalemde varyantın stoğunu
   * döndürdüğü için burada da doğru sonucu veriyor.
   */
  const loadStock = useCallback(async (list: ReorderProduct[], ticket: number) => {
    if (list.length === 0) return;

    try {
      const res = await fetch("/api/public/wishlist-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: list.slice(0, STOCK_BATCH_LIMIT).map((product) => ({
            productId: product.productId,
            variantId: product.variantInfo?.id,
          })),
        }),
      });
      if (!res.ok) return;

      const data = await res.json();
      const entries: { productId: string | null; variantId: string | null; stock: number }[] =
        Array.isArray(data.items) ? data.items : [];
      const byKey = new Map(
        entries.map((entry) => [
          `${entry.productId ?? ""}::${entry.variantId ?? ""}`,
          entry.stock,
        ])
      );

      if (ticket !== loadTicket.current) return;
      setProducts((current) =>
        current.map((product) => {
          const stock = byKey.get(
            `${product.productId}::${product.variantInfo?.id ?? ""}`
          );
          return stock === undefined ? product : { ...product, stock };
        })
      );
    } catch {
      // Stok okunamazsa kart rozetsiz kalır; tekrar al isteği zaten sunucuda
      // stok doğrulamasından geçiyor.
    }
  }, []);

  const load = useCallback(async () => {
    if (!enabled) return;

    const ticket = ++loadTicket.current;
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

      const list = [...byProduct.values()].sort((a, b) =>
        b.lastOrderedAt.localeCompare(a.lastOrderedAt)
      );
      setProducts(list);
      void loadStock(list, ticket);
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  }, [enabled, loadStock]);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  return { products, loading: enabled && loading, error, reload: load };
}
