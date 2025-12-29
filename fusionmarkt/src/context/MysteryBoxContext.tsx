/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// ═══════════════════════════════════════════════════════════════════════════
// MYSTERY BOX CONTEXT
// Sürpriz kutu durumu yönetimi - 24 saat kuralı
// ═══════════════════════════════════════════════════════════════════════════

interface MysteryBoxCoupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number | null;
}

interface MysteryBoxClaim {
  couponCode: string;
  claimedAt: string;
  expiresAt: string;
  timeRemaining: number;
}

interface MysteryBoxContextType {
  // Durum
  canOpen: boolean;
  hasClaim: boolean;
  isLoading: boolean;
  claim: MysteryBoxClaim | null;
  coupon: MysteryBoxCoupon | null;
  
  // Fonksiyonlar
  fingerprint: string;
  refreshStatus: () => Promise<void>;
  claimCoupon: (couponId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Modal kontrolü
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const MysteryBoxContext = createContext<MysteryBoxContextType | undefined>(undefined);

// Basit fingerprint oluşturma (canvas + navigator bazlı)
function generateFingerprint(): string {
  const components: string[] = [];
  
  // Navigator bilgileri
  if (typeof navigator !== "undefined") {
    components.push(navigator.userAgent || "");
    components.push(navigator.language || "");
    components.push(String(navigator.hardwareConcurrency || ""));
    components.push(navigator.platform || "");
  }
  
  // Screen bilgileri
  if (typeof screen !== "undefined") {
    components.push(`${screen.width}x${screen.height}`);
    components.push(String(screen.colorDepth || ""));
  }
  
  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || "");
  
  // Canvas fingerprint
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("FusionMarkt", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("FusionMarkt", 4, 17);
      components.push(canvas.toDataURL());
    }
  } catch (e) {
    // Canvas desteklenmiyor
  }
  
  // Hash oluştur
  const str = components.join("|||");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `fp_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
}

// Fingerprint'i localStorage'dan al veya oluştur
function getOrCreateFingerprint(): string {
  if (typeof window === "undefined") return "";
  
  const storageKey = "fm_device_fp";
  let fp = localStorage.getItem(storageKey);
  
  if (!fp) {
    fp = generateFingerprint();
    localStorage.setItem(storageKey, fp);
  }
  
  return fp;
}

export function MysteryBoxProvider({ children }: { children: ReactNode }) {
  const [canOpen, setCanOpen] = useState(true);
  const [hasClaim, setHasClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [claim, setClaim] = useState<MysteryBoxClaim | null>(null);
  const [coupon, setCoupon] = useState<MysteryBoxCoupon | null>(null);
  const [fingerprint, setFingerprint] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fingerprint'i client tarafında oluştur
  useEffect(() => {
    const fp = getOrCreateFingerprint();
    setFingerprint(fp);
  }, []);

  // Status kontrolü
  const refreshStatus = useCallback(async () => {
    if (!fingerprint) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/public/mystery-box-status", {
        headers: {
          "x-fingerprint": fingerprint,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCanOpen(data.canOpen);
        setHasClaim(data.hasClaim);
        setClaim(data.claim);
        setCoupon(data.coupon);
      }
    } catch (error) {
      console.error("Mystery box status error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fingerprint]);

  // Fingerprint hazır olunca status kontrol et
  useEffect(() => {
    if (fingerprint) {
      refreshStatus();
    }
  }, [fingerprint, refreshStatus]);

  // Kupon claim etme
  const claimCoupon = useCallback(async (couponId: string): Promise<{ success: boolean; error?: string }> => {
    if (!fingerprint) {
      return { success: false, error: "Fingerprint bulunamadı" };
    }

    try {
      const res = await fetch("/api/public/mystery-box-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-fingerprint": fingerprint,
        },
        body: JSON.stringify({ fingerprint, couponId }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Kutu açılamadı" };
      }

      // Başarılı claim - state güncelle
      setCanOpen(false);
      setHasClaim(true);
      setClaim({
        couponCode: data.claim.couponCode,
        claimedAt: data.claim.claimedAt,
        expiresAt: data.claim.expiresAt,
        timeRemaining: new Date(data.claim.expiresAt).getTime() - Date.now(),
      });
      setCoupon(data.coupon);

      return { success: true };
    } catch (error) {
      console.error("Mystery box claim error:", error);
      return { success: false, error: "Bir hata oluştu" };
    }
  }, [fingerprint]);

  // Modal kontrolü
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // Kalan süre güncellemesi (her dakika)
  useEffect(() => {
    if (!claim) return;

    const interval = setInterval(() => {
      const remaining = new Date(claim.expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        // Süre doldu, status yenile
        refreshStatus();
      } else {
        setClaim((prev) =>
          prev ? { ...prev, timeRemaining: remaining } : null
        );
      }
    }, 60000); // Her dakika

    return () => clearInterval(interval);
  }, [claim, refreshStatus]);

  return (
    <MysteryBoxContext.Provider
      value={{
        canOpen,
        hasClaim,
        isLoading,
        claim,
        coupon,
        fingerprint,
        refreshStatus,
        claimCoupon,
        isModalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </MysteryBoxContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SSG-SAFE DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const SSG_SAFE_MYSTERYBOX_DEFAULTS: MysteryBoxContextType = {
  canOpen: false,
  hasClaim: false,
  isLoading: true,
  claim: null,
  coupon: null,
  fingerprint: "",
  refreshStatus: async () => {},
  claimCoupon: async () => ({ success: false, error: "Not initialized" }),
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK (SSG-SAFE)
// ═══════════════════════════════════════════════════════════════════════════

export function useMysteryBox(): MysteryBoxContextType {
  const context = useContext(MysteryBoxContext);
  // SSG-safe: Return defaults during static generation instead of throwing
  if (context === undefined) {
    return SSG_SAFE_MYSTERYBOX_DEFAULTS;
  }
  return context;
}
