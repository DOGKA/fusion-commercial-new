"use client";

/**
 * Değerlendirmelerim verisi.
 *
 * İki sekme de (yazdıklarım / bekleyenler) aynı yanıtı kullanıyor: sekme
 * sayaçları için ikisinin sayısı birlikte gerekiyor, bu yüzden hangi sekmede
 * olursak olalım tek istek atılıyor.
 *
 * `initialData` verildiğinde (sunucu tarafı ilk render — F2-45) mount'taki
 * `fetch` atlanıyor; yoksa dolu liste bir an iskelete dönerdi.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { MyReviewsResponse } from "./types";

export function useMyReviews(initialData?: MyReviewsResponse | null) {
  const [data, setData] = useState<MyReviewsResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const skipInitialFetch = useRef(Boolean(initialData));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews/me");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Değerlendirmeleriniz alınamadı");
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
