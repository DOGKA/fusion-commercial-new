"use client";

import { useState, useEffect } from "react";
import { User, Building2, Phone, Mail, MapPin, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AddressFormData, InvoiceType } from "@/types/checkout";

// ═══════════════════════════════════════════════════════════════════════════
// ADDRESS FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onChange: (data: AddressFormData) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  showOrderNotes?: boolean;
  title?: string;
}

export default function AddressForm({
  initialData,
  onChange,
  errors = {},
  disabled = false,
  showOrderNotes = true,
  title = "Fatura Detayları",
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    invoiceType: "person",
    tcKimlikNo: "",
    taxNumber: "",
    taxOffice: "",
    companyName: "",
    country: "Türkiye",
    city: "",
    district: "",
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
    birthDate: "",
    orderNotes: "",
    saveAddress: false,
    isDefaultAddress: false,
    ...initialData,
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Sync with parent
  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  // Update field
  const updateField = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Phone mask (TR format: 05XX XXX XX XX)
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  };

  // Birth date mask (DD.MM.YYYY)
  const formatBirthDate = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  };

  // Input component
  const FormInput = ({
    name,
    label,
    type = "text",
    placeholder,
    icon: Icon,
    required = false,
    value,
    onValueChange,
    className,
  }: {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    icon?: any;
    required?: boolean;
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
  }) => (
    <div className={cn("space-y-2", className)}>
      <label className="flex items-center gap-1.5 text-xs font-medium text-white/60">
        {Icon && <Icon size={12} className="text-white/40" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField(null)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full h-12 px-4 bg-white/[0.03] border rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200",
          focusedField === name
            ? "border-emerald-500/50 bg-white/[0.05]"
            : "border-white/[0.08] hover:border-white/[0.12]",
          errors[name] && "border-red-500/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      {errors[name] && (
        <p className="text-xs text-red-400">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <h3 className="text-lg font-semibold text-white">{title}</h3>

      {/* Invoice Type Selection */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-white/60">Fatura Tipi</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "person", label: "Bireysel", icon: User },
            { value: "company", label: "Kurumsal", icon: Building2 },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField("invoiceType", option.value as InvoiceType)}
              disabled={disabled}
              className={cn(
                "flex items-center justify-center gap-2 h-12 rounded-xl border transition-all duration-200",
                formData.invoiceType === option.value
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-white/[0.02] border-white/[0.08] text-white/60 hover:border-white/[0.15] hover:text-white/80",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <option.icon size={16} />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="firstName"
          label="Ad"
          placeholder="Adınız"
          icon={User}
          required
          value={formData.firstName}
          onValueChange={(v) => updateField("firstName", v)}
        />
        <FormInput
          name="lastName"
          label="Soyad"
          placeholder="Soyadınız"
          required
          value={formData.lastName}
          onValueChange={(v) => updateField("lastName", v)}
        />
      </div>

      {/* Company Fields (if company selected) */}
      {formData.invoiceType === "company" && (
        <div className="space-y-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <FormInput
            name="companyName"
            label="Şirket Adı"
            placeholder="Şirket ünvanı"
            icon={Building2}
            required
            value={formData.companyName || ""}
            onValueChange={(v) => updateField("companyName", v)}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="taxNumber"
              label="Vergi Numarası"
              placeholder="1234567890"
              icon={FileText}
              required
              value={formData.taxNumber || ""}
              onValueChange={(v) => updateField("taxNumber", v.replace(/\D/g, "").slice(0, 10))}
            />
            <FormInput
              name="taxOffice"
              label="Vergi Dairesi"
              placeholder="Vergi dairesi adı"
              required
              value={formData.taxOffice || ""}
              onValueChange={(v) => updateField("taxOffice", v)}
            />
          </div>
        </div>
      )}

      {/* TC Kimlik No (optional for person) */}
      {formData.invoiceType === "person" && (
        <FormInput
          name="tcKimlikNo"
          label="T.C. Kimlik No"
          placeholder="11 haneli T.C. Kimlik numaranız (isteğe bağlı)"
          value={formData.tcKimlikNo || ""}
          onValueChange={(v) => updateField("tcKimlikNo", v.replace(/\D/g, "").slice(0, 11))}
        />
      )}

      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="phone"
          label="Telefon"
          type="tel"
          placeholder="0532 123 45 67"
          icon={Phone}
          required
          value={formData.phone}
          onValueChange={(v) => updateField("phone", formatPhone(v))}
        />
        <FormInput
          name="email"
          label="E-posta"
          type="email"
          placeholder="ornek@email.com"
          icon={Mail}
          required
          value={formData.email}
          onValueChange={(v) => updateField("email", v)}
        />
      </div>

      {/* Address Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <FormInput
            name="country"
            label="Ülke"
            value={formData.country}
            onValueChange={(v) => updateField("country", v)}
            className="col-span-1"
          />
          <FormInput
            name="city"
            label="İl"
            placeholder="İstanbul"
            icon={MapPin}
            required
            value={formData.city}
            onValueChange={(v) => updateField("city", v)}
          />
          <FormInput
            name="district"
            label="İlçe"
            placeholder="Kadıköy"
            required
            value={formData.district}
            onValueChange={(v) => updateField("district", v)}
          />
        </div>

        <FormInput
          name="addressLine1"
          label="Adres"
          placeholder="Mahalle, Sokak, Bina No"
          icon={MapPin}
          required
          value={formData.addressLine1}
          onValueChange={(v) => updateField("addressLine1", v)}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="addressLine2"
            label="Adres Devamı"
            placeholder="Daire, Kat vb. (isteğe bağlı)"
            value={formData.addressLine2 || ""}
            onValueChange={(v) => updateField("addressLine2", v)}
          />
          <FormInput
            name="postalCode"
            label="Posta Kodu"
            placeholder="34000"
            value={formData.postalCode}
            onValueChange={(v) => updateField("postalCode", v.replace(/\D/g, "").slice(0, 5))}
          />
        </div>
      </div>

      {/* Birth Date (optional) */}
      <FormInput
        name="birthDate"
        label="Doğum Tarihi"
        placeholder="GG.AA.YYYY (isteğe bağlı)"
        icon={Calendar}
        value={formData.birthDate || ""}
        onValueChange={(v) => updateField("birthDate", formatBirthDate(v))}
      />

      {/* Order Notes */}
      {showOrderNotes && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">
            Sipariş Notları (isteğe bağlı)
          </label>
          <textarea
            value={formData.orderNotes || ""}
            onChange={(e) => updateField("orderNotes", e.target.value)}
            onFocus={() => setFocusedField("orderNotes")}
            onBlur={() => setFocusedField(null)}
            placeholder="Siparişinizle ilgili eklemek istediğiniz notlar..."
            disabled={disabled}
            rows={3}
            className={cn(
              "w-full px-4 py-3 bg-white/[0.03] border rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 resize-none",
              focusedField === "orderNotes"
                ? "border-emerald-500/50 bg-white/[0.05]"
                : "border-white/[0.08] hover:border-white/[0.12]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
      )}
    </div>
  );
}
