"use client";

/**
 * Şifre değişikliği — sayfa içi form
 *
 * Eskiden bu ekran yalnızca `/api/auth/forgot-password`'a sıfırlama linki
 * gönderiyordu; kullanıcı şifresini bildiği hâlde e-posta kutusuna gitmek
 * zorundaydı. Hazır duran `POST /api/user/password` ucu ise hiçbir yerden
 * çağrılmıyordu. Bu ekran o ucu kullanıyor ve sıfırlama linki kaldırıldı
 * (kullanıcı kararı, 31 Tem) — şifresini hatırlamayan kullanıcının yolu
 * zaten giriş ekranındaki "Şifremi unuttum".
 *
 * Tek kural: en az 8 karakter — kayıt uçuyla birebir aynı. Arayüz sunucudan
 * daha katı olmamalı, yoksa üye olurken kabul edilen bir şifre sonradan
 * reddedilir.
 */

import { useState } from "react";
import { Eye, EyeOff, Info, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { DISABLED_TONE } from "@/app/hesabim/_lib/action-classes";
import { useAccountProfile } from "../../_lib/useAccountProfile";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

interface PasswordViewProps {
  /**
   * Sunucuda çözülüyor (F2-45 deseni). Verilmezse profil istemcide beklenir ve
   * form bir an iskelet olarak görünür — bu sayfada tek ihtiyaç duyulan alan
   * bu olduğu için sunucudan geçirmek o titremeyi tamamen kaldırıyor.
   */
  initialHasPassword?: boolean;
}

export default function PasswordView({ initialHasPassword }: PasswordViewProps) {
  const { profile, loading } = useAccountProfile();
  const hasPassword = profile?.hasPassword ?? initialHasPassword;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    currentPassword !== newPassword &&
    !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Şifre güncellenemedi");
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setShowCurrent(false);
        setShowNew(false);
        toast.success(data.message || "Şifreniz güncellendi");
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
    setSaving(false);
  };

  if (hasPassword === undefined && loading) {
    return (
      <div className="account-details-form space-y-3" aria-hidden="true">
        <div className="account-skeleton h-4 w-2/3" />
        <div className="account-skeleton h-11" />
        <div className="account-skeleton h-11" />
      </div>
    );
  }

  // Sosyal giriş kullanıcısında form hiç gösterilmiyor. Sunucu bunu zaten
  // reddediyor, ama kullanıcıyı dolduramayacağı bir forma oturtmamak daha iyi.
  if (hasPassword === false) {
    return (
      <div className="account-details-form space-y-3">
        <span className="text-[14px] font-medium text-foreground-tertiary block">
          Şifre
        </span>
        <div className="flex gap-2.5 rounded-lg border border-border bg-glass-bg p-4">
          <Info size={16} className="mt-0.5 shrink-0 text-foreground-muted" aria-hidden="true" />
          <p className="text-[14px] leading-relaxed text-foreground-muted">
            Hesabınız sosyal giriş ile oluşturulmuş, bu yüzden burada bir şifreniz
            yok. Şifrenizi giriş yaptığınız hesabın ayarlarından yönetebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full h-11 pl-4 pr-11 bg-glass-bg border border-border rounded-lg text-[15px] text-foreground placeholder:text-foreground-disabled outline-none transition-colors focus:border-[var(--acc-accent-border)]";

  const labelClass = "block text-[13px] text-foreground-muted";

  // Yeni şifre girdisine bağlanan yardım/hata metinleri: hangisi görünürse
  // `aria-describedby` ona işaret etsin diye kimlikleri sabit.
  const newPasswordHelpId = "newPassword-help";
  const newPasswordErrorId = "newPassword-error";
  const newPasswordInvalid = tooShort || (newPassword.length > 0 && currentPassword === newPassword);

  return (
    <div className="account-details-form space-y-4 sm:space-y-5">
      <div className="space-y-3">
        <span className="text-[14px] font-medium text-foreground-tertiary block">
          Şifre Değişikliği
        </span>
        <p id={newPasswordHelpId} className="text-[12px] leading-relaxed text-foreground-muted">
          Şifreniz en az {MIN_PASSWORD_LENGTH} karakterden oluşmalı.
        </p>

        {error && (
          <div className="acc-chip-danger rounded-lg p-3 text-[14px]" role="alert">
            {error}
          </div>
        )}

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          {/* Şifre yöneticileri kaydı hangi hesaba bağlayacaklarını formdaki
              kullanıcı adı alanından çözer; alan yoksa Chrome konsola uyarı
              düşürüp kaydı hesapla eşleştiremez. Görünmesine gerek yok. */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={profile?.email ?? ""}
            readOnly
            hidden
          />

          <div className="space-y-1.5">
            <label htmlFor="currentPassword" className={labelClass}>
              Mevcut şifre
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Mevcut şifreniz"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                aria-label={showCurrent ? "Şifreyi gizle" : "Şifreyi göster"}
                className="account-icon-btn account-icon-btn--field absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted transition-colors hover:text-foreground"
              >
                {showCurrent ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="newPassword" className={labelClass}>
              Yeni şifre
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Yeni şifreniz"
                aria-invalid={newPasswordInvalid ? true : undefined}
                aria-describedby={
                  newPasswordInvalid ? newPasswordErrorId : newPasswordHelpId
                }
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                aria-label={showNew ? "Şifreyi gizle" : "Şifreyi göster"}
                className="account-icon-btn account-icon-btn--field absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted transition-colors hover:text-foreground"
              >
                {showNew ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
            </div>

            {/* İki kural da aynı girdiyi anlatıyor; tek kapsayıcı altında
                toplandılar ki `aria-describedby` tek kimliğe işaret edebilsin. */}
            {newPasswordInvalid && (
              <div id={newPasswordErrorId}>
                {tooShort && (
                  <span className="account-field-error">
                    Şifreniz en az {MIN_PASSWORD_LENGTH} karakter olmalı
                  </span>
                )}
                {newPassword.length > 0 && currentPassword === newPassword && (
                  <span className="account-field-error">
                    Yeni şifreniz mevcut şifrenizden farklı olmalı
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 rounded-lg border border-border bg-glass-bg p-3">
            <Info size={14} className="mt-0.5 shrink-0 text-foreground-muted" aria-hidden="true" />
            <p className="text-[12px] leading-relaxed text-foreground-muted">
              Güvenliğiniz için adınızı, soyadınızı veya doğum tarihinizi içermeyen
              bir şifre belirleyin.
            </p>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`account-btn account-save-btn acc-chip-accent inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${DISABLED_TONE}`}
          >
            {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            {saving ? "Güncelleniyor..." : "Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}
