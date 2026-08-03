"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UserCouponsResponse } from "./types";

/**
 * Kuponlarım verisi.
 *
 * `initialData` verildiğinde (sunucu tarafı ilk render — F2-45) ilk `fetch`
 * ATLANIYOR: veri zaten HTML ile geldi, aynı isteği hidrasyondan sonra tekrar
 * atmak hem gereksiz hem de dolu listeyi bir an iskelete çevirirdi.
 *
 * `reload()` her durumda çalışır; hata ekranındaki "tekrar dene" ona bağlı.
 */
export function useCoupons(initialData?: UserCouponsResponse | null) {
  const [data, setData] = useState<UserCouponsResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  /** İlk veri sunucudan geldiyse mount'taki isteği bir kereliğine atla. */
  const skipInitialFetch = useRef(Boolean(initialData));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/coupons");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Kuponlarınız alınamadı");
        return;
      }
      setData(await res.json());
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
