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
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "FusionMarkt | Taşınabilir Güç Kaynakları & Enerji Çözümleri",
    description: siteConfig.description,
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "FusionMarkt - Taşınabilir Güç Kaynakları",
      },
    ],
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
  
  // Verification (gerekirse eklenecek)
  verification: {
    // google: "google-site-verification-code",
    // yandex: "yandex-verification-code",
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
    <html lang="tr" className="dark" data-scroll-behavior="smooth">
      <head>
        {/* Global JSON-LD Structured Data */}
        <JsonLd data={[organizationSchema, webSiteSchema]} />
      </head>
      <body className={`${inter.variable} antialiased`}>
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
      </body>
    </html>
  );
}
