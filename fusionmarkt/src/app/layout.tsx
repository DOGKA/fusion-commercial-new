import type { Metadata, Viewport } from "next";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import MiniCartLazy from "@/components/cart/MiniCartLazy";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import CookieConsent from "@/components/CookieConsent";
import { getCookieBannerConfig } from "@/lib/cookie-banner-settings";
import { getMenuCategories } from "@/lib/menu-categories";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
} from "@/lib/cookie-consent-shared";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import {
  GoogleTagManagerScript,
  GoogleTagManagerNoScript,
} from "@/components/GoogleTagManager";
import { JsonLd } from "@/components/seo";
import { ThemeProvider } from "@/components/ThemeProvider";
import { 
  siteConfig, 
  generateOrganizationSchema, 
  generateWebSiteSchema 
} from "@/lib/seo";

// Viewport configuration
export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Global SEO metadata
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "FusionMarkt | Taşınabilir Güç Kaynakları & Enerji Çözümleri",
    template: "%s | FusionMarkt",
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  
  // Icons
  icons: {
    // SVG önce geliyor ki destekleyen tarayıcı onu seçsin; .ico ise hem eski
    // tarayıcılar hem de tarayıcıların bildirimden bağımsız olarak istediği
    // /favicon.ico için duruyor.
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
  
  // Manifest
  manifest: "/manifest.json",
  
  // Open Graph - Dynamic OG image via opengraph-image.tsx
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "FusionMarkt | Taşınabilir Güç Kaynakları & Enerji Çözümleri",
    description: siteConfig.description,
    // OG image is auto-generated from opengraph-image.tsx (uses slider visuals)
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "FusionMarkt | Taşınabilir Güç Kaynakları",
    description: siteConfig.description,
    site: siteConfig.social.twitter,
    creator: siteConfig.social.twitter,
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification - Google Search Console, Yandex, Bing Webmaster Tools
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
    other: {
      "msvalidate.01":
        process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ||
        "17D54A4A16549ECF5739BCD928EC987D",
    },
  },
  
  // Category
  category: "e-commerce",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();
  const [cookieBannerConfig, menuCategories] = await Promise.all([
    getCookieBannerConfig(),
    getMenuCategories(),
  ]);

  // GTM ID is no longer read from env — it now comes from the
  // SiteSettings DB row via <GoogleTagManagerScript /> below so
  // a single admin-managed value drives both GA Data API and the
  // tag injected into the public site.

  return (
    <html lang="tr" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* CDN'e preconnect BİLEREK yok: görsellerin tamamı /_next/image üzerinden
            sunucu tarafında çekiliyor, tarayıcı bu origin'e yalnızca sayfa altındaki
            birkaç SVG için ve geç bağlanıyor. preconnect boşa TLS el sıkışması
            yapıyordu (Lighthouse "Unused preconnect"). dns-prefetch yeterli. */}
        <link rel="dns-prefetch" href="https://cdn.fusionmarkt.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Varsayılan ThemeProvider'daki defaultTheme ile aynı olmalı.
                // 'dark' iken ilk boyama koyu, hydration sonrası açık temaya
                // atlıyordu.
                try {
                  var theme = localStorage.getItem('fusionmarkt-theme') || 'light';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                } catch (e) {
                  document.documentElement.classList.add('light');
                }

                // Çerez bandı HTML'e herkes için basılıyor ve globals.css onu
                // varsayılan olarak gizliyor; görünür kılan tek şey aşağıdaki
                // sınıf. Karar burada, boyamadan önce veriliyor: onay vermiş
                // ziyaretçi bandı bir kare bile görmüyor, onay vermemiş ziyaretçi
                // ise bandı ilk boyamada görüyor.
                //
                // Bu iş bilerek sunucuya taşınmadı: kök layout'ta cookies()
                // okumak 26 statik sayfayı istek başına render'a düşürüyor ve
                // HTML'i kullanıcıya özel yapıp CDN önbelleğini tamamen bozuyordu.
                try {
                  var raw = localStorage.getItem(${JSON.stringify(COOKIE_CONSENT_STORAGE_KEY)});
                  var consented = !!raw && JSON.parse(raw).consentVersion === ${JSON.stringify(COOKIE_CONSENT_VERSION)};
                  if (!consented) {
                    document.documentElement.classList.add('cookie-consent-pending');
                  }
                } catch (e) {
                  // Okunamayan depolama onay yok sayılır: bandı göstermek
                  // göstermemekten güvenli.
                  document.documentElement.classList.add('cookie-consent-pending');
                }
              })();
            `,
          }}
        />

        {/* Bandın boyanması hidrasyondan bağımsız, ama tıklamanın yanıtı değildi:
            bant ilk boyamada hazır göründüğü için ilk ziyaretçinin ilk tıklaması
            sayfanın en uzun görevine denk geliyor ve INP'yi tek başına 1s'in
            üstüne çıkarıyordu. Bu blok "Kabul Et" ve "Sadece Gerekli" tıklamalarını
            React yüklenmeden yanıtlıyor.

            Aşağıdaki yazma mantığı CookieConsentContext'teki savePreferences'ın
            kopyası. Sabitler paylaşıldığı için sürüm kayması riski yok, ama
            yazılan çerez setine ileride bir alan eklenirse iki yeri birlikte
            güncellemek gerekir.

            Hidrasyon tamamlanınca CookieConsent bileşeni window'a hazır işaretini
            koyuyor ve blok kendini devre dışı bırakıyor: alt bilgideki "Çerez
            Ayarları" bağlantısıyla bandı yeniden açan akış, kullanıcının mevcut
            tercihlerini koruması gerektiği için tamamen React'te kalıyor. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var STORAGE_KEY = ${JSON.stringify(COOKIE_CONSENT_STORAGE_KEY)};
                var CONSENT_VERSION = ${JSON.stringify(COOKIE_CONSENT_VERSION)};
                var CONSENT_COOKIE = ${JSON.stringify(COOKIE_CONSENT_COOKIE_NAME)};
                // "Kabul Et" hepsini açmıyor, admin varsayılanlarını kaydediyor.
                var ACCEPT_DEFAULTS = ${JSON.stringify({
                  analytics: cookieBannerConfig.defaultAnalytics,
                  marketing: cookieBannerConfig.defaultMarketing,
                  preferences: cookieBannerConfig.defaultPreferences,
                })};
                var MAX_AGE = 365 * 24 * 60 * 60;
                var EXIT_DURATION_MS = 220;

                function writeCookie(name, value) {
                  var secure = location.protocol === 'https:' ? '; Secure' : '';
                  document.cookie = name + '=' + value + '; path=/; max-age=' + MAX_AGE + '; SameSite=Lax' + secure;
                }

                function save(acceptAll) {
                  var prefs = {
                    necessary: true,
                    analytics: acceptAll ? ACCEPT_DEFAULTS.analytics : false,
                    marketing: acceptAll ? ACCEPT_DEFAULTS.marketing : false,
                    preferences: acceptAll ? ACCEPT_DEFAULTS.preferences : false,
                    consentDate: new Date().toISOString(),
                    consentVersion: CONSENT_VERSION
                  };
                  var json = JSON.stringify(prefs);

                  try { localStorage.setItem(STORAGE_KEY, json); } catch (e) {}
                  writeCookie(CONSENT_COOKIE, encodeURIComponent(json));
                  writeCookie('consent_analytics', prefs.analytics ? '1' : '0');
                  writeCookie('consent_marketing', prefs.marketing ? '1' : '0');
                  writeCookie('consent_preferences', prefs.preferences ? '1' : '0');

                  if (typeof window.gtag === 'function') {
                    window.gtag('consent', 'update', {
                      analytics_storage: prefs.analytics ? 'granted' : 'denied',
                      ad_storage: prefs.marketing ? 'granted' : 'denied',
                      ad_user_data: prefs.marketing ? 'granted' : 'denied',
                      ad_personalization: prefs.marketing ? 'granted' : 'denied',
                      functionality_storage: prefs.preferences ? 'granted' : 'denied',
                      personalization_storage: prefs.preferences ? 'granted' : 'denied',
                      security_storage: 'granted'
                    });
                  }

                  if (!prefs.analytics || !prefs.marketing) {
                    var ga = ['_ga', '_gid', '_gat', '_gac_'];
                    for (var i = 0; i < ga.length; i++) {
                      document.cookie = ga[i] + '=; path=/; max-age=0';
                      document.cookie = ga[i] + '=; path=/; domain=.' + location.hostname + '; max-age=0';
                    }
                    document.cookie = '_fbp=; path=/; max-age=0';
                    document.cookie = '_fbc=; path=/; max-age=0';
                  }

                  window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: prefs }));
                }

                // Bileşenin CSS'iyle aynı çıkış animasyonu, ardından bandı gizleyen
                // sınıfın kaldırılması. globals.css onay sınıfı gidince
                // .cookie-consent-root'u display:none yapıyor.
                function playExit() {
                  var nodes = document.querySelectorAll('.cookie-consent-backdrop, .cookie-consent-modal');
                  for (var i = 0; i < nodes.length; i++) {
                    nodes[i].classList.add('is-closing');
                  }
                  window.setTimeout(function() {
                    document.documentElement.classList.remove('cookie-consent-pending');
                  }, EXIT_DURATION_MS);
                }

                // Delegasyon şart: bu script head'de çalışıyor, butonlar henüz
                // ayrıştırılmadı. Capture fazı ve stopImmediatePropagation da şart:
                // React 19 hidrasyonda DOM düğümlerini yeniden kullandığı için bu
                // dinleyici hayatta kalıyor, durdurulmazsa aynı tıklamada hem script
                // hem React handler'ı çalışıp onayı iki kez yazar ve ikinci bir
                // cookieConsentUpdated event'i page_view'ı tekrar attırır.
                document.addEventListener('click', function(event) {
                  if (window.__fmCookieConsentReady) return;
                  if (!document.documentElement.classList.contains('cookie-consent-pending')) return;

                  var target = event.target;
                  var button = target && target.closest ? target.closest('[data-cc-action]') : null;
                  if (!button) return;

                  var action = button.getAttribute('data-cc-action');
                  if (action !== 'accept' && action !== 'necessary') return;

                  event.preventDefault();
                  event.stopImmediatePropagation();

                  playExit();
                  // Yazma işi ilk boyamadan sonraya bırakılıyor ki tıklamanın next
                  // paint'i yalnızca kapanış animasyonu olsun.
                  requestAnimationFrame(function() {
                    window.setTimeout(function() { save(action === 'accept'); }, 0);
                  });
                }, true);
              })();
            `,
          }}
        />

        {/* Consent Mode v2 defaults — MUST be before any Google tags.
            Always rendered so gtag() exists for both GTM and GA4 even if
            Google Ads env is not configured. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied',
                'security_storage': 'granted',
                'wait_for_update': 500
              });
            `,
          }}
        />

        {/* GTM init script — DB-driven, runs only when admin has configured a GTM ID.
            Google Ads tag'i buradan KALDIRILDI: GTM container'ı AW- tag'ini zaten
            yüklüyor ve buradaki blok beforeInteractive olduğu için tanımlandığı anda
            181 KiB'lık scripti hydration'ın önüne koyuyordu. Ads doğrulaması gerekirse
            GTM panelinden yapılmalı, buraya geri eklenmemeli. */}
        <GoogleTagManagerScript />

        <link rel="help" href={siteConfig.resources.appManual.url} title={siteConfig.resources.appManual.name} />
        <JsonLd data={[organizationSchema, webSiteSchema]} />
      </head>
      <body className="antialiased bg-background text-foreground">
        {/* GTM noscript fallback — DB-driven via SiteSettings.googleTagManagerId */}
        <GoogleTagManagerNoScript />

        <ThemeProvider>
          <CookieConsentProvider>
            <GoogleAnalytics />
            
            {/*
              Sıra bilinçli: CartProvider DIŞTA. FavoritesProvider "favoriden
              sepete taşı" için useCart() çağırıyor, dolayısıyla sepetin altında
              olmak zorunda. CartContext hiçbir bağlama bağlı değil, bu yüzden
              yer değişimi tek yönlü ve güvenli.
            */}
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <Header menuCategories={menuCategories} />
                  <main className="min-h-screen">
                    {children}
                  </main>
                  <Footer />
                  <MiniCartLazy />
                  {/* Bilerek `next/dynamic` değil: bant, onay vermemiş
                      ziyaretçide sayfanın en büyük elementi. `ssr: false` ile
                      yüklendiğinde ilk HTML'de hiç yer almıyor, ancak
                      hidrasyondan sonra boyanıyordu ve LCP'nin neredeyse tamamı
                      render gecikmesiydi. Görünürlüğüne head'deki inline script
                      karar veriyor.

                      Gövdenin başına almak denendi ve ölçülebilir bir kazanç
                      vermedi (gözlenen LCP zaten FCP ile aynı ana düşüyor), o
                      yüzden burada: en sonda durması sabit CTA'larla z-index
                      eşitliğini DOM sırasıyla kendi lehine çözüyor. */}
                  <CookieConsent config={cookieBannerConfig} />
                </FavoritesProvider>
              </CartProvider>
            </AuthProvider>
          </CookieConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
