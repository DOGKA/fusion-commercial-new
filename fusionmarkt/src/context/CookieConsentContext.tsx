"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface CookiePreferences {
  necessary: boolean;      // Her zaman true - site çalışması için gerekli
  analytics: boolean;      // Google Analytics, Hotjar, vb.
  marketing: boolean;      // Google Ads, Facebook Pixel, vb.
  preferences: boolean;    // Dil, tema, vb. tercihler
  consentDate: string;     // Onay tarihi
  consentVersion: string;  // Politika versiyonu
}

interface CookieConsentContextType {
  preferences: CookiePreferences;
  hasConsent: boolean;
  isLoaded: boolean;
  updatePreferences: (prefs: Partial<CookiePreferences>) => void;
  acceptAll: () => void;
  acceptNecessary: () => void;
  resetConsent: () => void;
  // Kullanım kolaylığı için
  canUseAnalytics: boolean;
  canUseMarketing: boolean;
  canUsePreferences: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const COOKIE_CONSENT_KEY = "fusionmarkt-cookie-consent";
const CONSENT_VERSION = "1.0"; // Politika değişirse bu versiyon artırılır
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 yıl (saniye)

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  consentDate: "",
  consentVersion: CONSENT_VERSION,
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════
const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Gerçek cookie set etme
function setCookie(name: string, value: string, maxAge: number = COOKIE_MAX_AGE) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

// Cookie okuma
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

// Cookie silme
function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

// Google Consent Mode v2 güncelleme
function updateGoogleConsent(preferences: CookiePreferences) {
  // gtag fonksiyonu varsa Google Consent Mode'u güncelle
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: preferences.analytics ? "granted" : "denied",
      ad_storage: preferences.marketing ? "granted" : "denied",
      ad_user_data: preferences.marketing ? "granted" : "denied",
      ad_personalization: preferences.marketing ? "granted" : "denied",
      functionality_storage: preferences.preferences ? "granted" : "denied",
      personalization_storage: preferences.preferences ? "granted" : "denied",
      security_storage: "granted", // Her zaman granted
    });
  }
}

// Marketing/Analytics cookie'lerini temizle
function clearTrackingCookies() {
  // Google Analytics cookies
  const gaCookies = ["_ga", "_gid", "_gat", "_gac_"];
  gaCookies.forEach((name) => {
    deleteCookie(name);
    // Alt domain cookie'leri için
    document.cookie = `${name}=; path=/; domain=.${window.location.hostname}; max-age=0`;
  });
  
  // Facebook Pixel
  deleteCookie("_fbp");
  deleteCookie("_fbc");
}

// Initial state'i hesaplayan fonksiyon
function getInitialState(): { preferences: CookiePreferences; hasConsent: boolean } {
  if (typeof window === "undefined") {
    return { preferences: defaultPreferences, hasConsent: false };
  }
  
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  const cookieConsent = getCookie("cookie_consent");
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as CookiePreferences;
      if (parsed.consentVersion === CONSENT_VERSION) {
        return { preferences: parsed, hasConsent: true };
      }
    } catch {
      // Invalid stored data
    }
  } else if (cookieConsent) {
    try {
      const parsed = JSON.parse(decodeURIComponent(cookieConsent)) as CookiePreferences;
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(parsed));
      return { preferences: parsed, hasConsent: true };
    } catch {
      // Invalid cookie data
    }
  }
  
  return { preferences: defaultPreferences, hasConsent: false };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  // Lazy initialization - runs only once on mount
  const [state, setState] = useState(() => {
    // SSR'da default değerler döndür
    if (typeof window === "undefined") {
      return { preferences: defaultPreferences, hasConsent: false, isLoaded: false };
    }
    const initial = getInitialState();
    return { ...initial, isLoaded: true };
  });

  const { preferences, hasConsent, isLoaded } = state;

  // Client-side hydration için - SSR sonrası state'i güncelle
  useEffect(() => {
    if (!isLoaded) {
      const initial = getInitialState();
      setState({ ...initial, isLoaded: true });
      if (initial.hasConsent) {
        updateGoogleConsent(initial.preferences);
      }
    }
  }, [isLoaded]);

  // Tercihleri kaydet
  const savePreferences = useCallback((prefs: CookiePreferences) => {
    const toSave: CookiePreferences = {
      ...prefs,
      necessary: true, // Her zaman true
      consentDate: new Date().toISOString(),
      consentVersion: CONSENT_VERSION,
    };
    
    // localStorage'a kaydet
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(toSave));
    
    // Gerçek cookie olarak da kaydet (server-side erişim için)
    setCookie("cookie_consent", encodeURIComponent(JSON.stringify(toSave)));
    
    // Bireysel consent cookie'leri (kolay kontrol için)
    setCookie("consent_analytics", toSave.analytics ? "1" : "0");
    setCookie("consent_marketing", toSave.marketing ? "1" : "0");
    setCookie("consent_preferences", toSave.preferences ? "1" : "0");
    
    // State güncelle
    setState({ preferences: toSave, hasConsent: true, isLoaded: true });
    
    // Google Consent Mode güncelle
    updateGoogleConsent(toSave);
    
    // Eğer analytics/marketing reddedildiyse tracking cookie'lerini temizle
    if (!toSave.analytics || !toSave.marketing) {
      clearTrackingCookies();
    }
    
    // Custom event dispatch (GoogleAnalytics component dinlesin)
    window.dispatchEvent(new CustomEvent("cookieConsentUpdated"));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<CookiePreferences>) => {
    savePreferences({ ...preferences, ...prefs });
  }, [preferences, savePreferences]);

  const acceptAll = useCallback(() => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      consentDate: "",
      consentVersion: CONSENT_VERSION,
    });
  }, [savePreferences]);

  const acceptNecessary = useCallback(() => {
    savePreferences(defaultPreferences);
  }, [savePreferences]);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    deleteCookie("cookie_consent");
    deleteCookie("consent_analytics");
    deleteCookie("consent_marketing");
    deleteCookie("consent_preferences");
    clearTrackingCookies();
    setState({ preferences: defaultPreferences, hasConsent: false, isLoaded: true });
  }, []);

  const value: CookieConsentContextType = useMemo(() => ({
    preferences,
    hasConsent,
    isLoaded,
    updatePreferences,
    acceptAll,
    acceptNecessary,
    resetConsent,
    canUseAnalytics: preferences.analytics,
    canUseMarketing: preferences.marketing,
    canUsePreferences: preferences.preferences,
  }), [preferences, hasConsent, isLoaded, updatePreferences, acceptAll, acceptNecessary, resetConsent]);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════
export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL TYPE DECLARATIONS
// ═══════════════════════════════════════════════════════════════════════════
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
