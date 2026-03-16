/**
 * Taşınabilir Güç Kaynakları Filtreleri
 * Tüm değerler ProductFeatureValue'dan çekiliyor
 */

import { FilterGroup } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// Kapasite Değerleri:
//   - P800: 512 Wh
//   - Singo1000: 1008 Wh
//   - P1800: 1024 Wh
//   - Singo2000Pro: 1920 Wh
//   - P3200: 2048 Wh
//   - SH4000: 5120 Wh
//
// Çıkış Güçleri:
//   - P800: 800W / 1600W max
//   - Singo1000: 1000W / 2000W max
//   - P1800: 1800W / 3600W max
//   - Singo2000Pro: 2000W / 4000W max
//   - P3200: 3200W / 6400W max
//   - SH4000: 4000W / 8000W max
//
// Max. Solar Şarj:
//   - Singo1000: 200W
//   - P800: 300W
//   - P1800: 500W
//   - Singo2000Pro: 500W
//   - P3200: 1000W
//   - SH4000: 3000W
//
// Boolean Özellikler:
//   - Dahili Fener: P800 ✅, P1800 ✅, P3200 ✅
//   - Kablosuz Şarj: Singo1000 ✅, Singo2000Pro ✅
//   - Dahili Powerbank: P3200 ✅
//   - AC 220V Çıkış: Tümü ✅
// ═══════════════════════════════════════════════════════════════════════════

export const POWER_STATION_FILTERS: FilterGroup[] = [
  {
    id: "capacity",
    name: "Kapasite (Wh)",
    type: "CHECKBOX",
    isCollapsible: true,
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
      { id: "ac-yes", name: "Evet", value: "Evet" },
      { id: "ac-no", name: "Hayır", value: "Hayır" },
    ],
  },
  {
    id: "wireless_charging",
    name: "Kablosuz Şarj",
    type: "RADIO",
    isCollapsible: true,
    options: [
      { id: "wireless-yes", name: "Evet", value: "Evet" },
      { id: "wireless-no", name: "Hayır", value: "Hayır" },
    ],
  },
  {
    id: "builtin_flashlight",
    name: "Dahili Fener",
    type: "RADIO",
    isCollapsible: true,
    options: [
      { id: "flashlight-yes", name: "Evet", value: "Evet" },
      { id: "flashlight-no", name: "Hayır", value: "Hayır" },
    ],
  },
  {
    id: "builtin_powerbank",
    name: "Dahili Powerbank",
    type: "RADIO",
    isCollapsible: true,
    options: [
      { id: "powerbank-yes", name: "Evet", value: "Evet" },
      { id: "powerbank-no", name: "Hayır", value: "Hayır" },
    ],
  },
];

