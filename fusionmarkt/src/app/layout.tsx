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
  // Global JSON-LD schemas
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang="tr" suppressHydrationWarning data-scroll-behavior="smooth" className="dark">
      <head>
        {/* Blocking script to prevent flash of wrong theme (FOWT) */}
        {/* Sets theme BEFORE React hydrates - runs synchronously */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('fusionmarkt-theme') || 'dark';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        {/* External help/manual resource */}
        <link rel="help" href={siteConfig.resources.appManual.url} title={siteConfig.resources.appManual.name} />
        {/* Global JSON-LD Structured Data */}
        <JsonLd data={[organizationSchema, webSiteSchema]} />
      </head>
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <CookieConsentProvider>
            {/* Google Analytics, GTM, FB Pixel - API'den dinamik + Consent Mode v2 */}
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
