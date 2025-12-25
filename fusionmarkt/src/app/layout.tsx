import type { Metadata } from "next";
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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FusionMarkt | Taşınabilir Güç Kaynakları & Enerji Çözümleri",
  description: "EcoFlow, Bluetti, Jackery taşınabilir güç kaynakları, güneş panelleri ve enerji depolama sistemleri. Yetkili distribütör garantisiyle güvenli alışveriş.",
  keywords: ["taşınabilir güç kaynağı", "power station", "güneş paneli", "solar panel", "ecoflow", "bluetti", "jackery"],
  authors: [{ name: "FusionMarkt" }],
  creator: "FusionMarkt",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://fusionmarkt.com",
    siteName: "FusionMarkt",
    title: "FusionMarkt | Taşınabilir Güç Kaynakları & Enerji Çözümleri",
    description: "Taşınabilir güç kaynakları, güneş panelleri ve enerji depolama sistemleri. Yetkili distribütör garantisiyle güvenli alışveriş.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FusionMarkt | Taşınabilir Güç Kaynakları",
    description: "Taşınabilir güç kaynakları, güneş panelleri ve enerji çözümleri.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.variable} antialiased`}>
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
              </MysteryBoxProvider>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
