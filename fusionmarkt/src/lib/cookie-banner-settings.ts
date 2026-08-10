import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@repo/db";

/**
 * Çerez bandı ayarını sunucuda okur.
 *
 * Daha önce bileşen bunu mount olduktan sonra `/api/public/settings`'ten
 * çekiyordu; banner sayfanın en büyük elementi olduğu için o gidiş-dönüş her
 * sayfada doğrudan LCP'ye biniyordu. `GoogleTagManagerScript` ile aynı
 * `unstable_cache` kalıbı: aynı TTL, aynı `site-settings` etiketi, dolayısıyla
 * admin panelden yapılan değişiklikler aynı anda yayılır.
 */
export interface CookieBannerConfig {
  enabled: boolean;
  position: "bottom" | "top" | "center";
  text: string;
  defaultAnalytics: boolean;
  defaultMarketing: boolean;
  defaultPreferences: boolean;
}

const DEFAULT_CONFIG: CookieBannerConfig = {
  enabled: true,
  position: "bottom",
  text: "Size en iyi deneyimi sunmak için çerezler kullanıyoruz.",
  defaultAnalytics: true,
  defaultMarketing: false,
  defaultPreferences: true,
};

export const getCookieBannerConfig = unstable_cache(
  async (): Promise<CookieBannerConfig> => {
    try {
      const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        select: {
          cookieBannerEnabled: true,
          cookieBannerPosition: true,
          cookieBannerText: true,
          cookieDefaultAnalytics: true,
          cookieDefaultMarketing: true,
          cookieDefaultPreferences: true,
        },
      });

      if (!settings) return DEFAULT_CONFIG;

      return {
        enabled: settings.cookieBannerEnabled ?? DEFAULT_CONFIG.enabled,
        position:
          (settings.cookieBannerPosition as CookieBannerConfig["position"]) ||
          DEFAULT_CONFIG.position,
        text: settings.cookieBannerText || DEFAULT_CONFIG.text,
        defaultAnalytics: settings.cookieDefaultAnalytics ?? DEFAULT_CONFIG.defaultAnalytics,
        defaultMarketing: settings.cookieDefaultMarketing ?? DEFAULT_CONFIG.defaultMarketing,
        defaultPreferences:
          settings.cookieDefaultPreferences ?? DEFAULT_CONFIG.defaultPreferences,
      };
    } catch {
      return DEFAULT_CONFIG;
    }
  },
  ["site-settings:cookie-banner"],
  { revalidate: 300, tags: ["site-settings"] }
);
