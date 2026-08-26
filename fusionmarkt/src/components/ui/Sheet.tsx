"use client";

/**
 * Sheet — mobilde alttan açılan panel, masaüstünde ortalanmış modal
 *
 * Projede bugüne kadar her modal kendi overlay'ini, kendi Escape dinleyicisini
 * ve kendi kapatma mantığını yazıyordu; odak tuzağı ve arka plan kilidi
 * çoğunda eksikti. Bu bileşen o üç şeyi tek yerde çözer.
 *
 * Stil tamamen Tailwind sınıflarıyla: yeni bir stylesheet açmamak ve
 * `mobile.css`'e dokunmamak bilinçli (plan 01 §11 o dosyayı ayrı bir PR'a
 * ayırdı, oradaki ölü kural temizliğiyle bu işin kesişmemesi gerekiyor).
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Başlığın altındaki açıklama satırı */
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Alt aksiyon şeridi — mobilde yapışkan kalır */
  footer?: React.ReactNode;
  /** Masaüstü genişliği */
  size?: "sm" | "md" | "lg";
  /**
   * `true` iken Escape, overlay tıklaması ve kapatma butonu devre dışı.
   * Gönderim sürerken yarı yolda kapanmayı engeller.
   */
  busy?: boolean;
  /** Geri oku göster (çok adımlı akışlarda ilk adıma dönüş) */
  onBack?: () => void;
}

const SIZE_CLASS = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
} as const;

/**
 * Alt panel mi modal mı olduğuna karar verir.
 *
 * Başlangıç değeri fonksiyonla okunuyor: panel yalnızca kullanıcı etkileşimiyle
 * (yani hidrasyondan sonra) açıldığı için `window` burada her zaman var ve
 * ilk kare yanlış yönde animasyon oynatmıyor.
 */
function useIsBottomSheet() {
  const [isBottomSheet, setIsBottomSheet] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 639px)").matches;
  });

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const onChange = (e: MediaQueryListEvent) => setIsBottomSheet(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isBottomSheet;
}

export default function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  busy = false,
  onBack,
}: SheetProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const isBottomSheet = useIsBottomSheet();

  const requestClose = useCallback(() => {
    if (!busy) onClose();
  }, [busy, onClose]);

  // Açılışta odağı panele al, kapanışta tetikleyiciye geri ver. Geri
  // vermemek, klavye kullanıcısını sayfanın başına fırlatır.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      (nodes?.[0] ?? panelRef.current)?.focus();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      previouslyFocused.current?.focus();
    };
  }, [open]);

  useBodyScrollLock(open, "dark");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((n) => n.offsetParent !== null);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, requestClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) requestClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={cn(
              "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-background shadow-2xl outline-none",
              "sm:max-h-[85vh] sm:rounded-2xl",
              SIZE_CLASS[size]
            )}
            initial={isBottomSheet ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            animate={isBottomSheet ? { y: 0 } : { opacity: 1, scale: 1 }}
            exit={isBottomSheet ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
          >
            {/* Mobil tutamak — panelin sürüklenebilir göründüğü izlenimini
                vermemek için yalnızca görsel bir ipucu, drag bağlı değil. */}
            {isBottomSheet && (
              <div className="flex justify-center pt-2.5" aria-hidden="true">
                <span className="h-1 w-10 rounded-full bg-border" />
              </div>
            )}

            <div className="flex items-start gap-3 border-b border-border px-5 py-4">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  disabled={busy}
                  className="account-icon-btn -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background-secondary hover:text-foreground disabled:opacity-50"
                  aria-label="Geri"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-[17px] font-semibold text-foreground">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-1 text-[13px] text-foreground-muted">
                    {description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={requestClose}
                disabled={busy}
                className="account-icon-btn -mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background-secondary hover:text-foreground disabled:opacity-50"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

            {footer && (
              <div className="border-t border-border bg-background px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
