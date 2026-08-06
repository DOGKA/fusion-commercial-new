"use client";

import { BatteryCharging, Info, Sun } from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  getModelsByCategory,
  type ProductCategoryId,
  type ProductModel,
} from "@/lib/service-form/models";
import { FieldError } from "./FieldError";

const CATEGORY_ICONS: Record<ProductCategoryId, typeof Sun> = {
  "power-station": BatteryCharging,
  "solar-panel": Sun,
};

type Props = {
  category: ProductCategoryId | null;
  model: ProductModel | null;
  serialNumber: string;
  errors: Record<string, string | undefined>;
  onCategoryChange: (category: ProductCategoryId) => void;
  onModelChange: (model: ProductModel) => void;
  onSerialNumberChange: (value: string) => void;
};

export function ProductStep({
  category,
  model,
  serialNumber,
  errors,
  onCategoryChange,
  onModelChange,
  onSerialNumberChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">
          Ürün Kategorisi <span className="text-[var(--fusion-primary)]">*</span>
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {PRODUCT_CATEGORIES.map((item) => {
            const Icon = CATEGORY_ICONS[item.id];
            const isSelected = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onCategoryChange(item.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "border-[var(--fusion-primary)] bg-[var(--fusion-primary)]/10"
                    : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--glass-border-hover)]"
                } ${errors.category ? "border-[var(--fusion-error)]" : ""}`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isSelected
                        ? "text-[var(--fusion-primary)]"
                        : "text-[var(--foreground-tertiary)]"
                    }`}
                  />
                  <span className="font-semibold text-sm sm:text-base">{item.label}</span>
                </div>
                <p className="text-xs text-[var(--foreground-tertiary)] leading-relaxed">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
        <FieldError message={errors.category} />
      </div>

      {category && (
        <div className="animate-[fadeInUp_0.3s_ease-out_both]">
          <label className="block text-sm font-medium mb-3">
            Ürün Modeli <span className="text-[var(--fusion-primary)]">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {getModelsByCategory(category).map((item) => {
              const isSelected = model?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onModelChange(item)}
                  className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-[var(--fusion-primary)] bg-[var(--fusion-primary)]/10 text-[var(--fusion-primary)]"
                      : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--glass-border-hover)]"
                  } ${errors.model ? "border-[var(--fusion-error)]" : ""}`}
                >
                  <span className="block text-sm font-medium leading-tight">{item.label}</span>
                  {item.summary && (
                    <span className="block text-[10px] sm:text-xs text-[var(--foreground-tertiary)] mt-0.5 leading-tight">
                      {item.summary}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[var(--foreground-tertiary)]">
            Model adı cihazın üzerindeki etikette ve kutusunda yazmaktadır.
          </p>
          <FieldError message={errors.model} />
        </div>
      )}

      {model && (
        <div className="animate-[fadeInUp_0.3s_ease-out_both]">
          <label className="block text-sm font-medium mb-2">Seri Numarası</label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => onSerialNumberChange(e.target.value)}
            className="glass-input w-full px-3 sm:px-4 py-3 rounded-xl text-sm sm:text-base"
            placeholder="Örn: SN2024XXXXXXX"
          />
          <div className="mt-2 flex items-start gap-2 text-xs text-[var(--foreground-tertiary)] leading-relaxed">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Seri numarası cihazın alt yüzeyindeki veya arka panelindeki etikette yazar.
              Bulamıyorsanız boş bırakabilir, son adımda etiketin fotoğrafını yükleyebilirsiniz.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
