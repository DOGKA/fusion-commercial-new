"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface AccountConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" → kırmızı onay butonu (adres sil, siparişi iptal et) */
  tone?: "default" | "danger";
  /** onConfirm sürerken buton spinner'a döner ve modal kapanmaz */
  loading?: boolean;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Yıkıcı işlemler için onay modalı. `window.confirm` yerine bunu kullanın.
 *
 * Bilinçli olarak `.modal-content` kullanmıyor: o sınıfın tek kuralı mobilde
 * `min-height: 100vh` dayatmak ve bu, iki satırlık bir onay kutusunu ekranı
 * kaplayan bir sayfaya çeviriyordu.
 */
export default function AccountConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  tone = "default",
  loading = false,
}: AccountConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const requestClose = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);

  // Açılışta odağı onay butonuna al, kapanışta tetikleyiciye geri ver.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    return () => previouslyFocused.current?.focus();
  }, [open]);

  // Arka planın kaymasını engelle.
  useBodyScrollLock(open, "dark");

  // Escape ile kapat, Tab'ı modal içinde tut.
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

  if (!open) return null;

  return (
    <div
      className="account-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="account-dialog"
      >
        <h2 id={titleId} className="account-dialog__title">
          {title}
        </h2>
        {description && (
          <div id={descId} className="account-dialog__desc">
            {description}
          </div>
        )}
        <div className="account-dialog__actions">
          <button
            type="button"
            onClick={requestClose}
            disabled={loading}
            className="account-dialog__cancel"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => void onConfirm()}
            disabled={loading}
            className={cn(
              "account-dialog__confirm",
              tone === "danger" && "account-dialog__confirm--danger"
            )}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
