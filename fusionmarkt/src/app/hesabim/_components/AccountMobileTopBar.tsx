"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AccountMobileTopBarProps {
  /** Geri okunun götürdüğü üst sayfanın görünen adı */
  backLabel: string;
  /** Geri okunun hedefi; kabuk accountParentHref() ile hesaplar */
  backHref: string;
}

/**
 * Geri oku `router.back()` DEĞİL, sabit hiyerarşik link.
 *
 * Sebep: 12 e-posta şablonu bu sayfalara doğrudan derin link veriyor.
 * E-postadan gelen kullanıcının geçmişinde /hesabim yok; `back()` onu siteden
 * dışarı atardı. Ayrıca "yukarı" ile "geri" farklı şeyler — kullanıcı sipariş
 * detayından listeye çıkmayı bekler, önceki konuya dönmeyi değil.
 */
export default function AccountMobileTopBar({
  backLabel,
  backHref,
}: AccountMobileTopBarProps) {
  return (
    <div className="account-mobile-topbar">
      <Link
        href={backHref}
        aria-label={`${backLabel} sayfasına dön`}
        className="account-mobile-topbar__back"
      >
        <ArrowLeft size={20} aria-hidden="true" />
      </Link>
      <span className="account-mobile-topbar__title" aria-hidden="true">
        {backLabel}
      </span>
    </div>
  );
}
