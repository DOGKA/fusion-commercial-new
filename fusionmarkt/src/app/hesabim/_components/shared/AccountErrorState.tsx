"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

interface AccountErrorStateProps {
  title?: string;
  /** API'den gelen mesaj. Sabit metin yazmak yerine sunucunun mesajı gösterilir. */
  message?: string;
  /** Tekrar dene; verilmezse buton çıkmaz */
  onRetry?: () => void;
  secondaryAction?: { label: string; href: string };
}

export default function AccountErrorState({
  title = "Bir şeyler ters gitti",
  message,
  onRetry,
  secondaryAction = { label: "Hesabıma dön", href: "/hesabim" },
}: AccountErrorStateProps) {
  return (
    <div
      role="alert"
      className="acc-chip-danger flex items-center justify-center rounded-xl border-dashed px-4 py-10 text-center"
    >
      <div>
        <AlertCircle size={28} className="mx-auto mb-3" aria-hidden="true" />
        <p className="text-[16px] font-medium text-foreground">{title}</p>
        {message && (
          <p className="text-[13px] text-foreground-muted mt-1.5 max-w-md mx-auto">
            {message}
          </p>
        )}
        <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
          {onRetry && (
            <button type="button" onClick={onRetry} className="account-btn">
              <RefreshCw size={12} />
              Tekrar dene
            </button>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="text-[13px] text-foreground-muted hover:text-foreground transition-colors"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
