"use client";

/**
 * Hesabım — /hesabim ekranının sayaçları ve son siparişleri
 *
 * DashboardPane'in mount'ta yaptığı Promise.all bloğu buraya taşındı
 * (plan 01 §5.9). Davranış aynı, yeri değişti.
 *
 * Bu hook YALNIZCA /hesabim ekranında çağrılır ve polling YAPMAZ.
 *
 * F2-45: `initialFetched` verilirse mount'taki ağ isteği atlanır — pano
 * sayaçları ve son siparişler ilk HTML'de hazır gelir. Favori/sepet sayıları
 * hâlâ context'ten (misafir localStorage akışı + sepet).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import type { AccountSummaryFetched } from "./types";

export type AccountRecentOrder = AccountSummaryFetched["recentOrders"][number];
export type FetchedPart = AccountSummaryFetched;

export interface AccountSummary {
  orders: number;
  addresses: number;
  favorites: number;
  cartItems: number;
  /** Panodaki "Son Siparişler" listesi için ilk 3 kayıt */
  recentOrders: AccountRecentOrder[];
}

export interface AccountSummaryState {
  data: AccountSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_TTL_MS = 60_000;

/**
 * Modül düzeyinde cache: mobil hub ile masaüstü panosu aynı ekranda ikisi de
 * DOM'da olduğu için (CSS ile dallanıyoruz) ve /hesabim'e her dönüşte ağır
 * /api/orders isteği tekrarlanmasın diye.
 */
let cache: { at: number; data: FetchedPart } | null = null;

async function fetchSummary(): Promise<FetchedPart> {
  const [ordersRes, addressesRes] = await Promise.all([
    // Pano yalnızca üç kayıt gösteriyor; toplam sayı `pagination.total`'dan gelir.
    fetch("/api/orders?limit=3"),
    fetch("/api/user/addresses"),
  ]);

  let orders = 0;
  let recentOrders: AccountRecentOrder[] = [];
  let addresses = 0;

  if (ordersRes.ok) {
    const data = await ordersRes.json();
    orders = data?.pagination?.total ?? 0;
    recentOrders = Array.isArray(data?.orders) ? data.orders : [];
  }

  if (addressesRes.ok) {
    const data = await addressesRes.json();
    addresses = data.addresses?.length || 0;
  }

  return { orders, addresses, recentOrders };
}

export function useAccountSummary(initialFetched?: FetchedPart | null): AccountSummaryState {
  const { itemCount: favoriteCount } = useFavorites();
  const { itemCount: cartCount } = useCart();

  const [fetched, setFetched] = useState<FetchedPart | null>(() => {
    if (initialFetched) {
      // Mobil/masaüstü çift ağaç aynı oturumda ikinci istek atmasın.
      cache = { at: Date.now(), data: initialFetched };
      return initialFetched;
    }
    return cache && Date.now() - cache.at < CACHE_TTL_MS ? cache.data : null;
  });
  const [loading, setLoading] = useState(fetched === null);
  const [error, setError] = useState<string | null>(null);

  const skipInitialFetch = useRef(Boolean(initialFetched));

  const load = useCallback(async (skipCache: boolean) => {
    if (!skipCache && cache && Date.now() - cache.at < CACHE_TTL_MS) {
      setFetched(cache.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchSummary();
      cache = { at: Date.now(), data };
      setFetched(data);
    } catch {
      setError("Hesap bilgileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }

    let active = true;
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      setFetched(cache.data);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const data = await fetchSummary();
        cache = { at: Date.now(), data };
        if (active) setFetched(data);
      } catch {
        if (active) setError("Hesap bilgileri yüklenemedi.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const refetch = useCallback(() => {
    void load(true);
  }, [load]);

  return {
    data: fetched
      ? {
          orders: fetched.orders,
          addresses: fetched.addresses,
          favorites: favoriteCount,
          cartItems: cartCount,
          recentOrders: fetched.recentOrders,
        }
      : null,
    loading,
    error,
    refetch,
  };
}
