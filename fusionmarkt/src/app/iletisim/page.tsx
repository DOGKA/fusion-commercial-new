"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  RefreshCcw,
  FileText
} from "lucide-react";
import { getEmailError } from "@/lib/utils";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// WhatsApp SVG Icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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

  const contactCards = [
    {
      icon: Phone,
      title: "Telefon",
      value: "+90 850 840 6160",
      href: "tel:+908508406160",
      description: "Pazartesi - Cuma: 09:00 - 18:00",
      color: "var(--fusion-primary)"
    },
    {
      icon: Mail,
      title: "E-posta",
      value: "info@fusionmarkt.com",
      href: "mailto:info@fusionmarkt.com",
      description: "24 saat içinde yanıtlıyoruz",
      color: "var(--fusion-secondary)"
    },
    {
      icon: MapPin,
      title: "Adres",
      value: "Çankaya, Ankara",
      href: "",
      description: "Cezayir Cad. No:6 Kat:5 Ofis, Kat:-2 Depo",
      color: "var(--fusion-success)"
    }
  ];

  const quickLinks = [
    {
      icon: Shield,
      title: "Gizlilik Politikası",
      href: "/gizlilik-politikasi",
      color: "var(--fusion-info)"
    },
    {
      icon: RefreshCcw,
      title: "İade ve Değişim",
      href: "/iade-politikasi",
      color: "var(--fusion-warning)"
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative pb-16 md:pb-24 overflow-hidden" style={{ paddingTop: "120px" }}>
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[var(--fusion-primary)]/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-[var(--fusion-secondary)]/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20 mb-6"
            >
              <span className="text-sm font-medium text-[var(--fusion-primary)]">7/24 Destek</span>
            </motion.div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Bizimle İletişime Geçin
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              Ürün ve hizmetlerimiz ile alakalı soru, sorun, görüş ve önerileriniz için bizimle iletişime geçin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTACT CARDS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {contactCards.map((card, index) => {
              const CardWrapper = card.href ? motion.a : motion.div;
              const linkProps = card.href ? {
                href: card.href,
                target: card.href.startsWith("http") ? "_blank" : undefined,
                rel: card.href.startsWith("http") ? "noopener noreferrer" : undefined,
              } : {};
              
              return (
                <CardWrapper
                  key={index}
                  {...linkProps}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="glass-card p-6 rounded-2xl group hover:border-[var(--glass-border-hover)] transition-all"
                >
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${card.color}15` }}
                  >
                    <card.icon className="w-7 h-7" style={{ color: card.color }} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                  <p className="text-[var(--foreground)] font-medium mb-2">{card.value}</p>
                  <p className="text-sm text-[var(--foreground-tertiary)]">
                    {card.description}
                  </p>
                </CardWrapper>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT - Form & WhatsApp
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
              
              {/* Contact Form - 3 columns */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-3"
              >
                <div className="glass-card p-8 md:p-10 rounded-3xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[var(--fusion-primary)]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">İletişim Formu</h2>
                      <p className="text-sm text-[var(--foreground-tertiary)]">Mesajınızı bize iletin</p>
                    </div>
                  </div>

                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 rounded-full bg-[var(--fusion-success)]/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-[var(--fusion-success)]" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Mesajınız Alındı!</h3>
                      <p className="text-[var(--foreground-secondary)]">
                        En kısa sürede size dönüş yapacağız.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Adınız ve Soyadınız <span className="text-[var(--fusion-primary)]">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`glass-input w-full px-4 py-3 rounded-xl ${errors.name ? 'border-[var(--fusion-error)]' : ''}`}
                          placeholder="Adınız Soyadınız"
                        />
                        {errors.name && (
                          <p className="mt-1.5 text-sm text-[var(--fusion-error)] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          e-Posta Adresiniz <span className="text-[var(--fusion-primary)]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`glass-input w-full px-4 py-3 rounded-xl ${errors.email ? 'border-[var(--fusion-error)]' : ''}`}
                          placeholder="ornek@email.com"
                        />
                        {errors.email && (
                          <p className="mt-1.5 text-sm text-[var(--fusion-error)] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Telefon Numaranız <span className="text-[var(--fusion-primary)]">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`glass-input w-full px-4 py-3 rounded-xl ${errors.phone ? 'border-[var(--fusion-error)]' : ''}`}
                          placeholder="+90 5XX XXX XX XX"
                        />
                        {errors.phone && (
                          <p className="mt-1.5 text-sm text-[var(--fusion-error)] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Mesajınız <span className="text-[var(--fusion-primary)]">*</span>
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          className={`glass-input w-full px-4 py-3 rounded-xl resize-none ${errors.message ? 'border-[var(--fusion-error)]' : ''}`}
                          placeholder="Mesajınızı buraya yazın..."
                        />
                        {errors.message && (
                          <p className="mt-1.5 text-sm text-[var(--fusion-error)] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errors.message}
                          </p>
                        )}
                      </div>

                      {/* reCAPTCHA notice */}
                      {RECAPTCHA_SITE_KEY && (
                        <p className="text-xs text-[var(--foreground-tertiary)] text-center">
                          Bu site Google reCAPTCHA ile korunmaktadır.{" "}
                          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Gizlilik Politikası</a>{" "}ve{" "}
                          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Kullanım Şartları</a>{" "}geçerlidir.
                        </p>
                      )}

                      {/* Submit Button */}
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
                            Mesaj Gönder
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>

              {/* Sidebar - 2 columns */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-2 space-y-6 w-full"
              >
                {/* WhatsApp Card */}
                <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/20 rounded-full blur-[60px]" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                        <WhatsAppIcon />
                      </div>
                      <div>
                        <h3 className="font-bold">WhatsApp Hattı</h3>
                        <p className="text-sm text-[var(--foreground-tertiary)]">Hızlı destek için</p>
                      </div>
                    </div>
                    
                    <p className="text-[var(--foreground-secondary)] mb-6 text-sm">
                      Belirli bir ürün hakkında sorunuz mu var? WhatsApp hattımızla hızlıca görüşme başlatın.
                    </p>

                    <a
                      href="https://wa.me/908508406160"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#22c35e] transition-colors group"
                    >
                      <WhatsAppIcon />
                      Görüşme Başlat
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="glass-card p-6 rounded-2xl w-full">
                  <h3 className="font-bold mb-4">Hızlı Bağlantılar</h3>
                  <div className="space-y-3 w-full">
                    {quickLinks.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] hover:border-[var(--glass-border-hover)] transition-all group w-full"
                      >
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${link.color}15` }}
                        >
                          <link.icon className="w-5 h-5" style={{ color: link.color }} />
                        </div>
                        <span className="font-medium flex-1">{link.title}</span>
                        <ArrowRight className="w-4 h-4 text-[var(--foreground-tertiary)] group-hover:text-[var(--foreground)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

