/**
 * FusionMarkt SEO Configuration
 * Merkezi SEO ayarları - tüm sayfalar için tutarlı meta data
 */

export const siteConfig = {
  name: "FusionMarkt",
  shortName: "FusionMarkt",
  description: "Taşınabilir güç kaynağı, LiFePO4 batarya, solar panel ve portable power station modelleri. IEETek, Traffi, Telesteps yetkili distribütörü. Ücretsiz kargo, 2 yıl garanti. Türkiye'nin güvenilir enerji marketi.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://fusionmarkt.com",
  // OG image dynamically generated via /opengraph-image (uses slider visuals)
  ogImage: "/opengraph-image",
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
    // Birincil hedefler (en yüksek arama hacmi)
    "taşınabilir güç kaynağı",
    "solar panel",
    "portable power station",
    "güç istasyonu",
    "güneş paneli",
    "güneş enerjisi",
    "lifepo4",
    "lifepo4 batarya",
    "yalıtkan merdiven",
    "iş güvenliği eldiveni",
    // İkincil hedefler
    "power station",
    "taşınabilir enerji",
    "enerji depolama",
    "off-grid enerji",
    "kamp güç kaynağı",
    "karavan güç kaynağı",
    "acil durum güç kaynağı",
    "taşınabilir şarj istasyonu",
    "batarya güç kaynağı",
    // Marka bazlı
    "ieetek",
    "ieetek türkiye",
    "traffi",
    "telesteps",
    // Uzun kuyruk (long-tail)
    "taşınabilir güç kaynağı fiyatları",
    "taşınabilir güç kaynağı satın al",
    "en iyi taşınabilir güç kaynağı",
    "solar panel seti",
    "lifepo4 güç istasyonu",
    "katlanır güneş paneli",
    "yalıtkan merdiven fiyatları",
    "kamp için güç kaynağı",
    "ev tipi güç kaynağı",
    "güneş paneli fiyatları",
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
  product: "%s - Fiyat ve Özellikler",
  category: "%s - En İyi Fiyat Garantisi",
  brand: "%s Ürünleri - Yetkili Distribütör",
  blog: "%s | Blog",
} as const;

// Varsayılan meta açıklamaları (SEO optimized)
export const defaultDescriptions = {
  home: "Taşınabilir güç kaynağı, solar panel, portable power station ve LiFePO4 batarya modelleri. IEETek, Traffi, Telesteps yetkili distribütörü. Ücretsiz kargo, 2 yıl garanti. Türkiye'nin güvenilir enerji marketi.",
  shop: "En iyi taşınabilir güç kaynakları, güneş panelleri, LiFePO4 bataryalar ve portable power station modelleri. Fiyat karşılaştırma, ücretsiz kargo, 12 taksit imkanı.",
  blog: "Taşınabilir güç kaynağı karşılaştırmaları, solar panel kurulum rehberi, LiFePO4 batarya bilgileri ve ürün incelemeleri. Enerji bağımsızlığı hakkında uzman içerikler.",
  contact: "FusionMarkt iletişim. Taşınabilir güç kaynağı, solar panel siparişi ve teknik destek için bize ulaşın. Ankara merkez ofis.",
  about: "FusionMarkt - Türkiye'nin güvenilir taşınabilir güç kaynağı, solar panel ve portable power station marketi. IEETek yetkili distribütörü. 2023'ten beri profesyonel hizmet.",
} as const;

// Kategori SEO açıklamaları (hedef keywordler dahil)
export const categoryDescriptions: Record<string, string> = {
  "tasinabilir-guc-kaynaklari": "Taşınabilir güç kaynağı modelleri - LiFePO4 bataryalı portable power station. Kamp, karavan, açık hava etkinlikleri ve acil durum için 256Wh-6kWh güç istasyonları. Fiyat karşılaştırması, ücretsiz kargo.",
  "power-station": "Taşınabilir güç kaynağı modelleri - LiFePO4 bataryalı power station. Kamp, karavan, acil durum ve ev kullanımı için 500W-3000W güç istasyonları. Fiyat ve özellik karşılaştırması.",
  "solar-panel": "Güneş enerjisi panelleri - Katlanır solar panel modelleri. Taşınabilir güç kaynağı ile uyumlu 100W-400W güneş paneli seçenekleri. En iyi fiyat garantisi, ücretsiz kargo.",
  "aksesuarlar": "Güç istasyonu aksesuarları - Kablo, adaptör, çanta ve yedek parçalar. LiFePO4 batarya, solar panel bağlantı ekipmanları. FusionMarkt güvencesiyle.",
  "bundle": "Taşınabilir güç kaynağı + solar panel paket setleri. Hazır off-grid enerji çözümleri, %20'ye varan tasarruf fırsatları.",
  "bundle-paket-urunler": "Özel paket fırsatları - Güç istasyonu + güneş paneli setleri. LiFePO4 bataryalı taşınabilir enerji paketleri ile maksimum tasarruf. Ücretsiz kargo.",
  "yalitkan-merdiven": "Yalıtkan merdiven modelleri - Elektrik işleri için güvenli fiberglas merdivenler. EN 50528 sertifikalı, 1000V yalıtımlı teleskopik ve atlas merdivenler. Telesteps yetkili distribütörü.",
  "is-guvenligi-eldiveni": "İş güvenliği eldiveni modelleri - Kesim dayanımlı, dokunmatik ekran uyumlu Traffi güvenlik eldivenleri. CE ve EN 388 sertifikalı. Türkiye yetkili distribütörü.",
};

// Marka SEO açıklamaları (hedef keywordler dahil)
export const brandDescriptions: Record<string, string> = {
  ieetek: "IEETek taşınabilir güç kaynağı ve solar panel modelleri. P800, P1800, P2400, P3200, SH4000 LiFePO4 bataryalı portable power station serileri. Türkiye yetkili distribütörü, 2 yıl garanti, ücretsiz kargo.",
  traffi: "Traffi iş güvenliği eldiveni modelleri. Karbon-nötr, kesim dayanımlı ve dokunmatik ekran uyumlu koruyucu eldivenler. EN 388 sertifikalı, CE onaylı.",
  telesteps: "Telesteps yalıtkan merdiven modelleri. Profesyonel elektrik işleri için 1000V yalıtımlı, katlanır fiberglas merdivenler. EN 50528 sertifikalı.",
  kevlar: "Kevlar yalıtkan merdivenler. Yüksek gerilim elektrik işlerinde güvenli çalışma için izolasyonlu merdivenler. DGUV sertifikalı.",
};

