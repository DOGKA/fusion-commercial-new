"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { 
  Send,
  CheckCircle,
  AlertCircle,
  FileText,
  Warehouse,
  CircleAlert
} from "lucide-react";
import { getEmailError } from "@/lib/utils";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export default function IletisimPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // reCAPTCHA
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY) return null;
    try {
      const grecaptcha = (window as unknown as Record<string, { execute: (key: string, options: { action: string }) => Promise<string> }>).grecaptcha;
      if (!grecaptcha) return null;
      return await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact_form" });
    } catch {
      return null;
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Adınız ve soyadınız gereklidir";
    }

    // Email validation
    const emailError = getEmailError(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefon numarası gereklidir";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Mesajınız gereklidir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const recaptchaToken = await getRecaptchaToken();

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          recaptchaToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Mesaj gönderilemedi");
      }

      setIsSubmitted(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: "", email: "", phone: "", message: "" });
      }, 5000);
    } catch (error) {
      console.error("Contact form error:", error);
      alert(error instanceof Error ? error.message : "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // `data-page-root` bilerek YOK: politika sayfaları için yazılmış
  // `main > [data-page-root] > section:first-child` mobil kuralları buraya
  // sızıyor, rozeti 3.5rem'lik kareye sıkıştırıp form içindeki paragrafları
  // 0.75rem'e düşürüyordu. Bu ekranın mobil ölçüleri mobile.css'te
  // `.contact-page` altında.
  return (
    <div className="contact-page min-h-screen bg-[var(--background)]">
      {/* Hero, adres/ziyaret bilgilendirmesi ve iletişim formu */}
      <section className="relative pt-24 lg:pt-[120px] pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 hidden lg:block pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[var(--fusion-primary)]/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-[var(--fusion-secondary)]/10 rounded-full blur-[120px]" />
        </div>

        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20 mb-5 md:mb-6">
              <span className="text-sm font-medium text-[var(--fusion-primary)]">İletişim Formu</span>
            </div>
            <h1 className="text-[1.75rem] leading-tight sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              Bizimle İletişime Geçin
            </h1>
            <p className="text-[0.95rem] sm:text-lg text-[var(--foreground-secondary)]">
              Soru, sorun, görüş ve önerileriniz için formu doldurun. Talepleriniz 24 saat içinde yanıtlanır.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.5 }}
              className="space-y-4"
              aria-label="Adres ve ziyaret bilgileri"
            >
              <div className="glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl">
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold">Kurumsal adreslerimiz</h2>
                  <p className="mt-1 text-sm text-[var(--foreground-tertiary)]">
                    Ofis ve depo lokasyon bilgileri
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <Warehouse className="w-5 h-5 mt-0.5 text-[var(--fusion-primary)] flex-shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold mb-1">Ofis ve depo</h3>
                      <address className="not-italic text-sm sm:text-base leading-6 text-[var(--foreground-secondary)]">
                        Cezayir Caddesi No:6 Kat: 5 Ofis<br />
                        Kat: -2 Depo<br />
                        Çankaya / Ankara
                      </address>
                    </div>
                  </div>

                  <div className="h-px bg-[var(--glass-border)]" aria-hidden="true" />

                  <div className="flex items-start gap-3">
                    <Warehouse className="w-5 h-5 mt-0.5 text-[var(--fusion-primary)] flex-shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold mb-1">Merkez depo ve servis</h3>
                      <address className="not-italic text-sm sm:text-base leading-6 text-[var(--foreground-secondary)]">
                        Gölbaşı / Ankara
                      </address>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <CircleAlert className="w-5 h-5 mt-0.5 text-[var(--foreground-tertiary)] flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h2 className="font-semibold text-base sm:text-lg">Adreslerimiz hakkında</h2>
                    <div className="mt-2 space-y-2 text-sm sm:text-[0.95rem] leading-6 text-[var(--foreground-secondary)]">
                      <p>
                        Fusion Markt e-ticaret kanalı üzerinden hizmet vermektedir. Bu nedenle adreslerimizde
                        fiziki mağaza, showroom veya mağazadan teslim hizmeti sunulmuyor.
                      </p>
                      <p>
                        Teslimat ve iade süreçleri için iletişim formundan bize ulaşabilirsiniz.
                        Servis talepleriniz için{" "}
                        <Link
                          href="/servis-formu"
                          className="text-[var(--fusion-primary)] hover:underline"
                        >
                          servis formunu
                        </Link>{" "}
                        kullanabilirsiniz; ekibimiz gerekli yönlendirmeyi sizinle paylaşacaktır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
            <div className="glass-card p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--fusion-primary)] flex-shrink-0" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Mesajınızı iletin</h2>
                  <p className="text-sm text-[var(--foreground-tertiary)]">Tüm alanlar zorunludur</p>
                </div>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10 sm:py-12"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--fusion-success)]/10 flex items-center justify-center mx-auto mb-5 sm:mb-6">
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--fusion-success)]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Mesajınız Alındı!</h3>
                  <p className="text-[var(--foreground-secondary)]">
                    En kısa sürede size dönüş yapacağız.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Adınız ve Soyadınız <span className="text-[var(--fusion-primary)]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`glass-input w-full px-4 py-3 rounded-xl ${errors.name ? "border-[var(--fusion-error)]" : ""}`}
                      placeholder="Adınız Soyadınız"
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-sm text-[var(--fusion-error)] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      e-Posta Adresiniz <span className="text-[var(--fusion-primary)]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`glass-input w-full px-4 py-3 rounded-xl ${errors.email ? "border-[var(--fusion-error)]" : ""}`}
                      placeholder="ornek@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-[var(--fusion-error)] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Telefon Numaranız <span className="text-[var(--fusion-primary)]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`glass-input w-full px-4 py-3 rounded-xl ${errors.phone ? "border-[var(--fusion-error)]" : ""}`}
                      placeholder="+90 5XX XXX XX XX"
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-sm text-[var(--fusion-error)] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mesajınız <span className="text-[var(--fusion-primary)]">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className={`glass-input w-full px-4 py-3 rounded-xl resize-none ${errors.message ? "border-[var(--fusion-error)]" : ""}`}
                      placeholder="Mesajınızı buraya yazın..."
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-sm text-[var(--fusion-error)] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {RECAPTCHA_SITE_KEY && (
                    <p className="text-xs text-[var(--foreground-tertiary)] text-center">
                      Bu site Google reCAPTCHA ile korunmaktadır.{" "}
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Gizlilik Politikası</a>{" "}ve{" "}
                      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Kullanım Şartları</a>{" "}geçerlidir.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[52px] py-3.5 sm:py-4 rounded-xl bg-[var(--fusion-primary)] text-white font-semibold hover:bg-[var(--fusion-primary-light)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        Mesaj Gönder
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

