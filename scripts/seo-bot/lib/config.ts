/**
 * SEO Bot Configuration
 * Hedef keyword'ler, kategori mapping'leri, SEO kuralları
 */

export const SEO_RULES = {
  metaTitle: { min: 30, max: 60 },
  metaDescription: { min: 120, max: 160 },
  metaKeywords: { min: 3, max: 10 },
  descriptionMinWords: 200,
};

export const TARGET_KEYWORDS = {
  tier1_commercial: [
    "taşınabilir güç kaynağı",
    "taşınabilir güç istasyonu",
    "portable power station",
    "katlanabilir güneş paneli",
    "solar panel seti",
    "lifepo4 güç istasyonu",
    "1024Wh taşınabilir güç kaynağı",
    "2048Wh power station",
    "3200W taşınabilir güç kaynağı",
    "karavan için power station",
  ],
  tier2_usecase: [
    "elektrik kesintisi için güç kaynağı",
    "cpap için taşınabilir güç kaynağı",
    "kamp için power station",
    "şantiye için taşınabilir enerji",
    "festival için sessiz enerji çözümü",
    "off-grid enerji sistemi",
    "ev için yedek güç sistemi",
    "karavan için güç çözümü",
  ],
  tier3_educational: [
    "lifepo4 batarya nedir",
    "mppt vs pwm",
    "voc nedir",
    "pass-through şarj nedir",
    "saf sinüs dalga nedir",
    "seri paralel solar panel bağlantısı",
  ],
};

export const CATEGORY_SLUGS = {
  powerStations: "tasinabilir-guc-kaynaklari",
  solarPanels: "gunes-panelleri",
  bundles: "bundle-paket-urunler",
  gloves: "endustriyel-eldivenler",
  ladders: "teleskopik-merdivenler",
};

export const LANDING_PAGE_TOPICS = [
  {
    slug: "kamp-icin-tasinabilir-guc-kaynagi",
    title: "Kamp İçin Taşınabilir Güç Kaynağı",
    keywords: ["kamp güç kaynağı", "kamp için power station", "outdoor güç kaynağı"],
    relatedCategory: "tasinabilir-guc-kaynaklari",
  },
  {
    slug: "karavan-icin-guc-kaynagi-ve-solar-panel",
    title: "Karavan İçin Güç Kaynağı ve Solar Panel",
    keywords: ["karavan güç kaynağı", "karavan solar panel", "karavan enerji sistemi"],
    relatedCategory: "tasinabilir-guc-kaynaklari",
  },
  {
    slug: "ev-icin-yedek-guc-cozumu",
    title: "Ev İçin Yedek Güç Çözümü",
    keywords: ["ev güç kaynağı", "elektrik kesintisi çözümü", "ev yedek enerji"],
    relatedCategory: "tasinabilir-guc-kaynaklari",
  },
  {
    slug: "cpap-icin-guc-kaynagi",
    title: "CPAP İçin Güç Kaynağı",
    keywords: ["cpap güç kaynağı", "cpap power station", "cpap taşınabilir enerji"],
    relatedCategory: "tasinabilir-guc-kaynaklari",
  },
  {
    slug: "santiye-icin-tasinabilir-enerji",
    title: "Şantiye İçin Taşınabilir Enerji",
    keywords: ["şantiye güç kaynağı", "inşaat taşınabilir enerji", "şantiye jeneratör alternatifi"],
    relatedCategory: "tasinabilir-guc-kaynaklari",
  },
  {
    slug: "katlanabilir-gunes-paneli-rehberi",
    title: "Katlanabilir Güneş Paneli Rehberi ve Modelleri",
    keywords: ["katlanabilir güneş paneli", "taşınabilir solar panel", "katlanır güneş paneli"],
    relatedCategory: "gunes-panelleri",
  },
];

export const BLOG_TOPICS = [
  {
    slug: "p800-vs-p1800-karsilastirma",
    title: "P800 vs P1800 – Hangi Model Size Uygun?",
    type: "comparison" as const,
    products: ["p800", "p1800"],
  },
  {
    slug: "p1800-vs-p2400-karsilastirma",
    title: "P1800 vs P2400 – Kapasite Farkı Ne Kadar Önemli?",
    type: "comparison" as const,
    products: ["p1800", "singo2000pro"],
  },
  {
    slug: "ecoflow-alternatifi-ieetek",
    title: "EcoFlow Alternatifi: IEETek Güç İstasyonları",
    type: "comparison" as const,
    products: ["p800", "p1800", "p3200"],
  },
  {
    slug: "jenerator-mu-power-station-mi",
    title: "Jeneratör mü Power Station mı? Detaylı Karşılaştırma",
    type: "guide" as const,
    products: ["p1800", "p3200", "sh4000"],
  },
  {
    slug: "1024wh-yeter-mi-2048wh-mi-almali",
    title: "1024Wh Yeter mi, 2048Wh mı Almalıyım?",
    type: "guide" as const,
    products: ["p1800", "p3200"],
  },
  {
    slug: "buzdolabi-icin-kac-wh-gerekir",
    title: "Buzdolabı İçin Kaç Wh Gerekir? Güç Hesaplama Rehberi",
    type: "guide" as const,
    products: ["p1800", "p3200", "sh4000"],
  },
];

export const NOINDEX_PAGES = [
  "sifremi-unuttum",
  "servis-formu",
  "resetpassword",
  "order-confirmation",
];

export const REDIRECT_404S = [
  { from: "/urunler", to: "/magaza" },
  { from: "/ups-sistemleri", to: "/kategori/tasinabilir-guc-kaynaklari" },
  { from: "/surdurulebilir-enerji", to: "/kategori/gunes-panelleri" },
  { from: "/ev-yedekleme-sistemleri", to: "/kategori/tasinabilir-guc-kaynaklari" },
  { from: "/lifepo4-batarya", to: "/blog/lifepo4-batarya-nedir-avantajlari-nelerdir" },
  { from: "/gunes-paneli", to: "/kategori/gunes-panelleri" },
  { from: "/sp200-gunes-paneli", to: "/kategori/gunes-panelleri" },
  { from: "/gunes-enerjisi-sistemleri", to: "/kategori/gunes-panelleri" },
  { from: "/kamp-ekipmanlari", to: "/blog/kamp-icin-tasinabilir-guc-kaynagi-rehberi" },
];
