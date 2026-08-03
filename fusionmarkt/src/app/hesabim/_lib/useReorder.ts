"use client";

/**
 * "Tekrar al" — daha önce alınmış bir kalemi yeniden sepete atar (plan 03 §5.3).
 *
 * NEDEN SİPARİŞ VERİSİ DOĞRUDAN SEPETE YAZILAMIYOR: `CartItem` güncel `price`,
 * `brand` ve stok durumu ister; sipariş kalemi ise satın alma anındaki fiyatı
 * taşır. Sipariş fiyatıyla sepete eklemek, aradan geçen zamanda fiyat
 * değiştiyse müşteriye ödeme adımında sürpriz yapar. Bu yüzden her kalem için
 * ürünün GÜNCEL hali çekilip doğrulanıyor.
 *
 * Sunucu tarafı toplu uç (`POST /reorder`) plan 03 §7.B/A5'te duruyor; tek
 * kalemde istemci doğrulaması yeterli olduğu için o uç açılmadı.
 *
 * Konum notu: sipariş detayının yanında Favorilerim'in "Tekrar al" sekmesi de
 * bu kancayı kullanıyor, bu yüzden `siparisler/_lib` altından buraya taşındı.
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "./format";

interface CurrentProduct {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  price: number;
  stock?: number | null;
  thumbnail?: string | null;
  images?: string[];
  isActive?: boolean;
  productType?: string;
  variants?: { id: string; name?: string; type?: string; value?: string; stock?: number | null }[];
}

/**
 * Kancanın ihtiyaç duyduğu asgari kalem şekli. `OrderDetailItem` bu şekli
 * yapısal olarak karşılıyor; Favorilerim de aynı şekli kendi verisinden üretiyor.
 */
export interface ReorderInput {
  id: string;
  quantity: number;
  price: number;
  variantInfo: { id?: string; name?: string; value?: string } | null;
  product: { slug: string } | null;
}

export function useReorder() {
  const { addItem, openCart } = useCart();
  const router = useRouter();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const reorder = useCallback(
    async (item: ReorderInput) => {
      const slug = item.product?.slug;
      if (!slug) {
        toast.error("Bu ürün artık satışta değil.");
        return;
      }

      setBusyItemId(item.id);
      try {
        const res = await fetch(`/api/public/products/${slug}`);
        if (!res.ok) {
          toast.error("Bu ürün artık satışta değil.");
          return;
        }
        const product: CurrentProduct = await res.json();

        if (product.isActive === false) {
          toast.error("Bu ürün artık satışta değil.");
          return;
        }

        // Varyantlı üründe stok varyantta durur; kalemin varyantı bulunmalı.
        const orderedVariantId = item.variantInfo?.id;
        const variant = orderedVariantId
          ? product.variants?.find((v) => v.id === orderedVariantId)
          : undefined;

        if (orderedVariantId && !variant) {
          // Varyant kaldırılmış: sepete yanlış seçenekle eklemek yerine
          // kullanıcıyı seçim yapabileceği yere gönderiyoruz.
          toast("Ürün seçeneklerini güncellemeniz gerekiyor.");
          router.push(`/urun/${slug}`);
          return;
        }

        const availableStock = variant ? variant.stock : product.stock;
        if (typeof availableStock === "number" && availableStock < 1) {
          toast.error("Ürün stokta yok.");
          return;
        }

        // Stok sipariş adedinden azsa eldeki kadarını ekliyoruz; hiç eklememek
        // müşteriyi tamamen boş bırakırdı.
        const quantity =
          typeof availableStock === "number"
            ? Math.min(item.quantity, availableStock)
            : item.quantity;

        await addItem({
          productId: product.id,
          slug: product.slug,
          title: product.name,
          brand: product.brand || "",
          price: product.price,
          image: product.thumbnail || product.images?.[0] || undefined,
          quantity,
          ...(variant
            ? {
                variant: {
                  id: variant.id,
                  name: variant.name || item.variantInfo?.name || "",
                  type: variant.type || "",
                  value: variant.value || item.variantInfo?.value || "",
                },
              }
            : {}),
        });

        if (product.price !== item.price) {
          toast(`Fiyat güncellendi: ${formatPrice(product.price)}`);
        }
        if (quantity < item.quantity) {
          toast(`Stok yeterli değil, ${quantity} adet eklendi.`);
        }
        toast.success("Ürün sepete eklendi.");
        openCart();
      } catch {
        toast.error("Ürün sepete eklenemedi. Lütfen tekrar deneyiniz.");
      } finally {
        setBusyItemId(null);
      }
    },
    [addItem, openCart, router]
  );

  return { reorder, busyItemId };
}
