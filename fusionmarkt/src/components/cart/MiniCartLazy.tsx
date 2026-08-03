"use client";

import dynamic from "next/dynamic";
import { useCart } from "@/context/CartContext";

/**
 * Sepet çekmecesi ilk açılışa kadar indirilmiyor.
 *
 * MiniCart 585 satır ve kök layout'ta koşulsuz render ediliyordu, ama içinde
 * `if (!isOpen) return null` var: yani her rotada inip ayrıştırılıyor, karşılığında
 * ne sunucu HTML'ine ne ekrana bir şey koyuyordu. `ssr: false` bu yüzden çıktıyı
 * değiştirmiyor.
 *
 * Kapanışta sökülmesi davranışı değiştirmiyor: çekmecenin çıkış animasyonu yok
 * (kapalıyken zaten null dönüyordu) ve gövde scroll kilidini effect temizliği
 * geri alıyor.
 */
const MiniCart = dynamic(() => import("./MiniCart"), { ssr: false });

export default function MiniCartLazy() {
  const { isOpen } = useCart();

  if (!isOpen) return null;

  return <MiniCart />;
}
