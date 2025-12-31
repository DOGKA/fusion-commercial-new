/**
 * Kategori Bazlı Filtre Tanımlamaları
 * Her kategori için özel filtreler - TEKNİK ÖZELLİKLERDEN VERİ ÇEKİYOR
 */

export interface FilterOption {
  id: string;
  name: string;
  value: string;
  color?: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  name: string;
  type: "CHECKBOX" | "RADIO" | "COLOR_SWATCH" | "RANGE";
  options: FilterOption[];
  isCollapsible?: boolean;
  isCollapsed?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENDÜSTRİYEL ELDİVENLER FİLTRELERİ
// Dokunmatik Ekran: TG1290, TG6240 (true), diğerleri (false)
// ═══════════════════════════════════════════════════════════════════════════
export const GLOVE_FILTERS: FilterGroup[] = [
  {
    id: "size",
    name: "Beden",
    type: "CHECKBOX",
    isCollapsible: true,
    // S=08, M=09, L=10, XL=11 eşleştirmesi
    options: [
      { id: "size-s", name: "S / 08", value: "S,08" },
      { id: "size-m", name: "M / 09", value: "M,09" },
      { id: "size-l", name: "L / 10", value: "L,10" },
      { id: "size-xl", name: "XL / 11", value: "XL,11" },
    ],
  },
  {
    id: "cut_resistance",
    name: "Kesilme Direnci (EN388)",
    type: "CHECKBOX",
    isCollapsible: true,
    options: [
      { id: "cut-1", name: "Seviye 1", value: "1" },
      { id: "cut-a", name: "A Seviyesi", value: "A" },
      { id: "cut-c", name: "C Seviyesi", value: "C" },
      { id: "cut-d", name: "D Seviyesi", value: "D" },
      { id: "cut-e", name: "E Seviyesi", value: "E" },
    ],
  },
  {
    id: "material",
    name: "Malzeme",
    type: "CHECKBOX",
    isCollapsible: true,
    options: [
      { id: "mat-nitril", name: "Nitril Kaplama", value: "nitril" },
      { id: "mat-pu", name: "PU Kaplama", value: "pu" },
      { id: "mat-latex", name: "Lateks Kaplama", value: "latex" },
    ],
  },
  {
    id: "touchscreen",
    name: "Dokunmatik Ekran Uyumlu",
    type: "RADIO",
    isCollapsible: true,
    // Teknik özelliklerden çekilen değerler: true/false
    options: [
      { id: "touch-yes", name: "Evet", value: "true" },
      { id: "touch-no", name: "Hayır", value: "false" },
    ],
  },
  // NOT: Kullanım Tipi filtresi kaldırıldı (kullanıcı isteği)
];

// ═══════════════════════════════════════════════════════════════════════════
// TAŞINABİLİR GÜÇ KAYNAKLARI FİLTRELERİ
// Tüm değerler teknik özelliklerden (ProductFeatureValue) çekiliyor
//
// Çıkış Güçleri (continuousPower / surgePower):
//   - P800: 800W / 1600W max
//   - Singo1000: 1000W / 2000W max
//   - P1800: 1800W / 3600W max
//   - P3200: 3200W / 6400W max
//   - Singo2000Pro: 2000W / 4000W max
//   - SH4000: 4000W / 8000W max
//
// Max. Solar Şarj Gücü:
//   - Singo1000: 200W
//   - P800: 300W
//   - P1800: 500W
//   - P3200: 500W
//   - Singo2000Pro: 500W
//   - SH4000: 3000W
//
// Dahili Fener: P800 ✅, P1800 ✅, P3200 ✅, diğerleri ❌
// Kablosuz Şarj: Singo1000 ✅, Singo2000Pro ✅, diğerleri ❌
// Dahili Powerbank: Sadece P3200 ✅
// AC 220V Çıkış: Tüm ürünlerde ✅
// ═══════════════════════════════════════════════════════════════════════════
export const POWER_STATION_FILTERS: FilterGroup[] = [
  {
    id: "capacity",
    name: "Kapasite (Wh)",
    type: "CHECKBOX",
    isCollapsible: true,
    // 500Wh altı yok - en düşük P800 512Wh
    options: [
      { id: "cap-1000", name: "500 - 1000 Wh", value: "500-1000" },
      { id: "cap-1500", name: "1000 - 1500 Wh", value: "1000-1500" },
      { id: "cap-2500", name: "1500 - 2500 Wh", value: "1500-2500" },
      { id: "cap-2500plus", name: "2500 Wh ve üzeri", value: "2500+" },
    ],
  },
  {
    id: "output_power",
    name: "Çıkış Gücü (W)",
    type: "CHECKBOX",
    isCollapsible: true,
    // Sürekli çıkış gücü değerleri:
    // P800 (800W), Singo1000 (1000W) → 500-1000W
    // P1800 (1800W), Singo2000Pro (2000W) → 1000-3000W
    // P3200 (3200W), SH4000 (4000W) → 3000-5000W
    options: [
      { id: "power-1000", name: "500W - 1000W", value: "500-1000" },
      { id: "power-3000", name: "1000W - 3000W", value: "1000-3000" },
      { id: "power-5000", name: "3000W - 5000W", value: "3000-5000" },
    ],
  },
  {
    id: "max_solar_charging",
    name: "Max. Solar Şarj (W)",
    type: "CHECKBOX",
    isCollapsible: true,
    // Max solar şarj giriş gücü değerleri:
    // Singo1000 (200W), P800 (300W) → 200-300W
    // P1800 (500W), Singo2000Pro (500W), P3200 (500W) → 500-1000W
    // SH4000 (3000W) → 1000-4000W
    options: [
      { id: "solar-300", name: "200W - 300W", value: "200-300" },
      { id: "solar-1000", name: "500W - 1000W", value: "500-1000" },
      { id: "solar-4000", name: "1000W - 4000W", value: "1000-4000" },
    ],
  },
  {
    id: "ac_output",
    name: "AC Çıkış (220V)",
    type: "RADIO",
    isCollapsible: true,
    options: [
      { id: "ac-yes", name: "Evet", value: "true" },
      { id: "ac-no", name: "Hayır", value: "false" },
    ],
  },
  {
    id: "wireless_charging",
    name: "Kablosuz Şarj",
    type: "RADIO",
    isCollapsible: true,
    // Singo1000 ve Singo2000Pro'da var
    options: [
      { id: "wireless-yes", name: "Evet", value: "true" },
      { id: "wireless-no", name: "Hayır", value: "false" },
    ],
  },
  {
    id: "builtin_flashlight",
    name: "Dahili Fener",
    type: "RADIO",
    isCollapsible: true,
    // P800, P1800, P3200'de var
    options: [
      { id: "flashlight-yes", name: "Evet", value: "true" },
      { id: "flashlight-no", name: "Hayır", value: "false" },
    ],
  },
  {
    id: "builtin_powerbank",
    name: "Dahili Powerbank",
    type: "RADIO",
    isCollapsible: true,
    // Sadece P3200'de var
    options: [
      { id: "powerbank-yes", name: "Evet", value: "true" },
      { id: "powerbank-no", name: "Hayır", value: "false" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// GÜNEŞ PANELLERİ FİLTRELERİ
// Stokta: SP100 (100W), SP200 (200W), SP400 (400W)
// Her ürün sadece kendi watt değerinde görünür
// ═══════════════════════════════════════════════════════════════════════════
export const SOLAR_PANEL_FILTERS: FilterGroup[] = [
  {
    id: "panel_power",
    name: "Güç (Watt)",
    type: "CHECKBOX",
    isCollapsible: true,
    // Tam değer eşleşmesi - teknik özelliklerden çekiliyor
    options: [
      { id: "watt-100", name: "100W", value: "100" },
      { id: "watt-200", name: "200W", value: "200" },
      { id: "watt-400", name: "400W", value: "400" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// TELESKOPİK MERDİVENLER FİLTRELERİ
// Stokta: 1600ET ve TS1600ET (3.8m, 13 basamak, Alüminyum Kevlar, Yalıtkan)
// ═══════════════════════════════════════════════════════════════════════════
export const LADDER_FILTERS: FilterGroup[] = [
  {
    id: "max_length",
    name: "Maksimum Uzunluk (m)",
    type: "CHECKBOX",
    isCollapsible: true,
    options: [
      { id: "len-2.5", name: "2.5m ve altı", value: "0-2.5" },
      { id: "len-3", name: "2.5m - 3m", value: "2.5-3" },
      { id: "len-3.5", name: "3m - 3.5m", value: "3-3.5" },
      { id: "len-4", name: "3.5m - 4m", value: "3.5-4" },
    ],
  },
  {
    id: "step_count",
    name: "Basamak Sayısı",
    type: "CHECKBOX",
    isCollapsible: true,
    // Sadece mevcut ürünlerdeki basamak sayıları
    options: [
      { id: "step-9", name: "9 Basamak", value: "9" },
      { id: "step-11", name: "11 Basamak", value: "11" },
      { id: "step-13", name: "13 Basamak", value: "13" },
    ],
  },
  {
    id: "ladder_type",
    name: "Merdiven Tipi",
    type: "CHECKBOX",
    isCollapsible: true,
    // Mevcut stoktaki tüm merdivenler teleskopik
    options: [
      { id: "type-tele", name: "Teleskopik", value: "teleskopik" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAĞAZA GENEL FİLTRELERİ (Tüm Kategoriler)
// ═══════════════════════════════════════════════════════════════════════════
export const STORE_GENERAL_FILTERS: FilterGroup[] = [
  {
    id: "price",
    name: "Fiyat",
    type: "RANGE",
    isCollapsible: true,
    options: [],
  },
  {
    id: "availability",
    name: "Stok Durumu",
    type: "RADIO",
    isCollapsible: true,
    options: [
      { id: "avail-all", name: "Tümü", value: "all" },
      { id: "avail-instock", name: "Stokta Var", value: "in_stock" },
    ],
  },
  {
    id: "badges",
    name: "Özel Ürünler",
    type: "CHECKBOX",
    isCollapsible: true,
    options: [
      { id: "badge-new", name: "Yeni Eklenen", value: "yeni" },
      { id: "badge-sale", name: "İndirimli", value: "indirimli" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Kategori slug'ına göre filtreleri getir
// ═══════════════════════════════════════════════════════════════════════════
export function getFiltersByCategory(categorySlug: string): FilterGroup[] {
  switch (categorySlug) {
    case "endustriyel-eldivenler":
      return GLOVE_FILTERS;
    case "tasinabilir-guc-kaynaklari":
      return POWER_STATION_FILTERS;
    case "gunes-panelleri":
      return SOLAR_PANEL_FILTERS;
    case "teleskopik-merdivenler":
      return LADDER_FILTERS;
    default:
      return STORE_GENERAL_FILTERS;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Tüm filtreleri getir (Mağaza sayfası için)
// ═══════════════════════════════════════════════════════════════════════════
export function getAllFilters(): FilterGroup[] {
  return STORE_GENERAL_FILTERS;
}
