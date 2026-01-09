/**
 * Teleskopik Merdivenler Filtreleri
 * Tüm değerler ProductFeatureValue'dan çekiliyor
 */

import { FilterGroup } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// Mevcut Stok: 1600ET ve TS1600ET
// Özellikler: 3.8m, 13 basamak, Alüminyum Kevlar, Yalıtkan
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
    options: [
      { id: "type-tele", name: "Teleskopik", value: "teleskopik" },
    ],
  },
];

