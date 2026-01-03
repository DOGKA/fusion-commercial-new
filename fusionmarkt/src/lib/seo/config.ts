/**
 * FusionMarkt SEO Configuration
 * Merkezi SEO ayarları - tüm sayfalar için tutarlı meta data
 */

export const siteConfig = {
  name: "FusionMarkt",
  shortName: "FusionMarkt",
  description: "Taşınabilir güç kaynağı, LiFePO4 batarya, solar panel, yalıtkan merdiven ve iş güvenliği eldiveni. IEETek, Traffi, Telesteps yetkili distribütörü. Türkiye'nin en güvenilir enerji ve iş güvenliği marketi.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://fusionmarkt.com",
  ogImage: "/images/og-default.jpg",
  // Ürün ek kaynakları
  resources: {
    appManual: {
      name: "App Kullanım Kılavuzu",
      url: "https://ieetek.vercel.app/",
    },
  },
  
  // Şirket bilgileri
  company: {
    name: "FusionMarkt",
    legalName: "ASDTC MÜHENDİSLİK TİCARET A.Ş.",
    foundingDate: "2023",
    email: "info@fusionmarkt.com",
    salesEmail: "sales@fusionmarkt.com",
    phone: "+90 850 840 6160",
    address: {
      streetAddress: "Turan Güneş Bulvarı, Cezayir Cd. No.6/7, Yıldızevler",
      addressLocality: "Çankaya",
      addressRegion: "Ankara",
      postalCode: "06550",
      addressCountry: "TR",
    },
  },
  
  // Sosyal medya
  social: {
    twitter: "@fusionmarkt",
    facebook: "fusionmarkt",
    instagram: "fusionmarkt",
    youtube: "fusionmarkt",
    linkedin: "fusionmarkt",
  },
  
  // SEO defaults
  locale: "tr_TR",
  language: "tr",
  themeColor: "#8B5CF6",
  
  // Hedef Keywords (Google ranking için öncelikli)
  keywords: [
    // Birincil hedefler
    "taşınabilir güç kaynağı",
    "solar panel",
    "güneş enerjisi",
    "lifepo4",
    "lifepo4 batarya",
    "yalıtkan merdiven",
    "iş güvenliği eldiveni",
    // İkincil hedefler
    "power station",
    "güç istasyonu",
    "güneş paneli",
    "taşınabilir enerji",
    "enerji depolama",
    "off-grid enerji",
    "kamp güç kaynağı",
    "karavan güç kaynağı",
    "acil durum jeneratör",
    // Marka bazlı
    "ieetek",
    "traffi",
    "telesteps",
    "kevlar merdiven",
    // Uzun kuyruk (long-tail)
    "taşınabilir güç kaynağı fiyatları",
    "solar panel seti",
    "lifepo4 güç istasyonu",
    "katlanır güneş paneli",
    "yalıtkan merdiven fiyatları",
  ],
  
  // Creator & Publisher
  creator: "FusionMarkt",
  publisher: "FusionMarkt",
} as const;

// Sayfa başlığı formatları
export const titleTemplates = {
  // Not: Root `app/layout.tsx` zaten `template: "%s | FusionMarkt"` uyguluyor.
  // Buradaki şablonlar marka adını tekrar etmemeli.
  default: "%s",
  product: "%s - Taşınabilir Güç Kaynağı",
  category: "%s Kategorisi",
  brand: "%s Ürünleri",
  blog: "%s | Blog",
} as const;

// Varsayılan meta açıklamaları (SEO optimized)
export const defaultDescriptions = {
  home: "Taşınabilir güç kaynağı, LiFePO4 batarya, solar panel, yalıtkan merdiven ve iş güvenliği eldiveni satışı. IEETek, Traffi, Telesteps yetkili distribütörü. Ücretsiz kargo, 2 yıl garanti.",
  shop: "En iyi taşınabilir güç kaynakları, güneş panelleri, LiFePO4 bataryalar, yalıtkan merdivenler ve iş eldivenleri. Fiyat karşılaştırma, hızlı teslimat, 12 taksit imkanı.",
  blog: "Taşınabilir güç kaynağı rehberi, solar panel kurulumu, LiFePO4 batarya karşılaştırması, iş güvenliği ipuçları ve ürün incelemeleri.",
  contact: "FusionMarkt iletişim. Taşınabilir güç kaynağı, solar panel, yalıtkan merdiven siparişi ve teknik destek için bize ulaşın.",
  about: "FusionMarkt - Türkiye'nin önde gelen taşınabilir güç kaynağı, solar panel ve iş güvenliği ekipmanları distribütörü. 2023'ten beri güvenilir hizmet.",
} as const;

// Kategori SEO açıklamaları (hedef keywordler dahil)
export const categoryDescriptions: Record<string, string> = {
  "power-station": "Taşınabilir güç kaynağı modelleri - LiFePO4 bataryalı power station. Kamp, karavan, acil durum ve ev kullanımı için 500W-3000W güç istasyonları. Fiyat ve özellik karşılaştırması.",
  "solar-panel": "Güneş enerjisi panelleri - Katlanır solar panel modelleri. Taşınabilir güç kaynağı ile uyumlu 100W-400W güneş paneli seçenekleri. En iyi fiyat garantisi.",
  "aksesuarlar": "Güç istasyonu aksesuarları - Kablo, adaptör, çanta ve yedek parçalar. LiFePO4 batarya, solar panel bağlantı ekipmanları.",
  "bundle": "Taşınabilir güç kaynağı + solar panel paket setleri. Hazır off-grid enerji çözümleri, %20'ye varan tasarruf fırsatları.",
  "bundle-paket-urunler": "Özel paket fırsatları - Güç istasyonu + güneş paneli setleri. LiFePO4 bataryalı taşınabilir enerji paketleri ile maksimum tasarruf.",
  "yalitkan-merdiven": "Yalıtkan merdiven modelleri - Elektrik işleri için güvenli fiberglas merdivenler. EN 50528 sertifikalı, 1000V yalıtımlı teleskopik ve atlas merdivenler.",
  "is-guvenligi-eldiveni": "İş güvenliği eldiveni modelleri - Kesim dayanımlı, dokunmatik ekran uyumlu Traffi güvenlik eldivenleri. CE ve EN 388 sertifikalı.",
};

// Marka SEO açıklamaları (hedef keywordler dahil)
export const brandDescriptions: Record<string, string> = {
  ieetek: "IEETek taşınabilir güç kaynağı ve solar panel modelleri. P800, P1800,p3200, SH4000 P2400 LiFePO4 bataryalı power station serileri. Türkiye yetkili distribütörü, 2 yıl garanti.",
  traffi: "Traffi iş güvenliği eldiveni modelleri. Karbon-nötr, kesim dayanımlı ve dokunmatik ekran uyumlu koruyucu eldivenler. EN 388 sertifikalı, CE onaylı.",
  telesteps: "Telesteps yalıtkan merdiven modelleri. Profesyonel elektrik işleri için 1000V yalıtımlı, katlanır fiberglas merdivenler. EN 50528 sertifikalı.",
  kevlar: "Kevlar yalıtkan merdivenler. Yüksek gerilim elektrik işlerinde güvenli çalışma için izolasyonlu merdivenler. DGUV sertifikalı.",
};

