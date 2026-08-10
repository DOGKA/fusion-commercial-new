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
import {
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
  const cookieBannerConfig = await getCookieBannerConfig();

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
                  <Header />
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
