"use client";

import { createContext, useContext, useCallback, ReactNode, useMemo, useSyncExternalStore } from "react";

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

interface ConsentState {
  preferences: CookiePreferences;
  hasConsent: boolean;
}

interface CookieConsentContextType {
  preferences: CookiePreferences;
  hasConsent: boolean;
  isLoaded: boolean;
  updatePreferences: (prefs: Partial<CookiePreferences>) => void;
  acceptAll: () => void;
  acceptNecessary: () => void;
  resetConsent: () => void;
  canUseAnalytics: boolean;
  canUseMarketing: boolean;
  canUsePreferences: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const COOKIE_CONSENT_KEY = "fusionmarkt-cookie-consent";
const CONSENT_VERSION = "1.0";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  consentDate: "",
  consentVersion: CONSENT_VERSION,
};

const defaultState: ConsentState = {
  preferences: defaultPreferences,
  hasConsent: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════
const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// EXTERNAL STORE for useSyncExternalStore
// ═══════════════════════════════════════════════════════════════════════════
let listeners: Array<() => void> = [];
let cachedState: ConsentState | null = null;

function getSnapshot(): ConsentState {
  if (cachedState) return cachedState;
  
  if (typeof window === "undefined") {
    return defaultState;
  }
  
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as CookiePreferences;
      if (parsed.consentVersion === CONSENT_VERSION) {
        cachedState = { preferences: parsed, hasConsent: true };
        return cachedState;
      }
    } catch {
      // Invalid stored data
    }
  }
  
  // Check cookie as fallback
  const cookieConsent = getCookieValue("cookie_consent");
  if (cookieConsent) {
    try {
      const parsed = JSON.parse(decodeURIComponent(cookieConsent)) as CookiePreferences;
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(parsed));
      cachedState = { preferences: parsed, hasConsent: true };
      return cachedState;
    } catch {
      // Invalid cookie data
    }
  }
  
  cachedState = defaultState;
  return cachedState;
}

function getServerSnapshot(): ConsentState {
  return defaultState;
}

function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function emitChange() {
  cachedState = null; // Clear cache to force re-read
  for (const listener of listeners) {
    listener();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function setCookieValue(name: string, value: string, maxAge: number = COOKIE_MAX_AGE) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function deleteCookieValue(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

function updateGoogleConsent(preferences: CookiePreferences) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: preferences.analytics ? "granted" : "denied",
      ad_storage: preferences.marketing ? "granted" : "denied",
      ad_user_data: preferences.marketing ? "granted" : "denied",
      ad_personalization: preferences.marketing ? "granted" : "denied",
      functionality_storage: preferences.preferences ? "granted" : "denied",
      personalization_storage: preferences.preferences ? "granted" : "denied",
      security_storage: "granted",
    });
  }
}

function clearTrackingCookies() {
  const gaCookies = ["_ga", "_gid", "_gat", "_gac_"];
  gaCookies.forEach((name) => {
    deleteCookieValue(name);
    document.cookie = `${name}=; path=/; domain=.${window.location.hostname}; max-age=0`;
  });
  deleteCookieValue("_fbp");
  deleteCookieValue("_fbc");
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore - React 18+ recommended way for external state
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  const { preferences, hasConsent } = state;

  const savePreferences = useCallback((prefs: CookiePreferences) => {
    const toSave: CookiePreferences = {
      ...prefs,
      necessary: true,
      consentDate: new Date().toISOString(),
      consentVersion: CONSENT_VERSION,
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(toSave));
    setCookieValue("cookie_consent", encodeURIComponent(JSON.stringify(toSave)));
    setCookieValue("consent_analytics", toSave.analytics ? "1" : "0");
    setCookieValue("consent_marketing", toSave.marketing ? "1" : "0");
    setCookieValue("consent_preferences", toSave.preferences ? "1" : "0");
    
    updateGoogleConsent(toSave);
    
    if (!toSave.analytics || !toSave.marketing) {
      clearTrackingCookies();
    }
    
    window.dispatchEvent(new CustomEvent("cookieConsentUpdated"));
    emitChange();
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
    deleteCookieValue("cookie_consent");
    deleteCookieValue("consent_analytics");
    deleteCookieValue("consent_marketing");
    deleteCookieValue("consent_preferences");
    clearTrackingCookies();
    emitChange();
  }, []);

  const value: CookieConsentContextType = useMemo(() => ({
    preferences,
    hasConsent,
    isLoaded: true, // useSyncExternalStore handles hydration
    updatePreferences,
    acceptAll,
    acceptNecessary,
    resetConsent,
    canUseAnalytics: preferences.analytics,
    canUseMarketing: preferences.marketing,
    canUsePreferences: preferences.preferences,
  }), [preferences, hasConsent, updatePreferences, acceptAll, acceptNecessary, resetConsent]);

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
