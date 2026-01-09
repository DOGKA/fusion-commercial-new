/**
 * Genel Mağaza Filtreleri
 * Tüm kategoriler için ortak filtreler
 */

import { FilterGroup } from "./types";

export const GENERAL_FILTERS: FilterGroup[] = [
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

