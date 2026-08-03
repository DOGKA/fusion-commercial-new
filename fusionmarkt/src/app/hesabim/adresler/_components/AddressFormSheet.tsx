"use client";

/**
 * Adres ekleme / düzenleme paneli.
 *
 * Form eskiden listenin üstünde açılıyordu; artık `Sheet` içinde (mobilde
 * alttan panel, masaüstünde ortalanmış modal). Kazanç: odak tuzağı, Escape ve
 * arka plan kilidi bedava geliyor — üçü de eski formda yoktu.
 *
 * "Sil" burada duruyor ama onayı burada SORMUYOR: iki iç içe odak tuzağı
 * (panel + onay modalı) klavye davranışını bozar. Buton üstteki görünüme haber
 * veriyor, panel kapanıyor, onay modalı orada açılıyor.
 */

import { useState } from "react";
import { Building2, Home, Loader2, MapPin, Trash2 } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import { CITIES, getDistricts } from "@/lib/turkey-cities";
import { cn } from "@/lib/utils";
import { DISABLED_TONE } from "@/app/hesabim/_lib/action-classes";
import SegmentedControl from "./SegmentedControl";
import {
  EMPTY_ADDRESS_FORM,
  toFormValues,
  type AddressFormValues,
  type UserAddress,
} from "../_lib/types";

interface AddressFormSheetProps {
  open: boolean;
  /** null → yeni adres, dolu → düzenleme */
  address: UserAddress | null;
  /** Yeni adreste alıcı adının başlangıç değeri (hesap adı). */
  defaultFullName?: string;
  onClose: () => void;
  onSave: (
    values: AddressFormValues,
    id?: string
  ) => Promise<{ error: string; field?: string } | null>;
  onRequestDelete: (address: UserAddress) => void;
  /** Son adres silinemez uyarısı için */
  canDelete: boolean;
}

// Odak halkası tarayıcıdan gelmeye devam ediyor (`:focus-visible`); burada
// yalnızca kenarlık vurgusu var, `outline:none` yazılmıyor (plan 07 §4).
const FOCUS_RING = "focus:border-[color:var(--acc-accent-border)]";
// Mobilde 44px dokunma hedefi; `h-10` yerine `min-h` çünkü iOS'ta 16px'e
// yükseltilen yazı tipi sabit yükseklikte metni kırpıyordu.
const FIELD_BOX = "w-full mt-1 min-h-[44px] lg:min-h-[40px] px-3 rounded-lg text-[13px]";
const inputClass = `${FIELD_BOX} bg-glass-bg border border-border text-foreground placeholder:text-foreground-disabled ${FOCUS_RING}`;
const labelClass = "text-[11px] text-foreground-muted uppercase tracking-wide";
const selectClass = `${FIELD_BOX} bg-background border border-border text-foreground ${FOCUS_RING} appearance-none cursor-pointer ${DISABLED_TONE}`;

export default function AddressFormSheet({
  open,
  address,
  defaultFullName = "",
  onClose,
  onSave,
  onRequestDelete,
  canDelete,
}: AddressFormSheetProps) {
  // Form her açılışta sıfırdan kurulur. Bunu efektle yapmak yerine çağıran
  // taraf `key` veriyor (AddressesView `formSeq`): efekt içinde setState
  // basamaklı render üretiyor ve `react-hooks/set-state-in-effect` kuralı
  // bunu haklı olarak engelliyor.
  const [values, setValues] = useState<AddressFormValues>(() =>
    address ? toFormValues(address) : { ...EMPTY_ADDRESS_FORM, fullName: defaultFullName }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);

  const districts = values.city ? getDistricts(values.city) : [];
  const usableForBilling = values.type === "BILLING" || values.type === "BOTH";
  const isCorporate = usableForBilling && values.invoiceType === "CORPORATE";

  const set = <K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  // Hata metni girdiye `aria-describedby` ile bağlanıyor; ekran okuyucu alana
  // odaklandığında sebebi de okuyor, hatayı aramak zorunda kalmıyor.
  const errorId = (field: string) => `address-${field}-error`;
  const hasError = (field: string) => error?.field === field;
  /** Girdiye doğrudan yayılan hata öznitelikleri. */
  const errorProps = (field: string) =>
    hasError(field)
      ? { "aria-invalid": true as const, "aria-describedby": errorId(field) }
      : {};

  const fieldError = (field: string) =>
    hasError(field) ? (
      <p id={errorId(field)} className="acc-tone-danger mt-1 text-[11px]">
        {error?.message}
      </p>
    ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await onSave(values, address?.id);
    setSaving(false);
    if (result) {
      setError({ message: result.error, field: result.field });
      // Alanı belirsiz hatalar formun başında görünür olsun.
      if (!result.field) {
        document.getElementById("address-form-error")?.scrollIntoView({ block: "nearest" });
      }
      return;
    }
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={address ? "Adresi düzenle" : "Yeni adres"}
      description={
        address
          ? "Değişiklikler geçmiş siparişlerinizi etkilemez."
          : "Kaydettiğiniz adres ödeme adımında hazır gelir."
      }
      size="lg"
      busy={saving}
      footer={
        <div className="flex items-center gap-2">
          {address && (
            <button
              type="button"
              onClick={() => onRequestDelete(address)}
              disabled={saving || !canDelete}
              title={
                canDelete
                  ? undefined
                  : "Tek adresinizi silemezsiniz. Önce yeni bir adres ekleyin."
              }
              className={`account-btn acc-chip-danger inline-flex shrink-0 items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-full text-[12px] font-medium transition-colors hover:border-[color:var(--acc-danger-fg)] ${DISABLED_TONE}`}
            >
              <Trash2 size={13} aria-hidden="true" />
              Sil
            </button>
          )}
          <button
            type="submit"
            form="address-form"
            disabled={saving}
            className={`account-btn acc-chip-accent flex-1 inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 rounded-full text-[12px] font-medium transition-colors hover:border-[color:var(--acc-accent-fg)] ${DISABLED_TONE}`}
          >
            {saving && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
            {saving ? "Kaydediliyor..." : address ? "Değişiklikleri kaydet" : "Adresi kaydet"}
          </button>
        </div>
      }
    >
      <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
        {error && !error.field && (
          <p
            id="address-form-error"
            role="alert"
            className="acc-chip-danger block px-3 py-2 rounded-lg text-[12px]"
          >
            {error.message}
          </p>
        )}

        <div>
          <span className={labelClass}>Adres türü</span>
          <SegmentedControl
            className="mt-1.5"
            ariaLabel="Adres türü"
            value={values.addressCategory || "OTHER"}
            onChange={(v) => set("addressCategory", v)}
            options={[
              { value: "HOME", label: "Ev", icon: Home },
              { value: "WORK", label: "İş", icon: Building2 },
              { value: "OTHER", label: "Diğer", icon: MapPin },
            ]}
          />
        </div>

        <div>
          <span className={labelClass}>Bu adresi ne için kullanacağız?</span>
          <SegmentedControl
            className="mt-1.5"
            ariaLabel="Adres kullanım tipi"
            value={values.type}
            onChange={(v) => set("type", v)}
            options={[
              { value: "BOTH", label: "Her ikisi" },
              { value: "SHIPPING", label: "Teslimat" },
              { value: "BILLING", label: "Fatura" },
            ]}
          />
          <p className="mt-1.5 text-[11px] text-foreground-muted">
            {values.type === "BOTH"
              ? "Adres hem teslimat hem fatura adresi olarak kullanılabilir."
              : values.type === "SHIPPING"
                ? "Adres yalnızca teslimat için kullanılır."
                : "Adres yalnızca fatura için kullanılır."}
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="address-fullname">
            Alıcı adı soyadı
          </label>
          <input
            id="address-fullname"
            type="text"
            value={values.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Kargoyu teslim alacak kişi"
            autoComplete="name"
            required
            className={inputClass}
            {...errorProps("fullName")}
          />
          {fieldError("fullName")}
          <p className="mt-1.5 text-[11px] text-foreground-muted">
            Hesap adınızdan farklı olabilir; kargo ve fatura bu ada düzenlenir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="address-title">
              Adres başlığı
            </label>
            <input
              id="address-title"
              type="text"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Evim, İş yerim…"
              autoComplete="off"
              required
              className={inputClass}
              {...errorProps("title")}
            />
            {fieldError("title")}
          </div>
          <div>
            <label className={labelClass} htmlFor="address-phone">
              Telefon
            </label>
            <input
              id="address-phone"
              type="tel"
              inputMode="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="05XX XXX XX XX"
              autoComplete="tel"
              required
              className={`${inputClass} tabular-nums`}
              {...errorProps("phone")}
            />
            {fieldError("phone")}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass} htmlFor="address-city">
              İl
            </label>
            <select
              id="address-city"
              value={values.city}
              onChange={(e) => setValues((p) => ({ ...p, city: e.target.value, district: "" }))}
              autoComplete="address-level1"
              required
              className={selectClass}
              {...errorProps("city")}
            >
              <option value="">İl seçin</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {fieldError("city")}
          </div>
          <div>
            <label className={labelClass} htmlFor="address-district">
              İlçe
            </label>
            <select
              id="address-district"
              value={values.district}
              onChange={(e) => set("district", e.target.value)}
              autoComplete="address-level2"
              required
              disabled={!values.city}
              className={selectClass}
              {...errorProps("district")}
            >
              <option value="">{values.city ? "İlçe seçin" : "Önce il seçin"}</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {fieldError("district")}
          </div>
          <div>
            <label className={labelClass} htmlFor="address-postal">
              Posta kodu
            </label>
            <input
              id="address-postal"
              type="text"
              inputMode="numeric"
              value={values.postalCode}
              onChange={(e) =>
                set("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              placeholder="Örn. 34100"
              autoComplete="postal-code"
              className={`${inputClass} tabular-nums`}
              {...errorProps("postalCode")}
            />
            {fieldError("postalCode")}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="address-line">
            Açık adres
          </label>
          <textarea
            id="address-line"
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
            rows={3}
            required
            placeholder="Mahalle, sokak, bina no, daire no…"
            autoComplete="address-line1"
            className={`w-full mt-1 px-3 py-2 bg-glass-bg border border-border rounded-lg text-[13px] text-foreground placeholder:text-foreground-disabled ${FOCUS_RING} resize-y`}
            {...errorProps("address")}
          />
          {fieldError("address")}
        </div>

        {usableForBilling && (
          <div className="pt-3 border-t border-border space-y-3">
            <div>
              <span className={labelClass}>Fatura tipi</span>
              <SegmentedControl
                className="mt-1.5"
                ariaLabel="Fatura tipi"
                value={values.invoiceType}
                onChange={(v) => set("invoiceType", v)}
                options={[
                  { value: "INDIVIDUAL", label: "Bireysel" },
                  { value: "CORPORATE", label: "Kurumsal" },
                ]}
              />
            </div>

            {isCorporate && (
              <>
                <p className="text-[11px] text-foreground-muted">
                  Bu bilgiler ödeme adımında otomatik dolar, her siparişte tekrar
                  yazmanız gerekmez.
                </p>
                <div>
                  <label className={labelClass} htmlFor="address-company">
                    Firma adı
                  </label>
                  <input
                    id="address-company"
                    type="text"
                    value={values.company}
                    onChange={(e) => set("company", e.target.value)}
                    autoComplete="organization"
                    className={inputClass}
                    {...errorProps("company")}
                  />
                  {fieldError("company")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} htmlFor="address-tax-number">
                      Vergi kimlik no
                    </label>
                    <input
                      id="address-tax-number"
                      type="text"
                      inputMode="numeric"
                      value={values.taxNumber}
                      onChange={(e) =>
                        set("taxNumber", e.target.value.replace(/\D/g, "").slice(0, 11))
                      }
                      autoComplete="off"
                      className={`${inputClass} tabular-nums`}
                      {...errorProps("taxNumber")}
                    />
                    {fieldError("taxNumber")}
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="address-tax-office">
                      Vergi dairesi
                    </label>
                    <input
                      id="address-tax-office"
                      type="text"
                      value={values.taxOffice}
                      onChange={(e) => set("taxOffice", e.target.value)}
                      autoComplete="off"
                      className={inputClass}
                      {...errorProps("taxOffice")}
                    />
                    {fieldError("taxOffice")}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <label
          className={cn(
            // min-h: onay kutusunun kendisi 16px; dokunma hedefi satırın tamamı.
            "flex items-center gap-2 min-h-[44px] pt-3 border-t border-border",
            address?.isDefault ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          )}
        >
          <input
            type="checkbox"
            checked={values.isDefault || Boolean(address?.isDefault)}
            disabled={Boolean(address?.isDefault)}
            onChange={(e) => set("isDefault", e.target.checked)}
            className="w-4 h-4 shrink-0 rounded border-border bg-glass-bg accent-[color:var(--acc-accent-fg)]"
          />
          <span className="text-[12px] text-foreground-tertiary">
            {address?.isDefault
              ? "Bu adres varsayılan. Değiştirmek için başka bir adresi varsayılan yapın."
              : "Varsayılan adresim olsun"}
          </span>
        </label>
      </form>
    </Sheet>
  );
}
