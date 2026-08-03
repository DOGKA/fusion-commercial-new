"use client";

/**
 * Ürün sayfası sekmelerini URL'den açar: `/urun/{slug}?tab=yorumlar`.
 *
 * NEDEN GEREKLİ — iki yer bugüne kadar boşa çalışıyordu:
 *  1. Değerlendirme hatırlatma e-postası `/urun/{slug}#yorumlar` diyor ama o
 *     çapa hiç yoktu; bağlantı kullanıcıyı sayfanın tepesine, "Açıklama"
 *     sekmesine bırakıyordu (ertelenenler sicili F2-62).
 *  2. Sipariş detayındaki "Değerlendir" akışının ürün sayfasına düşürebileceği
 *     bir kapı yoktu.
 *
 * `useSearchParams` YERİNE `window.location` okunuyor. İki sebep: (a) hook
 * yalnızca ilk binişte bir kez çalışsın istiyoruz — kullanıcı elle sekme
 * değiştirdikten sonra URL'i tekrar okuyup onu geri zorlamak istemiyoruz;
 * (b) `useSearchParams` bileşeni Suspense sınırı gerektiren dinamik okumaya
 * sokuyor, bu iki görünüm de ürün sayfasının tamamını kaplayan büyük ağaçlar.
 *
 * Eski `#yorumlar` biçimi de destekleniyor: o bağlantı zaten gönderilmiş
 * e-postaların içinde duruyor ve çalışmaya başlaması gerekiyor.
 */

import { useEffect, useRef } from "react";

export const REVIEWS_TAB = "Yorumlar";

/** URL'deki değer → sekme adı. Sekme adları Türkçe ve boşluklu, URL'de olmaz. */
const TAB_BY_PARAM: Record<string, string> = {
  yorumlar: REVIEWS_TAB,
  aciklama: "Açıklama",
  ozellikler: "Teknik Özellikler",
};

function requestedTab(): string | null {
  if (typeof window === "undefined") return null;

  const param = new URLSearchParams(window.location.search).get("tab");
  if (param && TAB_BY_PARAM[param.toLowerCase()]) {
    return TAB_BY_PARAM[param.toLowerCase()];
  }

  const hash = window.location.hash.replace("#", "").toLowerCase();
  return hash && TAB_BY_PARAM[hash] ? TAB_BY_PARAM[hash] : null;
}

/**
 * @param onTab      İstenen sekmeyi uygular.
 * @param anchor     Sekme şeridinin kabı; kaydırma hedefi.
 * @param ready      Ürün verisi geldi mi. Veri gelmeden kaydırmak, sonradan
 *                   büyüyen sayfada yanlış noktaya götürür.
 * @param availableTabs Görünümün gerçekten çizdiği sekmeler. Paket görünümünde
 *                   "Teknik Özellikler" yok; listede olmayan bir sekmeyi
 *                   zorlamak içerik alanını boş bırakır.
 */
export function useProductTabDeepLink(
  onTab: (tab: string) => void,
  anchor: React.RefObject<HTMLElement | null>,
  ready: boolean,
  availableTabs: readonly string[]
) {
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current || !ready) return;

    const tab = requestedTab();
    if (!tab || !availableTabs.includes(tab)) {
      // Bağlantıda geçerli bir sekme yoksa bir daha bakmaya gerek yok.
      applied.current = true;
      return;
    }

    applied.current = true;
    onTab(tab);

    // Sekme içeriğinin boyanmasını bekle; aksi halde kaydırma eski yükseklikle
    // hesaplanıp hedefin üstünde kalıyor.
    const timer = window.setTimeout(() => {
      anchor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [onTab, anchor, ready, availableTabs]);
}
