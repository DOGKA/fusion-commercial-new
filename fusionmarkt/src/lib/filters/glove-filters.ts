/**
 * Endüstriyel Eldivenler Filtreleri
 * Tüm değerler ProductFeatureValue'dan çekiliyor
 */

import { FilterGroup } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// Beden Eşleştirmesi: S=08, M=09, L=10, XL=11
// Dokunmatik Ekran: TG1290, TG6240 (Evet), diğerleri (Hayır)
// ═══════════════════════════════════════════════════════════════════════════

export const GLOVE_FILTERS: FilterGroup[] = [
  {
    id: "size",
    name: "Beden",
    type: "CHECKBOX",
    isCollapsible: true,
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
    options: [
      { id: "touch-yes", name: "Evet", value: "Evet" },
      { id: "touch-no", name: "Hayır", value: "Hayır" },
    ],
  },
];

