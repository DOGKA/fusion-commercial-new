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
  // Diğer filtreler kaldırıldı (tüm ürünlerde aynı değerler)
];

