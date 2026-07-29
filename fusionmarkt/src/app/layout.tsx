import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { MysteryBoxProvider } from "@/context/MysteryBoxContext";
import MiniCart from "@/components/cart/MiniCart";
import { MysteryBoxModal } from "@/components/campaign";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import CookieConsent from "@/components/CookieConsent";
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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
  
  // Verification - Google Search Console & Yandex
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
  },
  
  // Category
  category: "e-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

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
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        {/* GTM noscript fallback — DB-driven via SiteSettings.googleTagManagerId */}
        <GoogleTagManagerNoScript />

        <ThemeProvider>
          <CookieConsentProvider>
            <GoogleAnalytics />
            
            <AuthProvider>
              <FavoritesProvider>
                <CartProvider>
                  <MysteryBoxProvider>
                    <Header />
                    <main className="min-h-screen">
                      {children}
                    </main>
                    <Footer />
                    <MiniCart />
                    <MysteryBoxModal />
                    <CookieConsent />
                  </MysteryBoxProvider>
                </CartProvider>
              </FavoritesProvider>
            </AuthProvider>
          </CookieConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
