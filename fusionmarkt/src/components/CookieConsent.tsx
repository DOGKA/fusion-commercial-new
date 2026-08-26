"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Cookie, X, Check, Settings } from "lucide-react";
import { useCookieConsent, CookiePreferences } from "@/context/CookieConsentContext";
import type { CookieBannerConfig } from "@/lib/cookie-banner-settings";

/**
 * Giriş/çıkış animasyonları CSS'e taşındı.
 *
 * Bu bileşen framer-motion'ın kök layout'taki tek kullanıcısıydı; `ssr:false`
 * olduğu için chunk ancak hidrasyondan SONRA iniyor ve banner boyanana kadar
 * geçen süre her sayfada LCP'yi belirliyordu. Yalnız iki animasyon için ~115 KB
 * kütüphane taşımanın karşılığı yok — davranış aynı: modalın giriş animasyonu
 * yok (`initial={false}` idi), yalnızca çıkışta kayarak küçülüyor.
 */
const EXIT_DURATION_MS = 220;

const cookieConsentAnimations = `
  .cookie-consent-backdrop {
    animation: cookieConsentFadeIn 200ms ease-out;
  }
  .cookie-consent-backdrop.is-closing {
    animation: cookieConsentFadeOut ${EXIT_DURATION_MS}ms ease-in forwards;
  }
  .cookie-consent-modal.is-closing {
    animation: cookieConsentExit ${EXIT_DURATION_MS}ms cubic-bezier(0.4, 0, 1, 1) forwards;
  }
  @keyframes cookieConsentFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes cookieConsentFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  @keyframes cookieConsentExit {
    from { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
    to { transform: translate3d(100px, 100px, 0) scale(0.8); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cookie-consent-backdrop,
    .cookie-consent-backdrop.is-closing,
    .cookie-consent-modal.is-closing {
      animation-duration: 1ms;
    }
  }
`;

export default function CookieConsent({ config: bannerConfig }: { config: CookieBannerConfig }) {
  const {
    preferences,
    hasConsent,
    isLoaded,
    acceptNecessary,
    updatePreferences,
  } = useCookieConsent();

  // Sunucuda da `true`: bant ilk HTML'e giriyor, görünürlüğünü head'deki inline
  // script'in eklediği `cookie-consent-pending` sınıfı belirliyor. Eskiden `false`
  // başlayıp bir effect ile açılıyordu, yani bant ancak hidrasyondan sonra
  // boyanıyor ve LCP'nin neredeyse tamamını render gecikmesi oluşturuyordu.
  const [showBanner, setShowBanner] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  // Onay vermiş ziyaretçide `cookie-consent-pending` sınıfı yok, yani CSS bandı
  // gizli tutuyor. Alt bilgideki "Çerez Ayarları" bağlantısı bandı yeniden
  // açtığında o gizlemeyi geçersiz kılmak gerekiyor.
  const [forceVisible, setForceVisible] = useState(false);
  
  // Local prefs için kullanıcı değişikliklerini takip et
  const [userModifiedPrefs, setUserModifiedPrefs] = useState<Partial<CookiePreferences> | null>(null);

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
    return {
      ...preferences,
      analytics: bannerConfig.defaultAnalytics,
      marketing: bannerConfig.defaultMarketing,
      preferences: bannerConfig.defaultPreferences,
    };
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

  // İlk ziyaretçi tespiti artık sunucuda yapılıyor; buradaki localStorage
  // kontrolü ve `setShowBanner(true)` effect'i gereksizdi. Onay yalnızca
  // localStorage'da kalmışsa (çerez silinmişse) render koşulundaki `!hasConsent`
  // bandı hidrasyondan hemen sonra zaten söküyor.

  // layout.tsx'teki inline script "Kabul Et" ve "Sadece Gerekli" tıklamalarını
  // hidrasyondan önce yanıtlıyor. Aşağıdaki handler'lar bağlandığı an script
  // devri teslim ediyor: bandı alt bilgiden yeniden açan ziyaretçinin mevcut
  // tercihlerini koruması gerekiyor ve o bilgi yalnızca React tarafında var.
  useEffect(() => {
    window.__fmCookieConsentReady = true;
    return () => {
      window.__fmCookieConsentReady = false;
    };
  }, []);

  // Allow reopening cookie settings from anywhere (e.g. footer link)
  useEffect(() => {
    const handleOpen = () => {
      setShowSettings(true);
      setShowBanner(true);
      setForceVisible(true);
    };
    window.addEventListener("openCookieSettings", handleOpen);
    return () => window.removeEventListener("openCookieSettings", handleOpen);
  }, []);

  // INP optimizasyonu: Ağır consent-kaydetme işini (localStorage + cookie yazımı,
  // gtag consent update, context'in tüm app'i yeniden render etmesi) ilk paint'ten
  // SONRAYA ertele. Böylece tıklamanın "next paint"i (banner kapanış animasyonu)
  // anında olur → düşük INP.
  const deferConsentWork = useCallback((work: () => void) => {
    requestAnimationFrame(() => {
      setTimeout(work, 0);
    });
  }, []);

  // AnimatePresence'in yerini alır: önce çıkış sınıfını basar, animasyon bitince
  // ağaçtan söker.
  const closeBanner = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      setShowBanner(false);
      setShowSettings(false);
    }, EXIT_DURATION_MS);
  }, []);

  const handleAcceptAll = () => {
    closeBanner();
    // Use admin defaults (stored in localPrefs) instead of accepting everything
    deferConsentWork(() => updatePreferences(localPrefs));
  };

  const handleAcceptNecessary = () => {
    closeBanner();
    deferConsentWork(() => acceptNecessary());
  };

  const handleSaveCustom = () => {
    closeBanner();
    deferConsentWork(() => updatePreferences(localPrefs));
  };

  if (!isLoaded) return null;
  if (!bannerConfig.enabled) return null;

  const position = bannerConfig.position;
  const modalWrapperClass =
    position === "center"
      ? "fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      : position === "top"
      ? "fixed top-4 right-4 md:top-6 md:right-6 z-[9999] w-[calc(100%-32px)] max-w-md"
      : "fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] w-[calc(100%-32px)] max-w-md";

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          COOKIE MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {/* `isClosing` bilerek diğer koşulları kısa devre ettiriyor: onay kaydedilince
          `hasConsent` anında true oluyor ve banner çıkış animasyonu oynayamadan
          sökülüyordu. AnimatePresence bunu kendisi hallediyordu. */}
      {(isClosing || (showBanner && (!hasConsent || showSettings))) && (
          <div className={`cookie-consent-root${forceVisible ? " is-visible" : ""}`}>
            {/* Backdrop - sadece koyu overlay, blur yok */}
            <div
              className={`cookie-consent-backdrop fixed inset-0 bg-black/40 z-[9998] ${isClosing ? "is-closing" : ""}`}
              onClick={() => hasConsent && closeBanner()}
            />

            {/* Modal */}
            <div className={`cookie-consent-modal ${modalWrapperClass} ${isClosing ? "is-closing" : ""}`}>
              <div
                className="relative overflow-hidden rounded-2xl border border-border bg-background-elevated backdrop-blur-2xl shadow-2xl"
              >
                {/* Close button */}
                {hasConsent && (
                  <button
                    onClick={closeBanner}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center text-foreground-muted hover:text-foreground transition-all z-10"
                    aria-label="Çerez bildirimini kapat"
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
                        {bannerConfig.text} Detaylı bilgi için{" "}
                        {/* Renk `dark:` varyantı yerine token ile veriliyor: projede
                            @custom-variant dark tanımlı olmadığı için dark:text-amber-400
                            .dark class'ıyla tetiklenmiyordu ve link koyu temada
                            amber-700 kalıp 3.26:1 kontrastta kalıyordu. */}
                        <Link
                          href="/cerez-politikasi"
                          className="text-[var(--badge-warning-text)] underline underline-offset-2 transition-opacity hover:opacity-80"
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
                          aria-label="Çerez ayarları"
                        >
                          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Ayarlar</span>
                        </button>
                        {/* `data-cc-action`: layout.tsx'teki inline script bu iki butonu
                            hidrasyondan önce yakalayıp onayı kendisi yazıyor. Bant ilk
                            HTML'de göründüğü için ilk tıklama React yüklenmeden geliyordu
                            ve INP'yi tek başına 1s'in üstüne çıkarıyordu. */}
                        <button
                          data-cc-action="necessary"
                          onClick={handleAcceptNecessary}
                          className="flex items-center justify-center px-2.5 py-2.5 rounded-xl border border-border text-foreground-secondary hover:text-foreground hover:bg-foreground/5 hover:border-border-hover transition-all text-xs sm:text-sm font-medium whitespace-nowrap"
                        >
                          <span className="sm:hidden">Gerekli</span>
                          <span className="hidden sm:inline">Sadece Gerekli</span>
                        </button>
                        <button
                          data-cc-action="accept"
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
                            aria-label="Geri dön"
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
            </div>
          </div>
        )}

      <style>{cookieConsentAnimations}</style>
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

declare global {
  interface Window {
    /** layout.tsx'teki hidrasyon öncesi çerez script'i buna bakıp geri çekiliyor. */
    __fmCookieConsentReady?: boolean;
  }
}
