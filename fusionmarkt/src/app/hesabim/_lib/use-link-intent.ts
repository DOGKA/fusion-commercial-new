"use client";

import { useCallback, useState } from "react";

/**
 * "Bu bağlantıya gidilecek" niyetini yakalar.
 *
 * `/hesabim/*` force-dynamic olduğu için Link'in varsayılan prefetch'i yalnızca
 * `loading.tsx` kabuğunu indirir; sayfanın verisi tıklamadan sonra istenir.
 * İmleç bağlantıya geldiğinde (mobilde parmak değdiğinde) `prefetch` tam
 * moda geçirilirse veri de önden yola çıkar ve tıklama anında hazır olur.
 *
 * Niyet tek yönlü: bir kez tetiklenince geri alınmıyor, çünkü prefetch zaten
 * yapılmış olur ve `false`a dönmek yalnızca gereksiz render üretirdi.
 */
export function useLinkIntent() {
  const [intent, setIntent] = useState(false);
  const trigger = useCallback(() => setIntent(true), []);

  return {
    /** Link'in `prefetch` prop'una verilir; niyet yoksa varsayılan davranış. */
    prefetch: intent ? true : undefined,
    intentHandlers: {
      onMouseEnter: trigger,
      onFocus: trigger,
      onTouchStart: trigger,
    },
  };
}
