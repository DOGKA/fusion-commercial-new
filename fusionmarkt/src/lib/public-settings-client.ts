/**
 * `/api/public/settings` için istemci tarafı tekil yükleyici.
 *
 * Bu uç noktayı iki bileşen mount anında birbirinden habersiz çekiyordu
 * (`GoogleAnalytics` izleme kimlikleri için, `CookieConsent` banner ayarı için),
 * yani her sayfa yüklemesinde aynı yanıt iki kez iniyordu. Modül seviyesindeki
 * promise, aynı sekmedeki tüm tüketicilerin tek isteği paylaşmasını sağlar.
 *
 * Yanıt admin panelinden değişebildiği için sonsuza kadar tutulmuyor; TTL,
 * uç noktanın kendi CDN cache başlığından çok daha kısa.
 */

export interface PublicSettings {
  googleAnalyticsId: string | null;
  facebookPixelId: string | null;
  cookieBannerEnabled?: boolean;
  cookieBannerPosition?: string;
  cookieBannerText?: string;
  cookieDefaultAnalytics?: boolean;
  cookieDefaultMarketing?: boolean;
  cookieDefaultPreferences?: boolean;
}

const TTL_MS = 300_000;

let cached: Promise<PublicSettings | null> | null = null;
let fetchedAt = 0;

export function getPublicSettings(): Promise<PublicSettings | null> {
  const now = Date.now();
  if (cached && now - fetchedAt < TTL_MS) return cached;

  fetchedAt = now;
  cached = fetch("/api/public/settings")
    .then((res) => (res.ok ? (res.json() as Promise<PublicSettings>) : null))
    .catch(() => {
      // Başarısız istek önbelleğe yapışmasın.
      cached = null;
      return null;
    });

  return cached;
}
