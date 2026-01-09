/**
 * Kategori Bazlı Filtre Tanımlamaları
 * Her kategori için filtreler ayrı dosyalarda
 */

export * from "./types";
export { GLOVE_FILTERS } from "./glove-filters";
export { POWER_STATION_FILTERS } from "./power-station-filters";
export { SOLAR_PANEL_FILTERS } from "./solar-panel-filters";
export { LADDER_FILTERS } from "./ladder-filters";
export { GENERAL_FILTERS } from "./general-filters";

import { FilterGroup } from "./types";
import { GLOVE_FILTERS } from "./glove-filters";
import { POWER_STATION_FILTERS } from "./power-station-filters";
import { SOLAR_PANEL_FILTERS } from "./solar-panel-filters";
import { LADDER_FILTERS } from "./ladder-filters";
import { GENERAL_FILTERS } from "./general-filters";

/**
 * Kategori slug'ına göre filtreleri getir
 */
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
      return GENERAL_FILTERS;
  }
}

/**
 * Tüm filtreleri getir (Mağaza sayfası için)
 */
export function getAllFilters(): FilterGroup[] {
  return GENERAL_FILTERS;
}
