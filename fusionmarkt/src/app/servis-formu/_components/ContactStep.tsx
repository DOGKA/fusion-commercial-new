"use client";

import { useRef } from "react";
import {
  Calendar,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Upload,
  X,
} from "lucide-react";
import { FieldError } from "./FieldError";

export interface ContactFormData {
  name: string;
  title: string;
  invoiceNo: string;
  platform: string;
  phone: string;
  purchaseDate: string;
  invoiceType: string;
  orderNumber: string;
  email: string;
  message: string;
  returnAddress: string;
  packagingConfirm: boolean;
  faultFeeConfirm: boolean;
}

const PLATFORMS = ["FusionMarkt", "Trendyol", "Hepsiburada", "Amazon", "N11", "Diğer"];

function getLocalToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Props = {
  formData: ContactFormData;
  errors: Record<string, string | undefined>;
  invoicePdf: File | null;
  mediaFiles: File[];
  dragActive: boolean;
  recaptchaEnabled: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onCheckbox: (name: string, checked: boolean) => void;
  onInvoicePdfChange: (file: File | null) => void;
  onMediaAdd: (files: File[]) => void;
  onMediaRemove: (index: number) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

export function ContactStep({
  formData,
  errors,
  invoicePdf,
  mediaFiles,
  dragActive,
  recaptchaEnabled,
  onChange,
  onCheckbox,
  onInvoicePdfChange,
  onMediaAdd,
  onMediaRemove,
  onDrag,
  onDrop,
}: Props) {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Row: Name + Title */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            İsim Soyisim <span className="text-[var(--foreground-tertiary)]">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            className={`glass-input w-full px-3 sm:px-4 py-3 rounded-xl text-sm sm:text-base ${errors.name ? "border-[var(--fusion-error)]" : ""}`}
            placeholder="Adınız Soyadınız"
          />
          <FieldError message={errors.name} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Ünvan</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            className="glass-input w-full px-3 sm:px-4 py-3 rounded-xl text-sm sm:text-base"
            placeholder="Ünvan (opsiyonel)"
          />
        </div>
      </div>

      {/* Row: Invoice No + Platform */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Fatura No <span className="text-[var(--foreground-tertiary)]">*</span>
          </label>
          <input
            type="text"
            name="invoiceNo"
            value={formData.invoiceNo}
            onChange={onChange}
            className={`glass-input w-full px-3 sm:px-4 py-3 rounded-xl text-sm sm:text-base ${errors.invoiceNo ? "border-[var(--fusion-error)]" : ""}`}
            placeholder="Fatura No"
          />
          <FieldError message={errors.invoiceNo} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Satın Alınan Platform <span className="text-[var(--foreground-tertiary)]">*</span>
          </label>
          <select
            name="platform"
            value={formData.platform}
            onChange={onChange}
            className={`glass-input w-full px-3 sm:px-4 py-3 rounded-xl appearance-none bg-[var(--glass-bg)] text-sm sm:text-base ${errors.platform ? "border-[var(--fusion-error)]" : ""}`}
          >
            <option value="">Platform seçiniz</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <FieldError message={errors.platform} />
        </div>
      </div>

      {/* Row: Phone + Email */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-2">
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Telefon <span className="text-[var(--foreground-tertiary)]">*</span>
            </span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className={`glass-input w-full px-3 sm:px-4 py-3 rounded-xl text-sm sm:text-base ${errors.phone ? "border-[var(--fusion-error)]" : ""}`}
            placeholder="0501 234 56 78"
          />
          <FieldError message={errors.phone} />
        </div>
        <div>
          <label className="flex items-center gap-1 text-sm font-medium mb-2">
            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              E-posta <span className="text-[var(--foreground-tertiary)]">*</span>
            </span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className={`glass-input w-full px-3 sm:px-4 py-3 rounded-xl text-sm sm:text-base ${errors.email ? "border-[var(--fusion-error)]" : ""}`}
            placeholder="ornek@email.com"
          />
          <FieldError message={errors.email} />
        </div>
      </div>

      {/* Purchase Date */}
      <div>
        <label className="flex items-center gap-1 text-sm font-medium mb-2">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Satın Alım Tarihi <span className="text-[var(--foreground-tertiary)]">*</span>
          </span>
        </label>
        <input
          type="date"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={onChange}
          max={getLocalToday()}
          className={`glass-input w-full min-w-0 min-h-[48px] px-3 sm:px-4 py-3 rounded-xl text-base ${errors.purchaseDate ? "border-[var(--fusion-error)]" : ""}`}
        />
        <FieldError message={errors.purchaseDate} />
      </div>

      {/* Invoice Type + Order Number */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Fatura Tipi <span className="text-[var(--foreground-tertiary)]">*</span> / Sipariş Numarası
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {["Bireysel", "Kurumsal"].map((type) => (
            <label
              key={type}
              className={`flex items-center justify-center px-2 sm:px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                formData.invoiceType === type
                  ? "border-[var(--foreground)]/30 bg-[var(--foreground)]/[0.05] text-[var(--foreground)]"
                  : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--glass-border-hover)]"
              } ${errors.invoiceType ? "border-[var(--fusion-error)]" : ""}`}
            >
              <input
                type="radio"
                name="invoiceType"
                value={type}
                checked={formData.invoiceType === type}
                onChange={onChange}
                className="sr-only"
              />
              <span className="text-xs sm:text-sm font-medium">{type}</span>
            </label>
          ))}
          <input
            type="text"
            name="orderNumber"
            value={formData.orderNumber}
            onChange={onChange}
            className="glass-input w-full px-2 sm:px-4 py-3 rounded-xl text-xs sm:text-sm"
            placeholder="Sipariş No"
          />
        </div>
        <FieldError message={errors.invoiceType} />
      </div>

      {/* Invoice PDF */}
      <div>
        <label className="flex items-center gap-1 text-sm font-medium mb-2">
          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Fatura PDF <span className="text-[var(--foreground-tertiary)]">*</span>
          </span>
        </label>
        <div
          onClick={() => pdfInputRef.current?.click()}
          className={`glass-input rounded-xl px-3 sm:px-4 py-3 sm:py-4 cursor-pointer flex items-center gap-2 sm:gap-3 transition-all hover:border-[var(--glass-border-hover)] ${
            errors.invoicePdf ? "border-[var(--fusion-error)]" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--fusion-info)]/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[var(--fusion-info)]" />
          </div>
          {invoicePdf ? (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span className="text-sm truncate">{invoicePdf.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInvoicePdfChange(null);
                }}
                className="p-1 rounded-lg hover:bg-[var(--glass-bg-hover)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-[var(--foreground-tertiary)]">
              PDF dosyası seçmek için tıklayın
            </span>
          )}
        </div>
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onInvoicePdfChange(file);
          }}
        />
        <FieldError message={errors.invoicePdf} />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Yorum veya Mesaj <span className="text-[var(--foreground-tertiary)]">*</span>
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={onChange}
          rows={4}
          className={`glass-input w-full px-3 sm:px-4 py-3 rounded-xl resize-none text-sm sm:text-base ${errors.message ? "border-[var(--fusion-error)]" : ""}`}
          placeholder="Hatayı / Arızayı anlatan açıklama"
        />
        <FieldError message={errors.message} />
      </div>

      {/* Media Upload */}
      <div>
        <label className="flex items-center gap-1 text-sm font-medium mb-2">
          <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Görsel / Video <span className="text-[var(--foreground-tertiary)]">*</span>
          </span>
        </label>
        <div
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
          onClick={() => mediaInputRef.current?.click()}
          className={`glass-input rounded-xl px-3 sm:px-4 py-5 sm:py-8 cursor-pointer text-center transition-all ${
            dragActive
              ? "border-[var(--foreground)]/30 bg-[var(--foreground)]/[0.04]"
              : "hover:border-[var(--glass-border-hover)]"
          } ${errors.media ? "border-[var(--fusion-error)]" : ""}`}
        >
          <Upload className="w-8 h-8 mx-auto mb-3 text-[var(--foreground-tertiary)]" />
          <p className="text-sm text-[var(--foreground-secondary)]">
            Yüklemek için tıklayın veya dosyayı bu alana sürükleyin
          </p>
          <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
            Maksimum 10 MB eklenebilir. JPEG, PNG, WebP, GIF, MP4, MOV, WebM
          </p>
        </div>
        <input
          ref={mediaInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => {
            onMediaAdd(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
        {mediaFiles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {mediaFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-sm"
              >
                {file.type.startsWith("video/") ? (
                  <FileText className="w-4 h-4 text-[var(--fusion-info)] flex-shrink-0" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-[var(--foreground-tertiary)] flex-shrink-0" />
                )}
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onMediaRemove(i)}
                  className="p-0.5 rounded hover:bg-[var(--glass-bg-hover)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <FieldError message={errors.media} />
      </div>

      {/* Return Address */}
      <div>
        <label className="flex items-center gap-1 text-sm font-medium mb-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Servis Sonrası Geri Gönderim Adresi{" "}
            <span className="text-[var(--foreground-tertiary)]">*</span>
          </span>
        </label>
        <textarea
          name="returnAddress"
          value={formData.returnAddress}
          onChange={onChange}
          rows={3}
          className={`glass-input w-full px-3 sm:px-4 py-3 rounded-xl resize-none text-sm sm:text-base ${errors.returnAddress ? "border-[var(--fusion-error)]" : ""}`}
          placeholder="Cihazın tamiri/değişimi durumunda gönderilecek açık adresinizi belirtiniz."
        />
        <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
          Belirttiğiniz adresten farklı bir adrese gönderim istemeniz durumunda,{" "}
          <a
            href="mailto:info@fusionmarkt.com"
            className="text-[var(--foreground-secondary)] hover:underline"
          >
            info@fusionmarkt.com
          </a>{" "}
          adresine mail iletiniz.
        </p>
        <FieldError message={errors.returnAddress} />
      </div>

      {/* Confirmations */}
      <div className="space-y-2 sm:space-y-4">
        <label
          className={`flex items-start gap-2 sm:gap-3 px-2.5 py-2 sm:p-4 rounded-lg sm:rounded-xl border cursor-pointer transition-all ${
            formData.packagingConfirm
              ? "border-[var(--foreground)]/30 bg-[var(--foreground)]/[0.05]"
              : "border-[var(--glass-border)] bg-[var(--glass-bg)]"
          } ${errors.packagingConfirm ? "border-[var(--fusion-error)]" : ""}`}
        >
          <input
            type="checkbox"
            checked={formData.packagingConfirm}
            onChange={(e) => onCheckbox("packagingConfirm", e.target.checked)}
            className="sr-only peer"
          />
          <div className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-400 flex-shrink-0 flex items-center justify-center peer-checked:bg-[var(--foreground)] peer-checked:border-[var(--foreground)] transition-colors">
            {formData.packagingConfirm && (
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--background)]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-sm font-medium leading-tight sm:leading-normal sm:mb-1">
              Ürün Paketleme Onayı <span className="text-[var(--foreground-tertiary)]">*</span>
            </p>
            <p className="text-[10px] sm:text-xs text-[var(--foreground-tertiary)] leading-snug sm:leading-relaxed mt-0.5">
              Aksesuarların eklendiğinden ve taşıma hasarı oluşmayacak şekilde paketlendiğinden emin
              olacağım. Taşıma hasarı sorumluluğunun bana ait olduğunu onaylıyorum.
            </p>
          </div>
        </label>
        <FieldError message={errors.packagingConfirm} />

        <label
          className={`flex items-start gap-2 sm:gap-3 px-2.5 py-2 sm:p-4 rounded-lg sm:rounded-xl border cursor-pointer transition-all ${
            formData.faultFeeConfirm
              ? "border-[var(--foreground)]/30 bg-[var(--foreground)]/[0.05]"
              : "border-[var(--glass-border)] bg-[var(--glass-bg)]"
          } ${errors.faultFeeConfirm ? "border-[var(--fusion-error)]" : ""}`}
        >
          <input
            type="checkbox"
            checked={formData.faultFeeConfirm}
            onChange={(e) => onCheckbox("faultFeeConfirm", e.target.checked)}
            className="sr-only peer"
          />
          <div className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-400 flex-shrink-0 flex items-center justify-center peer-checked:bg-[var(--foreground)] peer-checked:border-[var(--foreground)] transition-colors">
            {formData.faultFeeConfirm && (
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--background)]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-sm font-medium leading-tight sm:leading-normal sm:mb-1">
              Arıza Tespit Onayı <span className="text-[var(--foreground-tertiary)]">*</span>
            </p>
            <p className="text-[10px] sm:text-xs text-[var(--foreground-tertiary)] leading-snug sm:leading-relaxed mt-0.5">
              Garanti dışı durumda KDV dahil 1.200 TL arıza tespit ücretini ödemeyi kabul ediyorum.
            </p>
          </div>
        </label>
        <FieldError message={errors.faultFeeConfirm} />
      </div>

      {recaptchaEnabled && (
        <p className="text-xs text-[var(--foreground-tertiary)] text-center">
          Bu site Google reCAPTCHA ile korunmaktadır.{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Gizlilik Politikası
          </a>{" "}
          ve{" "}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Kullanım Şartları
          </a>{" "}
          geçerlidir.
        </p>
      )}
    </div>
  );
}
