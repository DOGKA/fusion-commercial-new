"use client";

/**
 * Üyelik bilgilerim
 *
 * Veri kaynağı `useAccountProfile` (GET /api/user/profile). Oturum yalnızca ad,
 * e-posta ve telefon taşıdığı için doğum tarihi ve cinsiyet oradan okunamaz;
 * doğum tarihinin kaydedilip bir daha görünmemesi (BUG-1) bu yüzdendi.
 *
 * Form ayrı bir bileşen ve `key` ile mount ediliyor: başlangıç değerleri profil
 * geldiğinde bir kez kurulur, böylece effect içinde setState gerekmez.
 */

import { useId, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Check, Loader2, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DISABLED_TONE } from "@/app/hesabim/_lib/action-classes";
import { AccountSkeleton, AccountErrorState } from "@/app/hesabim/_components/shared";
import {
  useAccountProfile,
  type AccountProfile,
} from "@/app/hesabim/_lib/useAccountProfile";
import { formatPhone, type Gender } from "@/lib/user-validation";

const GENDER_OPTIONS: { value: Gender | ""; label: string }[] = [
  { value: "", label: "Seçiniz" },
  { value: "FEMALE", label: "Kadın" },
  { value: "MALE", label: "Erkek" },
  { value: "UNSPECIFIED", label: "Belirtmek istemiyorum" },
];

export default function ProfileView() {
  const { profile, loading, error, refetch, patch } = useAccountProfile();

  if (loading && !profile) return <AccountSkeleton variant="form" />;
  if (error && !profile) return <AccountErrorState message={error} onRetry={refetch} />;
  if (!profile) return null;

  return <ProfileForm key={profile.id} profile={profile} onSaved={patch} />;
}

interface ProfileFormProps {
  profile: AccountProfile;
  onSaved: (partial: Partial<AccountProfile>) => void;
}

function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const { user } = useAuth();
  const { update: updateSession } = useSession();

  // Etiket–girdi bağı `id` üzerinden kuruluyor; sayfada birden çok form
  // olabileceği için kimlikler `useId` ile üretiliyor.
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;

  const nameParts = (profile.name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [phone, setPhone] = useState(formatPhone(profile.phone));
  const [birthDate, setBirthDate] = useState(profile.birthDate || "");
  const [gender, setGender] = useState<Gender | "">(profile.gender || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(
    null
  );

  const handleSaveProfile = async () => {
    setSaving(true);
    setFieldError(null);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName || undefined,
          phone: phone || undefined,
          birthDate: birthDate || undefined,
          gender: gender || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user) onSaved(data.user);

        await updateSession({
          user: {
            ...user,
            name: data.user?.name ?? fullName,
            phone: data.user?.phone ?? phone,
          },
        });

        // Sunucu telefonu normalize ediyor; kullanıcı ne yazdıysa değil,
        // kaydedilen değerin biçimlenmiş hâli gösterilir.
        if (data.user?.phone !== undefined) setPhone(formatPhone(data.user.phone));

        setSaved(true);
        toast.success("Profil bilgileri kaydedildi");
        setTimeout(() => setSaved(false), 3000);
      } else if (data.field) {
        setFieldError({ field: data.field, message: data.error });
        toast.error(data.error);
      } else {
        toast.error(data.error || "Kaydetme başarısız");
      }
    } catch {
      toast.error("Kaydetme sırasında bir hata oluştu");
    }
    setSaving(false);
  };

  const errorFor = (field: string) =>
    fieldError?.field === field ? fieldError.message : null;

  /** Hata metni girdiye `aria-describedby` ile bağlanabilsin diye sabit kimlik. */
  const errorId = (field: string) => `${uid}-${field}-error`;

  const inputClass = (field: string) =>
    [
      "w-full h-11 px-4 bg-glass-bg border rounded-lg text-[15px] text-foreground",
      "placeholder:text-foreground-disabled outline-none transition-colors",
      errorFor(field)
        ? "border-[var(--acc-danger-border)] focus:border-[var(--acc-danger-fg)]"
        : "border-border focus:border-[var(--acc-accent-border)]",
    ].join(" ");

  const labelClass = "block text-[13px] text-foreground-muted";

  return (
    <div className="account-details-form space-y-4 sm:space-y-5">
      <div className="space-y-3">
        <span className="block text-[14px] font-medium text-foreground-tertiary">
          Kişisel Bilgiler
        </span>
        <div className="grid grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 sm:gap-4">
          <div className="min-w-0 space-y-1.5">
            <label htmlFor={fieldId("first-name")} className={labelClass}>
              Ad
            </label>
            <input
              id={fieldId("first-name")}
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Adınız"
              autoComplete="given-name"
              aria-invalid={errorFor("name") ? true : undefined}
              aria-describedby={errorFor("name") ? errorId("name") : undefined}
              className={inputClass("name")}
            />
            {/* Sunucu ad ve soyadı tek `name` alanı olarak doğruluyor; hata bir
                kez basılıp iki girdiye birden bağlanıyor. */}
            {errorFor("name") && (
              <span id={errorId("name")} className="account-field-error">
                {errorFor("name")}
              </span>
            )}
          </div>

          <div className="min-w-0 space-y-1.5">
            <label htmlFor={fieldId("last-name")} className={labelClass}>
              Soyad
            </label>
            <input
              id={fieldId("last-name")}
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Soyadınız"
              autoComplete="family-name"
              aria-invalid={errorFor("name") ? true : undefined}
              aria-describedby={errorFor("name") ? errorId("name") : undefined}
              className={inputClass("name")}
            />
          </div>

          <div className="min-w-0 space-y-1.5">
            <label htmlFor={fieldId("phone")} className={labelClass}>
              Telefon
            </label>
            <input
              id={fieldId("phone")}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              autoComplete="tel"
              aria-invalid={errorFor("phone") ? true : undefined}
              aria-describedby={errorFor("phone") ? errorId("phone") : undefined}
              className={inputClass("phone")}
            />
            {errorFor("phone") && (
              <span id={errorId("phone")} className="account-field-error">
                {errorFor("phone")}
              </span>
            )}
          </div>

          <div className="min-w-0 space-y-1.5">
            <label htmlFor={fieldId("email")} className={labelClass}>
              E-posta
            </label>
            {/* `disabled` yerine `readOnly`: devre dışı girdi ekran okuyucunun
                gezinme sırasından tamamen düşüyor, o zaman alanın neden
                değiştirilemediğini anlatan yardım metni de duyurulmuyor. */}
            <input
              id={fieldId("email")}
              type="email"
              value={profile.email || ""}
              readOnly
              autoComplete="email"
              aria-describedby={fieldId("email-help")}
              className="w-full h-11 cursor-not-allowed rounded-lg border border-border bg-glass-bg px-4 text-[15px] text-foreground-muted outline-none"
            />
            <span id={fieldId("email-help")} className="block text-[12px] text-foreground-muted">
              E-posta adresi hesabınızın kimliğidir, buradan değiştirilemez.
            </span>
          </div>

          <div className="min-w-0 space-y-1.5">
            <label htmlFor={fieldId("birth-date")} className={labelClass}>
              Doğum Tarihi
            </label>
            <input
              id={fieldId("birth-date")}
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              autoComplete="bday"
              aria-invalid={errorFor("birthDate") ? true : undefined}
              aria-describedby={errorFor("birthDate") ? errorId("birthDate") : undefined}
              className={`account-date-input box-border max-w-full ${inputClass("birthDate")}`}
            />
            {errorFor("birthDate") && (
              <span id={errorId("birthDate")} className="account-field-error">
                {errorFor("birthDate")}
              </span>
            )}
          </div>

          <div className="min-w-0 space-y-1.5">
            <label htmlFor={fieldId("gender")} className={labelClass}>
              Cinsiyet
            </label>
            <select
              id={fieldId("gender")}
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender | "")}
              autoComplete="sex"
              className="w-full h-11 cursor-pointer appearance-none rounded-lg border border-border bg-background px-4 text-[15px] text-foreground outline-none transition-colors focus:border-[var(--acc-accent-border)]"
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleSaveProfile();
          }}
          disabled={saving || saved}
          className={`account-btn account-save-btn inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
            saved ? "acc-chip-success" : "acc-chip-accent"
          } ${DISABLED_TONE}`}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          ) : saved ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Save size={14} aria-hidden="true" />
          )}
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
