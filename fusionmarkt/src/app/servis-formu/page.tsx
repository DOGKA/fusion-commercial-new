"use client";

import { motion } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Send,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Wrench,
  Phone,
  Calendar,
  Mail,
  MapPin,
  ClipboardList,
} from "lucide-react";

// reCAPTCHA - optional, only loads if site key is configured
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

interface FormData {
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

interface FormErrors {
  [key: string]: string | undefined;
}

const PLATFORMS = [
  "FusionMarkt",
  "Trendyol",
  "Hepsiburada",
  "Amazon",
  "N11",
  "Diğer",
];

export default function ServisFormuPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    title: "",
    invoiceNo: "",
    platform: "",
    phone: "",
    purchaseDate: "",
    invoiceType: "",
    orderNumber: "",
    email: "",
    message: "",
    returnAddress: "",
    packagingConfirm: false,
    faultFeeConfirm: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [invoicePdf, setInvoicePdf] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  // Load reCAPTCHA script
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY) return null;
    try {
      const grecaptcha = (window as unknown as Record<string, { execute: (key: string, options: { action: string }) => Promise<string> }>).grecaptcha;
      if (!grecaptcha) return null;
      return await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "service_form" });
    } catch {
      return null;
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "İsim Soyisim gereklidir";
    if (!formData.invoiceNo.trim()) newErrors.invoiceNo = "Fatura No gereklidir";
    if (!formData.platform) newErrors.platform = "Platform seçimi gereklidir";
    if (!formData.phone.trim()) newErrors.phone = "Telefon numarası gereklidir";
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = "Satın alım tarihi gereklidir";
    }
    if (!formData.invoiceType) newErrors.invoiceType = "Fatura tipi gereklidir";
    if (!formData.email.trim()) {
      newErrors.email = "E-posta gereklidir";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) newErrors.email = "Geçersiz e-posta adresi";
    }
    if (!invoicePdf) newErrors.invoicePdf = "Fatura PDF dosyası gereklidir";
    if (!formData.message.trim()) newErrors.message = "Açıklama gereklidir";
    if (mediaFiles.length === 0) newErrors.media = "En az bir görsel veya video eklemelisiniz";
    if (!formData.returnAddress.trim()) newErrors.returnAddress = "Geri gönderim adresi gereklidir";
    if (!formData.packagingConfirm) newErrors.packagingConfirm = "Bu onay gereklidir";
    if (!formData.faultFeeConfirm) newErrors.faultFeeConfirm = "Bu onay gereklidir";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = await getRecaptchaToken();

      const fd = new FormData();
      fd.append("name", formData.name);
      if (formData.title) fd.append("title", formData.title);
      fd.append("invoiceNo", formData.invoiceNo);
      fd.append("platform", formData.platform);
      fd.append("phone", formData.phone);
      fd.append("purchaseDate", new Date(formData.purchaseDate).toISOString());
      fd.append("invoiceType", formData.invoiceType);
      if (formData.orderNumber) fd.append("orderNumber", formData.orderNumber);
      fd.append("email", formData.email);
      fd.append("message", formData.message);
      fd.append("returnAddress", formData.returnAddress);
      fd.append("packagingConfirm", "true");
      fd.append("faultFeeConfirm", "true");

      if (invoicePdf) fd.append("invoicePdf", invoicePdf);
      for (const file of mediaFiles) {
        fd.append("media", file);
      }
      if (token) fd.append("recaptchaToken", token);

      const res = await fetch("/api/service-form", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gönderilemedi");

      setIsSubmitted(true);
    } catch (error) {
      console.error("Service form error:", error);
      alert(error instanceof Error ? error.message : "Servis talebi gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCheckbox = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    setMediaFiles((prev) => [...prev, ...files]);
    if (errors.media) setErrors((prev) => ({ ...prev, media: undefined }));
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const ErrorMsg = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="mt-1.5 text-sm text-[var(--fusion-error)] flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        {errors[field]}
      </p>
    ) : null;

  // Success state
  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="container px-4 md:px-6" style={{ paddingTop: "140px", paddingBottom: "80px" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center glass-card p-12 rounded-3xl"
          >
            <div className="w-20 h-20 rounded-full bg-[var(--fusion-success)]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[var(--fusion-success)]" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Servis Talebiniz Alındı!</h2>
            <p className="text-[var(--foreground-secondary)] mb-6">
              Talebiniz incelemeye alınmıştır. En kısa sürede e-posta adresinize dönüş yapılacaktır.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "", title: "", invoiceNo: "", platform: "", phone: "",
                  purchaseDate: "",
                  invoiceType: "", orderNumber: "", email: "", message: "",
                  returnAddress: "", packagingConfirm: false, faultFeeConfirm: false,
                });
                setInvoicePdf(null);
                setMediaFiles([]);
              }}
              className="px-8 py-3 rounded-xl bg-[var(--fusion-primary)] text-white font-semibold hover:bg-[var(--fusion-primary-light)] transition-all"
            >
              Yeni Talep Oluştur
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="relative pb-8 md:pb-12 overflow-hidden" style={{ paddingTop: "120px" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[var(--fusion-warning)]/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-[var(--fusion-primary)]/10 rounded-full blur-[120px]" />
        </div>

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center px-2"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Servis Formu</h1>
            <p className="text-base md:text-lg text-[var(--foreground-secondary)]">
              Ürününüzle ilgili arıza veya sorun bildirimi için aşağıdaki formu eksiksiz doldurunuz.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="glass-card p-4 sm:p-6 md:p-10 rounded-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-warning)]/10 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-[var(--fusion-warning)]" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Arıza Bildirim Formu</h2>
                  <p className="text-sm text-[var(--foreground-tertiary)]">* ile işaretli alanlar zorunludur</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Row: Name + Title */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      İsim Soyisim <span className="text-[var(--fusion-primary)]">*</span>
                    </label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      className={`glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base ${errors.name ? "border-[var(--fusion-error)]" : ""}`}
                      placeholder="Adınız Soyadınız"
                    />
                    <ErrorMsg field="name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ünvan</label>
                    <input
                      type="text" name="title" value={formData.title} onChange={handleChange}
                      className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base"
                      placeholder="Ünvan (opsiyonel)"
                    />
                  </div>
                </div>

                {/* Row: Invoice No + Platform */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fatura No <span className="text-[var(--fusion-primary)]">*</span>
                    </label>
                    <input
                      type="text" name="invoiceNo" value={formData.invoiceNo} onChange={handleChange}
                      className={`glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base ${errors.invoiceNo ? "border-[var(--fusion-error)]" : ""}`}
                      placeholder="Fatura No"
                    />
                    <ErrorMsg field="invoiceNo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Satın Alınan Platform <span className="text-[var(--fusion-primary)]">*</span>
                    </label>
                    <select
                      name="platform" value={formData.platform} onChange={handleChange}
                      className={`glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl appearance-none bg-[var(--glass-bg)] text-sm sm:text-base ${errors.platform ? "border-[var(--fusion-error)]" : ""}`}
                    >
                      <option value="">Platform seçiniz</option>
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ErrorMsg field="platform" />
                  </div>
                </div>

                {/* Row: Phone + Email */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="flex items-center gap-1 text-sm font-medium mb-2">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Telefon <span className="text-[var(--fusion-primary)]">*</span></span>
                    </label>
                    <input
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className={`glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base ${errors.phone ? "border-[var(--fusion-error)]" : ""}`}
                      placeholder="0501 234 56 78"
                    />
                    <ErrorMsg field="phone" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-sm font-medium mb-2">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>E-posta <span className="text-[var(--fusion-primary)]">*</span></span>
                    </label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      className={`glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base ${errors.email ? "border-[var(--fusion-error)]" : ""}`}
                      placeholder="ornek@email.com"
                    />
                    <ErrorMsg field="email" />
                  </div>
                </div>

                {/* Row: Purchase Date */}
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium mb-2">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Satın Alım Tarihi <span className="text-[var(--fusion-primary)]">*</span></span>
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className={`glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base ${errors.purchaseDate ? "border-[var(--fusion-error)]" : ""}`}
                  />
                  <ErrorMsg field="purchaseDate" />
                </div>

                {/* Row: Invoice Type (Bireysel / Kurumsal) + Order Number — 3 columns */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fatura Tipi <span className="text-[var(--fusion-primary)]">*</span> / Sipariş Numarası
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {["Bireysel", "Kurumsal"].map((type) => (
                      <label
                        key={type}
                        className={`flex items-center justify-center px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl border cursor-pointer transition-all ${
                          formData.invoiceType === type
                            ? "border-[var(--fusion-primary)] bg-[var(--fusion-primary)]/10 text-[var(--fusion-primary)]"
                            : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--glass-border-hover)]"
                        } ${errors.invoiceType ? "border-[var(--fusion-error)]" : ""}`}
                      >
                        <input
                          type="radio" name="invoiceType" value={type}
                          checked={formData.invoiceType === type}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-xs sm:text-sm font-medium">{type}</span>
                      </label>
                    ))}
                    <input
                      type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange}
                      className="glass-input w-full px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm"
                      placeholder="Sipariş No"
                    />
                  </div>
                  <ErrorMsg field="invoiceType" />
                </div>

                {/* Invoice PDF */}
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium mb-2">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Fatura PDF <span className="text-[var(--fusion-primary)]">*</span></span>
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
                          onClick={(e) => { e.stopPropagation(); setInvoicePdf(null); }}
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
                    ref={pdfInputRef} type="file" accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { setInvoicePdf(file); setErrors((p) => ({ ...p, invoicePdf: undefined })); }
                    }}
                  />
                  <ErrorMsg field="invoicePdf" />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Yorum veya Mesaj <span className="text-[var(--fusion-primary)]">*</span>
                  </label>
                  <textarea
                    name="message" value={formData.message} onChange={handleChange}
                    rows={4}
                    className={`glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl resize-none text-sm sm:text-base ${errors.message ? "border-[var(--fusion-error)]" : ""}`}
                    placeholder="Hatayı / Arızayı anlatan açıklama"
                  />
                  <ErrorMsg field="message" />
                </div>

                {/* Media Upload - Drag & Drop */}
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium mb-2">
                    <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Görsel / Video <span className="text-[var(--fusion-primary)]">*</span></span>
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => mediaInputRef.current?.click()}
                    className={`glass-input rounded-xl px-3 sm:px-4 py-5 sm:py-8 cursor-pointer text-center transition-all ${
                      dragActive
                        ? "border-[var(--fusion-primary)] bg-[var(--fusion-primary)]/5"
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
                    ref={mediaInputRef} type="file" multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setMediaFiles((prev) => [...prev, ...files]);
                      if (errors.media) setErrors((p) => ({ ...p, media: undefined }));
                      e.target.value = "";
                    }}
                  />
                  {mediaFiles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {mediaFiles.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-sm"
                        >
                          {file.type.startsWith("video/") ? (
                            <FileText className="w-4 h-4 text-[var(--fusion-info)] flex-shrink-0" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-[var(--fusion-success)] flex-shrink-0" />
                          )}
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            type="button" onClick={() => removeMedia(i)}
                            className="p-0.5 rounded hover:bg-[var(--glass-bg-hover)]"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <ErrorMsg field="media" />
                </div>

                {/* Return Address */}
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium mb-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Servis Sonrası Geri Gönderim Adresi <span className="text-[var(--fusion-primary)]">*</span></span>
                  </label>
                  <textarea
                    name="returnAddress" value={formData.returnAddress} onChange={handleChange}
                    rows={3}
                    className={`glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl resize-none text-sm sm:text-base ${errors.returnAddress ? "border-[var(--fusion-error)]" : ""}`}
                    placeholder="Cihazın tamiri/değişimi durumunda gönderilecek açık adresinizi belirtiniz."
                  />
                  <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                    Belirttiğiniz adresten farklı bir adrese gönderim istemeniz durumunda,{" "}
                    <a href="mailto:info@fusionmarkt.com" className="text-[var(--fusion-primary)] hover:underline">
                      info@fusionmarkt.com
                    </a>{" "}
                    adresine mail iletiniz.
                  </p>
                  <ErrorMsg field="returnAddress" />
                </div>

                {/* Checkboxes */}
                <div className="space-y-2 sm:space-y-4">
                  {/* Packaging Confirm */}
                  <label
                    className={`flex items-start gap-2 sm:gap-3 px-2.5 py-2 sm:p-4 rounded-lg sm:rounded-xl border cursor-pointer transition-all ${
                      formData.packagingConfirm
                        ? "border-[var(--fusion-success)]/30 bg-[var(--fusion-success)]/5"
                        : "border-[var(--glass-border)] bg-[var(--glass-bg)]"
                    } ${errors.packagingConfirm ? "border-[var(--fusion-error)]" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.packagingConfirm}
                      onChange={(e) => handleCheckbox("packagingConfirm", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-400 flex-shrink-0 flex items-center justify-center peer-checked:bg-[var(--fusion-success)] peer-checked:border-[var(--fusion-success)] transition-colors">
                      {formData.packagingConfirm && (
                        <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-sm font-medium leading-tight sm:leading-normal sm:mb-1">
                        Ürün Paketleme Onayı <span className="text-[var(--fusion-primary)]">*</span>
                      </p>
                      <p className="text-[10px] sm:text-xs text-[var(--foreground-tertiary)] leading-snug sm:leading-relaxed mt-0.5">
                        Aksesuarların eklendiğinden ve taşıma hasarı oluşmayacak şekilde paketlendiğinden emin olacağım. Taşıma hasarı sorumluluğunun bana ait olduğunu onaylıyorum.
                      </p>
                    </div>
                  </label>
                  <ErrorMsg field="packagingConfirm" />

                  {/* Fault Fee Confirm */}
                  <label
                    className={`flex items-start gap-2 sm:gap-3 px-2.5 py-2 sm:p-4 rounded-lg sm:rounded-xl border cursor-pointer transition-all ${
                      formData.faultFeeConfirm
                        ? "border-[var(--fusion-success)]/30 bg-[var(--fusion-success)]/5"
                        : "border-[var(--glass-border)] bg-[var(--glass-bg)]"
                    } ${errors.faultFeeConfirm ? "border-[var(--fusion-error)]" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.faultFeeConfirm}
                      onChange={(e) => handleCheckbox("faultFeeConfirm", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-400 flex-shrink-0 flex items-center justify-center peer-checked:bg-[var(--fusion-success)] peer-checked:border-[var(--fusion-success)] transition-colors">
                      {formData.faultFeeConfirm && (
                        <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-sm font-medium leading-tight sm:leading-normal sm:mb-1">
                        Arıza Tespit Onayı <span className="text-[var(--fusion-primary)]">*</span>
                      </p>
                      <p className="text-[10px] sm:text-xs text-[var(--foreground-tertiary)] leading-snug sm:leading-relaxed mt-0.5">
                        Garanti dışı durumda KDV dahil 1.200 TL arıza tespit ücretini ödemeyi kabul ediyorum.
                      </p>
                    </div>
                  </label>
                  <ErrorMsg field="faultFeeConfirm" />
                </div>

                {/* reCAPTCHA notice */}
                {RECAPTCHA_SITE_KEY && (
                  <p className="text-xs text-[var(--foreground-tertiary)] text-center">
                    Bu site Google reCAPTCHA ile korunmaktadır.{" "}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                      Gizlilik Politikası
                    </a>{" "}
                    ve{" "}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
                      Kullanım Şartları
                    </a>{" "}
                    geçerlidir.
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-[var(--fusion-primary)] text-white font-semibold hover:bg-[var(--fusion-primary-light)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Servis Talebi Gönder
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
