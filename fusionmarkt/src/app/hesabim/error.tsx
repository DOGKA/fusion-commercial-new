"use client";

import { useEffect } from "react";
import { AccountErrorState } from "./_components/shared";

/**
 * /hesabim/* altındaki tüm render hatalarının sınırı.
 *
 * Bu dosya olmasa kök app/error.tsx devreye girip Header/Footer'lı tam sayfa
 * hata gösterirdi; kullanıcı hesap kabuğundan tamamen çıkmış olurdu.
 */
export default function HesabimError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Hesabım render hatası:", error);
  }, [error]);

  return <AccountErrorState message={error.message} onRetry={reset} />;
}
