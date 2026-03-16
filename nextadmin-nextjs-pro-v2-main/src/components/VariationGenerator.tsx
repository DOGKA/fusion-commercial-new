"use client";

import { useState } from "react";

interface OptionValue {
  id: string;
  value: string;
  hex?: string;
}

interface OptionGroup {
  id: string;
  name: string;
  type: 'select' | 'color';
  values: OptionValue[];
}

interface Variant {
  id: string;
  combinationKey: string;
  combination: Record<string, string>;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  image: string;
  isActive: boolean;
  displayValue: string;
  colorCode: string;
}

interface VariationGeneratorProps {
  optionGroups: OptionGroup[];
  existingVariants: Variant[];
  skuPrefix: string;
  onGenerate: (variants: Variant[]) => void;
}

export default function VariationGenerator({ 
  optionGroups, 
  existingVariants, 
  skuPrefix,
  onGenerate 
}: VariationGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Cartesian Product - Tüm kombinasyonları üret
  const generateCombinations = (groups: OptionGroup[]): Array<Record<string, string>> => {
    if (groups.length === 0) return [];
    if (groups.length === 1) {
      return groups[0].values.map(v => ({ [groups[0].name]: v.value }));
    }

    const [first, ...rest] = groups;
    const restCombinations = generateCombinations(rest);

    const combinations: Array<Record<string, string>> = [];
    for (const value of first.values) {
      for (const restCombo of restCombinations) {
        combinations.push({
          [first.name]: value.value,
          ...restCombo
        });
      }
    }

    return combinations;
  };

  // Combination Key oluştur: "color:black|size:m"
  const createCombinationKey = (combination: Record<string, string>): string => {
    return Object.entries(combination)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key.toLowerCase()}:${value.toLowerCase()}`)
      .join('|');
  };

  // SKU oluştur
  const generateSKU = (combination: Record<string, string>, index: number): string => {
    const prefix = skuPrefix || "VAR";
    const suffix = Object.values(combination)
      .map(v => v.substring(0, 3).toUpperCase())
      .join('-');
    return `${prefix}-${suffix}-${index + 1}`;
  };

  // Tahmini variant sayısı
  const estimatedCount = optionGroups.reduce((acc, group) => 
    acc * (group.values.length || 1), 1
  );

  const handleGenerate = () => {
    setIsGenerating(true);

    try {
      // Kombinasyonları üret
      const combinations = generateCombinations(optionGroups);

      // Her kombinasyon için variant oluştur
      const newVariants: Variant[] = combinations.map((combo, index) => {
        const combinationKey = createCombinationKey(combo);
        
        // Mevcut variant varsa koru
        const existing = existingVariants.find(v => v.combinationKey === combinationKey);
        
        if (existing) {
          return existing;
        }

        // Yeni variant oluştur
        // İlk değeri displayValue olarak kullan, renk tipindeyse hex'i colorCode olarak kullan
        const firstValue = Object.values(combo)[0] || "";
        const firstKey = Object.keys(combo)[0] || "";
        const optionGroup = optionGroups.find(g => g.name === firstKey);
        const optionValue = optionGroup?.values.find(v => v.value === firstValue);
        
        return {
          id: `var_${Date.now()}_${index}`,
          combinationKey,
          combination: combo,
          sku: generateSKU(combo, index),
          price: "",
          salePrice: "",
          stock: "0",
          image: "",
          isActive: true,
          displayValue: firstValue, // Varsayılan olarak ilk değer
          colorCode: optionValue?.hex || "" // Renk seçildiyse hex kodu
        };
      });

      onGenerate(newVariants);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasGroups = optionGroups.length > 0;
  const hasValues = optionGroups.every(g => g.values.length > 0);
  const isOverLimit = estimatedCount > 100;

  return (
    <div className="space-y-4">
      {/* Bilgi Kartları */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-stroke dark:border-dark-3 p-4">
          <p className="text-sm text-gray-500 mb-1">Opsiyon Grupları</p>
          <p className="text-2xl font-bold text-dark dark:text-white">{optionGroups.length}</p>
        </div>
        <div className="rounded-lg border border-stroke dark:border-dark-3 p-4">
          <p className="text-sm text-gray-500 mb-1">Tahmini Varyant</p>
          <p className="text-2xl font-bold text-dark dark:text-white">{estimatedCount}</p>
        </div>
        <div className="rounded-lg border border-stroke dark:border-dark-3 p-4">
          <p className="text-sm text-gray-500 mb-1">Mevcut Varyant</p>
          <p className="text-2xl font-bold text-dark dark:text-white">{existingVariants.length}</p>
        </div>
      </div>

      {/* Uyarılar */}
      {isOverLimit && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Çok Fazla Kombinasyon</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {estimatedCount} varyant oluşturulacak. Bu sayı performans sorunlarına yol açabilir.
                Opsiyon değerlerini azaltmayı düşünün.
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasGroups && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Opsiyon Grubu Ekleyin</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Varyasyon oluşturmak için önce yukarıdan opsiyon grupları ekleyin.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasGroups && !hasValues && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Değer Ekleyin</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Tüm opsiyon gruplarına en az bir değer ekleyin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Butonu */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {existingVariants.length > 0 && (
            <p>
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Mevcut varyantlar korunacak, yeni kombinasyonlar eklenecek
            </p>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={!hasGroups || !hasValues || isGenerating}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Oluşturuluyor...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Varyantları Oluştur
            </>
          )}
        </button>
      </div>
    </div>
  );
}
