"use client";

import { useEffect } from "react";

/**
 * Sayfa kaydırma kilidi, dokuz ayrı bileşende `document.body.style.overflow`
 * doğrudan yazılarak yönetiliyordu ve her kapanış `""` atıyordu. İç içe açılan
 * panellerde (mobil menüden sepete geçmek gibi) içteki kapandığında dıştaki
 * hâlâ açık olsa bile kilit düşüyor, arka plan kaydırılabilir hale geliyordu.
 * Sayaç bunu tek noktadan çözüyor.
 */
let lockCount = 0;
let restoreOverflow = "";

/**
 * `html { scrollbar-gutter: stable }` kaydırma çubuğunun yerini kalıcı ayırdığı
 * için panel açıkken de duruyor. Sabit konumlu elemanların containing block'u o
 * şeridi dışladığından `inset-0` backdrop'lar pencere kenarına yetişemiyor ve
 * sağda karartılmamış ince bir şerit kalıyor.
 *
 * Koyu backdrop kullanan paneller (`rgba(0,0,0,0.45)`–`0.85`) şeridi fark
 * ettiriyor, `bg-background/70` kullananlar ise zeminle aynı tonda olduğu için
 * hiçbir şey yapılmaması gereken durumda. Bu yüzden ton çağrı yerinden geliyor;
 * "dark" olanlarda `html` zemini backdrop tonuna boyanıyor.
 */
type GutterTint = "surface" | "dark";

const DARK_GUTTER_CLASS = "scroll-lock-dark-gutter";
let darkTintCount = 0;

function lock(tint: GutterTint) {
  if (lockCount === 0) {
    restoreOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;

  if (tint === "dark") {
    darkTintCount += 1;
    if (darkTintCount === 1) {
      document.documentElement.classList.add(DARK_GUTTER_CLASS);
    }
  }
}

function unlock(tint: GutterTint) {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = restoreOverflow;
  }

  if (tint === "dark" && darkTintCount > 0) {
    darkTintCount -= 1;
    if (darkTintCount === 0) {
      document.documentElement.classList.remove(DARK_GUTTER_CLASS);
    }
  }
}

export function useBodyScrollLock(active: boolean, tint: GutterTint = "surface") {
  useEffect(() => {
    if (!active) return;
    lock(tint);
    return () => unlock(tint);
  }, [active, tint]);
}
