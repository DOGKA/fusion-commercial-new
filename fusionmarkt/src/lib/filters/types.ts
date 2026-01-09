/**
 * Filtre Tipleri - Ortak Tip Tanımlamaları
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

