"use client";

/**
 * Hesabım — profil verisinin tek kaynağı
 *
 * `AuthUser` (session) yalnızca ad, e-posta ve telefon taşır; doğum tarihi,
 * cinsiyet ve izin tercihleri orada YOK. Bunları session'a eklemek JWT'yi
 * gereksiz şişirirdi, bu yüzden profil alanları daima bu hook üzerinden
 * `GET /api/user/profile`'dan okunur (plan 02 §6.3 notu).
 *
 * Doğum tarihinin yazılıp bir daha geri okunamaması (BUG-1) tam olarak bu
 * kaynağın olmamasından kaynaklanıyordu.
 */

import { useCallback, useEffect, useState } from "react";
import type { Gender } from "@/lib/user-validation";

export interface AccountPreferences {
  /** null = hiç sorulmadı, false = reddetti — ikisi aynı şey DEĞİL. */
  sms: boolean | null;
  email: boolean | null;
  call: boolean | null;
  personalization: boolean | null;
  updatedAt: string | null;
}

export interface AccountProfile {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: string | null;
  phone: string | null;
  birthDate: string | null;
  gender: Gender | null;
  image: string | null;
  hasPassword: boolean;
  pendingEmail: string | null;
  createdAt: string;
  preferences: AccountPreferences;
  _count: { orders: number; addresses: number };
}

export interface AccountProfileState {
  profile: AccountProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** Sunucuya gitmeden yerel kopyayı güncellemek için (iyimser toggle). */
  patch: (partial: Partial<AccountProfile>) => void;
}

const CACHE_TTL_MS = 60_000;

let cache: { at: number; data: AccountProfile } | null = null;

/** Oturum kapanınca eski kullanıcının profili ekranda kalmasın. */
export function clearAccountProfileCache() {
  cache = null;
}

async function fetchProfile(): Promise<AccountProfile> {
  const res = await fetch("/api/user/profile");
  if (!res.ok) throw new Error("profile");
  const data = await res.json();
  if (!data?.user) throw new Error("profile");
  return data.user as AccountProfile;
}

export function useAccountProfile(): AccountProfileState {
  const [profile, setProfile] = useState<AccountProfile | null>(() =>
    cache && Date.now() - cache.at < CACHE_TTL_MS ? cache.data : null
  );
  const [loading, setLoading] = useState(profile === null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (skipCache: boolean) => {
    if (!skipCache && cache && Date.now() - cache.at < CACHE_TTL_MS) {
      setProfile(cache.data);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfile();
      cache = { at: Date.now(), data };
      setProfile(data);
    } catch {
      setError("Bilgileriniz yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      setProfile(cache.data);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const data = await fetchProfile();
        cache = { at: Date.now(), data };
        if (active) setProfile(data);
      } catch {
        if (active) setError("Bilgileriniz yüklenemedi.");
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

  const patch = useCallback((partial: Partial<AccountProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      cache = { at: Date.now(), data: next };
      return next;
    });
  }, []);

  return { profile, loading, error, refetch, patch };
}
