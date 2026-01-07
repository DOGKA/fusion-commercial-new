"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Cookie, X, Check, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCookieConsent, CookiePreferences } from "@/context/CookieConsentContext";

type BannerPosition = "bottom" | "top" | "center";

interface BannerConfig {
  enabled: boolean;
  position: BannerPosition;
  text: string;
  defaultAnalytics: boolean;
  defaultMarketing: boolean;
  defaultPreferences: boolean;
}

export default function CookieConsent() {
  const {
    preferences,
    hasConsent,
    isLoaded,
    acceptNecessary,
    updatePreferences,
  } = useCookieConsent();

  const [bannerConfig, setBannerConfig] = useState<BannerConfig | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Local prefs için kullanıcı değişikliklerini takip et
  const [userModifiedPrefs, setUserModifiedPrefs] = useState<Partial<CookiePreferences> | null>(null);

  // Load banner config from DB-backed public settings
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/public/settings");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setBannerConfig({
          enabled: data.cookieBannerEnabled ?? true,
          position: (data.cookieBannerPosition as BannerPosition) || "bottom",
          text:
            data.cookieBannerText ||
            "Size en iyi deneyimi sunmak için çerezler kullanıyoruz.",
          defaultAnalytics: data.cookieDefaultAnalytics ?? true,
          defaultMarketing: data.cookieDefaultMarketing ?? false,
          defaultPreferences: data.cookieDefaultPreferences ?? true,
        });
      } catch {
        // Ignore – fall back to current UI defaults
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Derive localPrefs from context/config - no setState in effect
  const localPrefs = useMemo((): CookiePreferences => {
    // Kullanıcı değişiklik yaptıysa onu kullan
    if (userModifiedPrefs) {
      return { ...preferences, ...userModifiedPrefs };
    }
    // Kullanıcı daha önce tercih yaptıysa onu kullan
    if (hasConsent) {
      return preferences;
    }
    // Yeni kullanıcı - admin varsayılanlarını kullan
    if (bannerConfig) {
      return {
        ...preferences,
        analytics: bannerConfig.defaultAnalytics,
        marketing: bannerConfig.defaultMarketing,
        preferences: bannerConfig.defaultPreferences,
      };
    }
    return preferences;
  }, [preferences, hasConsent, bannerConfig, userModifiedPrefs]);

  // setLocalPrefs yerine userModifiedPrefs'i güncelle
  const setLocalPrefs = useCallback((newPrefs: CookiePreferences | ((prev: CookiePreferences) => CookiePreferences)) => {
    if (typeof newPrefs === 'function') {
      setUserModifiedPrefs(prev => {
        const currentPrefs = prev ? { ...preferences, ...prev } : preferences;
        const updated = newPrefs(currentPrefs as CookiePreferences);
        return updated;
      });
    } else {
      setUserModifiedPrefs(newPrefs);
    }
  }, [preferences]);

  // Show banner for first-time visitors
  useEffect(() => {
    if (bannerConfig && !bannerConfig.enabled) return;
    if (isLoaded && !hasConsent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, hasConsent, bannerConfig]);

  const handleAcceptAll = () => {
    // Use admin defaults (stored in localPrefs) instead of accepting everything
    updatePreferences(localPrefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptNecessary = () => {
    acceptNecessary();
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSaveCustom = () => {
    updatePreferences(localPrefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!isLoaded) return null;
  if (bannerConfig && !bannerConfig.enabled) return null;

  const position: BannerPosition = bannerConfig?.position || "bottom";
  const modalWrapperClass =
    position === "center"
      ? "fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      : position === "top"
      ? "fixed top-4 right-4 md:top-6 md:right-6 z-[9999] w-[calc(100%-32px)] max-w-md"
      : "fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] w-[calc(100%-32px)] max-w-md";

  const floatingButtonClass =
    position === "center"
      ? "fixed bottom-4 right-4 md:bottom-6 md:right-6"
      : position === "top"
      ? "fixed top-4 right-4 md:top-6 md:right-6"
      : "fixed bottom-4 right-4 md:bottom-6 md:right-6";

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          FLOATING COOKIE BUTTON - Sağ alt köşe
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {hasConsent && !showBanner && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={() => setShowBanner(true)}
            className={`${floatingButtonClass} z-[9990] w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl flex items-center justify-center group bg-background-elevated dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#141414] border border-border`}
            aria-label="Çerez Ayarları"
          >
            <Cookie className="w-5 h-5 md:w-6 md:h-6 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          COOKIE MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showBanner && (
          <>
            {/* Backdrop - sadece koyu overlay, blur yok */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[9998]"
              onClick={() => hasConsent && setShowBanner(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ x: 100, y: 100, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, y: 100, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={modalWrapperClass}
            >
              <div
                className="relative overflow-hidden rounded-2xl border border-border bg-background-elevated dark:bg-gradient-to-br dark:from-[#121212] dark:to-[#0a0a0a] backdrop-blur-2xl shadow-2xl"
              >
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />

                {/* Close button */}
                {hasConsent && (
                  <button
                    onClick={() => setShowBanner(false)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground-muted hover:text-foreground transition-all z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="p-5 md:p-6">
                  {!showSettings ? (
                    // SIMPLE VIEW
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                          <Cookie className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-foreground font-bold text-lg">Çerez Kullanımı</h3>
                          <p className="text-foreground-muted text-xs">fusionmarkt.com</p>
                        </div>
                      </div>

                      <p className="text-sm text-foreground-secondary leading-relaxed mb-5">
                        {(bannerConfig?.text || "Size en iyi deneyimi sunmak için çerezler kullanıyoruz.")} Detaylı bilgi için{" "}
                        <Link
                          href="/cerez-politikasi"
                          className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
                        >
                          Çerez Politikası
                        </Link>
                        {"'"}mızı inceleyebilirsiniz.
                      </p>

                      {/* Butonlar - Mobilde ve webde tek satır */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowSettings(true)}
                          className="flex items-center justify-center gap-1 px-2.5 py-2.5 rounded-xl border border-border text-foreground-secondary hover:text-foreground hover:bg-foreground/5 hover:border-border-hover transition-all text-xs sm:text-sm font-medium whitespace-nowrap"
                        >
                          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Ayarlar</span>
                        </button>
                        <button
                          onClick={handleAcceptNecessary}
                          className="flex items-center justify-center px-2.5 py-2.5 rounded-xl border border-border text-foreground-secondary hover:text-foreground hover:bg-foreground/5 hover:border-border-hover transition-all text-xs sm:text-sm font-medium whitespace-nowrap"
                        >
                          <span className="sm:hidden">Gerekli</span>
                          <span className="hidden sm:inline">Sadece Gerekli</span>
                        </button>
                        <button
                          onClick={handleAcceptAll}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all hover:brightness-110 whitespace-nowrap"
                          style={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                          }}
                        >
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Kabul Et</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // SETTINGS VIEW
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowSettings(false)}
                            className="w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground-secondary hover:text-foreground transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <h3 className="text-foreground font-bold text-lg">Çerez Tercihleri</h3>
                        </div>
                      </div>

                      <div className="space-y-2.5 mb-5">
                        <CookieOption
                          title="Zorunlu Çerezler"
                          description="Site işlevselliği için gerekli"
                          checked={true}
                          disabled={true}
                          onChange={() => {}}
                        />
                        <CookieOption
                          title="Analitik Çerezler"
                          description="Google Analytics - ziyaretçi istatistikleri"
                          checked={localPrefs.analytics}
                          onChange={(c) => setLocalPrefs({ ...localPrefs, analytics: c })}
                        />
                        <CookieOption
                          title="Pazarlama Çerezleri"
                          description="Google Ads, Facebook - kişiselleştirilmiş reklamlar"
                          checked={localPrefs.marketing}
                          onChange={(c) => setLocalPrefs({ ...localPrefs, marketing: c })}
                        />
                        <CookieOption
                          title="Tercih Çerezleri"
                          description="Dil, tema ve bölge tercihleri"
                          checked={localPrefs.preferences}
                          onChange={(c) => setLocalPrefs({ ...localPrefs, preferences: c })}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleAcceptNecessary}
                          className="flex-1 flex items-center justify-center px-3 py-2.5 rounded-xl border border-border text-foreground-secondary hover:text-foreground hover:bg-foreground/5 hover:border-border-hover transition-all text-sm font-medium"
                        >
                          Sadece Gerekli
                        </button>
                        <button
                          onClick={handleSaveCustom}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-110"
                          style={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                          }}
                        >
                          <Check className="w-4 h-4" />
                          <span>Kaydet</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CookieOption({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
        disabled
          ? "bg-foreground/[0.02] border-border/50 cursor-not-allowed opacity-60"
          : checked
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-foreground/[0.02] border-border/50 hover:border-border"
      }`}
    >
      <div
        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
          disabled ? "bg-foreground/10" : checked ? "bg-emerald-500" : "bg-foreground/15"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-medium">{title}</span>
          {disabled && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-foreground/10 text-foreground-muted uppercase tracking-wide">
              Zorunlu
            </span>
          )}
        </div>
        <p className="text-xs text-foreground-muted">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
    </label>
  );
}
