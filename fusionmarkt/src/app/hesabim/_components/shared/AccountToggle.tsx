"use client";

/**
 * Hesabım — açma/kapama anahtarı
 *
 * `role="switch"` + `aria-checked` ile gerçek bir anahtar olarak duyurulur.
 * Görsel ray 44x24px, ama dokunma hedefi ≥44px: mobil CSS'teki hesap alanı
 * muafiyetine güvenilmez, hedef bileşenin kendi içinde garanti edilir
 * (plan 02 §4.6).
 */

interface AccountToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Görünür etiketin id'si — anahtarın neyi kontrol ettiğini bağlar. */
  labelledBy: string;
  disabled?: boolean;
}

export default function AccountToggle({
  checked,
  onChange,
  labelledBy,
  disabled = false,
}: AccountToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="account-toggle"
      data-checked={checked ? "true" : "false"}
    >
      <span className="account-toggle__track" aria-hidden="true">
        <span className="account-toggle__thumb" />
      </span>
    </button>
  );
}
