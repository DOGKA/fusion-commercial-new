"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Send,
  CheckCircle,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  Stethoscope,
  PackageSearch,
  Info,
} from "lucide-react";
import {
  findModel,
  type DiagnosticAnswers,
  type ProductCategoryId,
  type ProductModel,
} from "@/lib/service-form/models";
import { StepIndicator, type StepDefinition } from "./_components/StepIndicator";
import { ProductStep } from "./_components/ProductStep";
import type { ContactFormData } from "./_components/ContactStep";

const DiagnosticsStep = dynamic(
  () => import("./_components/DiagnosticsStep").then((m) => m.DiagnosticsStep),
  {
    loading: () => (
      <div className="py-12 text-center text-sm text-[var(--foreground-tertiary)]">
        Teşhis soruları yükleniyor...
      </div>
    ),
  }
);

const ContactStep = dynamic(
  () => import("./_components/ContactStep").then((m) => m.ContactStep),
  {
    loading: () => (
      <div className="py-12 text-center text-sm text-[var(--foreground-tertiary)]">
        Form yükleniyor...
      </div>
    ),
  }
);

// reCAPTCHA - optional, only loads if site key is configured
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

interface FormErrors {
  [key: string]: string | undefined;
}

const STEPS: StepDefinition[] = [
  { id: 1, label: "Ürün Seçimi" },
  { id: 2, label: "Arıza Teşhisi" },
  { id: 3, label: "İletişim ve Belgeler" },
];

const STEP_HEADERS: Record<
  number,
  { icon: typeof ClipboardList; title: string; subtitle: string }
> = {
  1: {
    icon: PackageSearch,
    title: "Ürün Seçimi",
    subtitle: "Servis talebi oluşturacağınız ürünü seçiniz",
  },
  2: {
    icon: Stethoscope,
    title: "Arıza Teşhisi",
    subtitle: "Soruları cihazınızın güncel durumuna göre yanıtlayınız",
  },
  3: {
    icon: ClipboardList,
    title: "İletişim ve Belgeler",
    subtitle: "* ile işaretli alanlar zorunludur",
  },
};

const EMPTY_FORM: ContactFormData = {
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
};

export default function ServisFormuPage() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ProductCategoryId | null>(null);
  const [model, setModel] = useState<ProductModel | null>(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [answers, setAnswers] = useState<DiagnosticAnswers>({});

  const [formData, setFormData] = useState<ContactFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [invoicePdf, setInvoicePdf] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  /** Bir kez açılan adımlar DOM'da kalır — geri/ileri geçişte yeniden chunk yüklenmez. */
  const [mountedSteps, setMountedSteps] = useState<ReadonlySet<number>>(() => new Set([1]));
  const cardRef = useRef<HTMLDivElement>(null);

  /**
   * Sipariş numarasını URL'den ön-doldurur (Hesabım → talep panelindeki
   * "Ürünümde arıza var" satırı `?siparis=<numara>` ile buraya geliyor).
   *
   * Neden `useSearchParams` değil: bu sayfa statik üretiliyor ve o hook
   * bileşeni `Suspense` sınırına zorluyor — denendi, formun tamamı önceden
   * üretilen HTML'den düşüyor ve sayfa hidrasyona kadar boş kalıyordu.
   * Hidrasyondan sonra okumak statik HTML'i olduğu gibi bırakıyor.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderFromUrl = params.get("siparis")?.trim().slice(0, 32);
    if (orderFromUrl) {
      // Kullanıcı bu arada elle yazdıysa üzerine yazma.
      setFormData((prev) => (prev.orderNumber ? prev : { ...prev, orderNumber: orderFromUrl }));
    }
    const modelFromUrl = findModel(params.get("model")?.trim() ?? null);
    if (modelFromUrl) {
      setCategory(modelFromUrl.category);
      setModel(modelFromUrl);
    }
  }, []);

  useEffect(() => {
    setMountedSteps((prev) => {
      if (prev.has(step)) return prev;
      const next = new Set(prev);
      next.add(step);
      return next;
    });
  }, [step]);

  // Model seçilince sonraki adım chunk'larını arka planda ısıt.
  useEffect(() => {
    if (!model) return;
    void import("./_components/DiagnosticsStep");
    void import("@/lib/service-form/diagnostics");
    void import("./_components/ContactStep");
  }, [model]);

  // reCAPTCHA yalnızca gönderim adımında yüklenir — ilk boyamayı bloke etmesin.
  useEffect(() => {
    if (step !== 3 || !RECAPTCHA_SITE_KEY) return;
    if (document.querySelector(`script[src*="recaptcha/api.js"]`)) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
  }, [step]);

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

  const goToStep = (next: number) => {
    setStep(next);
    // smooth scroll mobil Safari'de geçiş hissini yavaşlatıyor
    cardRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  };

  const validateProductStep = (): boolean => {
    const newErrors: FormErrors = {};
    if (!category) newErrors.category = "Ürün kategorisi seçiniz";
    if (!model) newErrors.model = "Ürün modeli seçiniz";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!validateProductStep()) {
        cardRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
      setErrors({});
      // Teşhis bileşenini adım değişmeden önce hazırla (prefetch kaçırılmışsa).
      await Promise.all([
        import("./_components/DiagnosticsStep"),
        import("@/lib/service-form/diagnostics"),
      ]);
      goToStep(2);
      return;
    }

    if (!model) return;
    const [{ validateDiagnostics }] = await Promise.all([
      import("@/lib/service-form/diagnostics"),
      import("./_components/ContactStep"),
    ]);
    const newErrors = validateDiagnostics(model, answers);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      cardRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }
    setErrors({});
    goToStep(3);
  };

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
    // Enter tuşu ara adımlarda formu göndermesin.
    if (step !== 3) return;
    if (!model) {
      goToStep(1);
      return;
    }
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = await getRecaptchaToken();
      const { pruneHiddenAnswers, buildDiagnosticSummary } = await import(
        "@/lib/service-form/diagnostics"
      );
      const diagnosticAnswers = pruneHiddenAnswers(model, answers);

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

      fd.append("productCategory", model.category);
      fd.append("productModelId", model.id);
      fd.append("productModel", model.label);
      if (serialNumber.trim()) fd.append("serialNumber", serialNumber.trim());
      fd.append("diagnostics", JSON.stringify(diagnosticAnswers));
      fd.append(
        "diagnosticsSummary",
        JSON.stringify(buildDiagnosticSummary(model, diagnosticAnswers))
      );

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

  const handleCategoryChange = (next: ProductCategoryId) => {
    if (next === category) return;
    setCategory(next);
    setModel(null);
    setAnswers({});
    setErrors({});
  };

  const handleModelChange = (next: ProductModel) => {
    if (next.id === model?.id) return;
    setModel(next);
    // Sorular modele göre değiştiği için önceki cevaplar geçerliliğini yitiriyor.
    setAnswers({});
    setErrors((prev) => ({ ...prev, model: undefined }));
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) setErrors((prev) => ({ ...prev, [questionId]: undefined }));
  };

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
    setMediaFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    if (errors.media) setErrors((prev) => ({ ...prev, media: undefined }));
  };

  const handleMediaAdd = (files: File[]) => {
    setMediaFiles((prev) => [...prev, ...files]);
    if (errors.media) setErrors((prev) => ({ ...prev, media: undefined }));
  };

  const handleInvoicePdfChange = (file: File | null) => {
    setInvoicePdf(file);
    if (file && errors.invoicePdf) setErrors((prev) => ({ ...prev, invoicePdf: undefined }));
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setStep(1);
    setCategory(null);
    setModel(null);
    setSerialNumber("");
    setAnswers({});
    setFormData(EMPTY_FORM);
    setErrors({});
    setInvoicePdf(null);
    setMediaFiles([]);
  };

  // Success state
  if (isSubmitted) {
    return (
      <div data-page-root className="min-h-screen bg-[var(--background)]">
        <div className="container px-4 md:px-6" style={{ paddingTop: "140px", paddingBottom: "80px" }}>
          <div className="max-w-lg mx-auto text-center glass-card p-12 rounded-3xl animate-[scaleIn_0.4s_ease-out_both]">
            <div className="w-20 h-20 rounded-full bg-[var(--fusion-success)]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[var(--fusion-success)]" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Servis Talebiniz Alındı!</h2>
            <p className="text-[var(--foreground-secondary)] mb-6">
              Talebiniz incelemeye alınmıştır. En kısa sürede e-posta adresinize dönüş yapılacaktır.
            </p>
            <button
              onClick={resetForm}
              className="px-8 py-3 rounded-xl bg-[var(--fusion-primary)] text-white font-semibold hover:bg-[var(--fusion-primary-light)] transition-colors"
            >
              Yeni Talep Oluştur
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepHeader = STEP_HEADERS[step];
  const StepIcon = stepHeader.icon;
  const selectedModelLabel = model?.label;

  return (
    <div data-page-root className="min-h-screen bg-[var(--background)] overflow-x-hidden">
      {/* Hero */}
      <section className="relative pb-8 md:pb-12" style={{ paddingTop: "120px" }}>
        <div className="container px-4 md:px-6 relative">
          <div className="max-w-3xl mx-auto text-center px-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Servis Formu
            </h1>
            <p className="text-base md:text-lg text-[var(--foreground-secondary)]">
              Ürününüzle ilgili arıza veya sorun bildirimi için aşağıdaki formu eksiksiz doldurunuz.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div
              ref={cardRef}
              className="glass-card-static p-4 sm:p-6 md:p-10 rounded-3xl overflow-hidden scroll-mt-28"
            >
              <StepIndicator steps={STEPS} current={step} onStepClick={goToStep} />

              <div className="flex items-center gap-3 mb-6">
                <StepIcon className="w-6 h-6 text-[var(--foreground-secondary)] flex-shrink-0" />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{stepHeader.title}</h2>
                  <p className="text-sm text-[var(--foreground-tertiary)]">{stepHeader.subtitle}</p>
                </div>
              </div>

              {step < 3 && (
                <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-[var(--fusion-info)]/30 bg-[var(--fusion-info)]/5 px-3 py-3">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--fusion-info)]" />
                  <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] leading-relaxed">
                    Vereceğiniz bilgilerin doğru ve eksiksiz olması, servis sürecinin hızlı ve
                    hatasız ilerlemesini sağlar. Yanıtlarınız sayesinde teknik ekibimiz cihaz elimize
                    ulaşmadan ön inceleme yapabilir. Eksik veya hatalı bilgi, sürecin uzamasına ve
                    garanti değerlendirmesinin yanlış sonuçlanmasına yol açabilir.
                  </p>
                </div>
              )}

              {step > 1 && selectedModelLabel && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5">
                  <PackageSearch className="w-4 h-4 flex-shrink-0 text-[var(--foreground-secondary)]" />
                  <span className="text-sm truncate">
                    <span className="text-[var(--foreground-tertiary)]">Seçilen ürün: </span>
                    <span className="font-medium">{selectedModelLabel}</span>
                    {serialNumber.trim() && (
                      <span className="text-[var(--foreground-tertiary)]">
                        {" "}
                        · SN: {serialNumber.trim()}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="ml-auto text-xs text-[var(--foreground-secondary)] hover:underline flex-shrink-0"
                  >
                    Değiştir
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {mountedSteps.has(1) && (
                  <div hidden={step !== 1}>
                    <ProductStep
                      category={category}
                      model={model}
                      serialNumber={serialNumber}
                      errors={errors}
                      onCategoryChange={handleCategoryChange}
                      onModelChange={handleModelChange}
                      onSerialNumberChange={setSerialNumber}
                    />
                  </div>
                )}

                {mountedSteps.has(2) && model && (
                  <div hidden={step !== 2}>
                    <DiagnosticsStep
                      model={model}
                      answers={answers}
                      errors={errors}
                      onChange={handleAnswerChange}
                    />
                  </div>
                )}

                {mountedSteps.has(3) && (
                  <div hidden={step !== 3}>
                    <ContactStep
                      formData={formData}
                      errors={errors}
                      invoicePdf={invoicePdf}
                      mediaFiles={mediaFiles}
                      dragActive={dragActive}
                      recaptchaEnabled={Boolean(RECAPTCHA_SITE_KEY)}
                      onChange={handleChange}
                      onCheckbox={handleCheckbox}
                      onInvoicePdfChange={handleInvoicePdfChange}
                      onMediaAdd={handleMediaAdd}
                      onMediaRemove={(index) =>
                        setMediaFiles((prev) => prev.filter((_, i) => i !== index))
                      }
                      onDrag={handleDrag}
                      onDrop={handleDrop}
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => goToStep(step - 1)}
                      className="px-4 sm:px-6 py-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] font-semibold hover:border-[var(--glass-border-hover)] transition-all flex items-center justify-center gap-2 flex-shrink-0"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span className="hidden sm:inline">Geri</span>
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 py-4 rounded-xl bg-[var(--fusion-primary)] text-white font-semibold hover:bg-[var(--fusion-primary-light)] transition-all flex items-center justify-center gap-2"
                    >
                      Devam Et
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-4 rounded-xl bg-[var(--fusion-primary)] text-white font-semibold hover:bg-[var(--fusion-primary-light)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Servis Talebi Gönder
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
