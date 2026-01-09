/**
 * Güneş Panelleri Filtreleri
 * Tüm değerler ProductFeatureValue'dan çekiliyor
 */

import { FilterGroup } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// Panel Güçleri:
//   - SP100: 100W
//   - SP200: 200W
//   - SP400: 400W
//
// Ortak Özellikler:
//   - Hücre Tipi: Tümü Monocrystalline Silicon
//   - IP Koruma: Tümü IP67
//   - Katlanma Tipi: Tümü 4 Fold
// ═══════════════════════════════════════════════════════════════════════════

export const SOLAR_PANEL_FILTERS: FilterGroup[] = [
  {
    id: "panel_power",
    name: "Panel Gücü (W)",
    type: "CHECKBOX",
    isCollapsible: true,
    options: [
      { id: "watt-100", name: "100W", value: "100" },
      { id: "watt-200", name: "200W", value: "200" },
      { id: "watt-400", name: "400W", value: "400" },
    ],
  },
  {
    id: "cell_type",
    name: "Hücre Tipi",
    type: "RADIO",
    isCollapsible: true,
    options: [
      { id: "cell-mono", name: "Monocrystalline", value: "Monocrystalline Silicon" },
      { id: "cell-poly", name: "Polycrystalline", value: "Polycrystalline Silicon" },
      { id: "cell-perc", name: "PERC", value: "PERC" },
    ],
  },
  {
    id: "folding_type",
    name: "Katlanma Tipi",
    type: "RADIO",
    isCollapsible: true,
    options: [
      { id: "fold-2", name: "2 Fold", value: "2 Fold" },
      { id: "fold-4", name: "4 Fold", value: "4 Fold" },
      { id: "fold-6", name: "6 Fold", value: "6 Fold" },
      { id: "fold-no", name: "Katlanmaz", value: "Katlanmaz" },
    ],
  },
  {
    id: "ip_protection",
    name: "IP Koruma",
    type: "RADIO",
    isCollapsible: true,
    options: [
      { id: "ip-65", name: "IP65", value: "IP65" },
      { id: "ip-67", name: "IP67", value: "IP67" },
      { id: "ip-68", name: "IP68", value: "IP68" },
    ],
  },
];

