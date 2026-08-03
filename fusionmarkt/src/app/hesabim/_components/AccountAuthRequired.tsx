"use client";

import { Loader2 } from "lucide-react";

/**
 * Oturumsuz kullanıcı bir hesap ALT route'una girdiğinde kısa süre görünür.
 * Gate aynı anda /hesabim'e ?next= ile yönlendirir, bu yüzden burada
 * kalıcı bir ekran kurulmaz — yalnızca boş ekran/layout shift olmasın diye.
 */
export default function AccountAuthRequired() {
  return (
    <div className="account-page">
      <div className="max-w-[1280px] mx-auto px-8">
        <div
          className="flex flex-col items-center justify-center gap-3 py-24 text-center"
          role="status"
        >
          <Loader2 size={28} className="animate-spin text-emerald-500" />
          <p className="text-[15px] text-foreground-muted">
            Giriş sayfasına yönlendiriliyorsunuz…
          </p>
        </div>
      </div>
    </div>
  );
}
