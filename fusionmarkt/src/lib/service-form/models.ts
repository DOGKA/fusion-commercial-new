/**
 * Servis formu ürün kataloğu (kategori + model).
 * Adım 1 yalnızca bunu yükler; teşhis soruları `diagnostics.ts` içinde
 * ayrı chunk olarak gelir.
 */

export type ProductCategoryId = "power-station" | "solar-panel";

export type ProductCategory = {
  id: ProductCategoryId;
  label: string;
  description: string;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: "power-station",
    label: "Taşınabilir Güç Kaynağı",
    description: "P serisi, Singo2000 PRO, SH4000 ve B5120 genişletme bataryası",
  },
  {
    id: "solar-panel",
    label: "Güneş Paneli",
    description: "SP serisi katlanabilir taşınabilir güneş panelleri",
  },
];

/**
 * Modelin fiziksel olarak sahip olduğu özellikler. Soruların görünürlüğü
 * buna bağlı: fanı olmayan bir üründe fan sorusu sorulmuyor.
 */
export type ModelTrait =
  | "screen"
  | "fan"
  | "ledPanel"
  | "app"
  | "carInput"
  | "dualMppt"
  | "expansionBattery";

export type ProductModel = {
  id: string;
  label: string;
  summary?: string;
  category: ProductCategoryId;
  traits: ModelTrait[];
  /** Teşhis adımındaki "hangi çıkış" sorusunun seçenekleri. */
  outputs?: string[];
  /** Panellerde beklenen açık devre voltajı (V) — ölçüm ipucunda gösteriliyor. */
  vocV?: number;
};

const COMMON_OUTPUTS = ["AC prizler", "USB çıkışları", "Araç çakmak (12V DC)"];

export const PRODUCT_MODELS: ProductModel[] = [
  {
    id: "P800",
    label: "P800",
    summary: "512 Wh / 1600 W max.",
    category: "power-station",
    traits: ["screen", "fan", "ledPanel", "carInput"],
    outputs: [...COMMON_OUTPUTS, "DC 5525 çıkışı"],
  },
  {
    id: "P1800",
    label: "P1800",
    summary: "1024 Wh / 3600 W max.",
    category: "power-station",
    traits: ["screen", "fan", "ledPanel", "app", "carInput"],
    outputs: [...COMMON_OUTPUTS, "DC 5525 çıkışı"],
  },
  {
    id: "Singo2000Pro",
    label: "Singo2000 PRO",
    summary: "1920 Wh / 4000 W max.",
    category: "power-station",
    traits: ["screen", "fan", "ledPanel", "app", "carInput"],
    outputs: [...COMMON_OUTPUTS, "DC çıkışı", "Kablosuz şarj pedi"],
  },
  {
    id: "P3200",
    label: "P3200",
    summary: "2048 Wh / 6400 W max.",
    category: "power-station",
    traits: ["screen", "fan", "ledPanel", "app", "carInput"],
    outputs: [...COMMON_OUTPUTS, "DC 5525 çıkışı", "Dahili powerbank / jump-starter"],
  },
  {
    id: "SH4000",
    label: "SH4000",
    summary: "5120 Wh / 8000 W max.",
    category: "power-station",
    traits: ["screen", "fan", "ledPanel", "app", "carInput", "dualMppt"],
    outputs: ["AC prizler", "USB çıkışları", "XT60 DC çıkışı (12V / 24V / 36V)"],
  },
  {
    id: "B5120",
    label: "B5120 Genişletme Bataryası",
    summary: "5120 Wh — SH4000 uyumlu",
    category: "power-station",
    traits: ["expansionBattery"],
  },
  {
    id: "SP100",
    label: "SP100",
    summary: "100 W katlanabilir panel",
    category: "solar-panel",
    traits: [],
    vocV: 21.6,
  },
  {
    id: "SP200",
    label: "SP200",
    summary: "200 W katlanabilir panel",
    category: "solar-panel",
    traits: [],
    vocV: 28.8,
  },
  {
    id: "SP400",
    label: "SP400",
    summary: "400 W katlanabilir panel",
    category: "solar-panel",
    traits: [],
    vocV: 52.8,
  },
];

export function getModelsByCategory(category: ProductCategoryId): ProductModel[] {
  return PRODUCT_MODELS.filter((m) => m.category === category);
}

export function findModel(idOrLabel: string | null): ProductModel | null {
  if (!idOrLabel) return null;
  return (
    PRODUCT_MODELS.find((m) => m.id === idOrLabel) ??
    PRODUCT_MODELS.find((m) => m.label === idOrLabel) ??
    null
  );
}

export function getCategoryLabel(categoryId: string | null | undefined): string {
  if (!categoryId) return "";
  return PRODUCT_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}

export type DiagnosticAnswers = Record<string, string | string[]>;
