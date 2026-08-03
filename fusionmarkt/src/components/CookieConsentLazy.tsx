"use client";

import dynamic from "next/dynamic";

/**
 * Çerez bandının kritik yoldan çıkarılması.
 *
 * Bu sarmalayıcı ZORUNLU: `ssr: false` yalnızca istemci bileşeninde geçerli,
 * kök layout ise sunucu bileşeni. Layout'ta `dynamic()` çağırmak yetmiyordu —
 * SSR açık kaldığı için Next, hidrasyon uğruna framer-motion chunk'ını (~115 KB
 * ham) ilk script setine geri koyuyordu; ölçüldü, /magaza ve /checkout HTML'inde
 * `<script src=".../8705-*.js">` olarak duruyordu.
 *
 * SSR'ı kapatmanın görünür bir bedeli yok: bileşen banner ayarını mount sonrası
 * /api/public/settings'ten çekiyor, yani sunucuda hiçbir zaman bir şey basmıyor.
 */
const CookieConsent = dynamic(() => import("./CookieConsent"), { ssr: false });

export default function CookieConsentLazy() {
  return <CookieConsent />;
}
