"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PresetValue {
  value: string;
  label: string;
}

interface FeatureDefinition {
  id: string;
  name: string;
  slug: string;
  inputType: 'TEXT' | 'NUMBER' | 'SELECT';
  unit: string | null;
  presetValues: PresetValue[];
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const filterTypes = [
  { value: "CHECKBOX", label: "Çoklu Seçim", desc: "Birden fazla seçenek seçilebilir", forTypes: ['SELECT', 'TEXT'] },
  { value: "RADIO", label: "Tekli Seçim", desc: "Sadece bir seçenek seçilebilir", forTypes: ['SELECT', 'TEXT'] },
  { value: "RANGE", label: "Aralık (Slider)", desc: "Min-Max değer aralığı", forTypes: ['NUMBER'] },
  { value: "DROPDOWN", label: "Açılır Menü", desc: "Dropdown seçimi", forTypes: ['SELECT', 'TEXT'] },
];

const FilterTypeIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    CHECKBOX: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
    RADIO: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>,
    RANGE: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>,
    DROPDOWN: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>,
  };
  return icons[type] || icons.CHECKBOX;
};

const displayStyles = [
  { value: "LIST", label: "Liste" },
  { value: "INLINE", label: "Yan Yana" },
  { value: "GRID", label: "Izgara" },
  { value: "DROPDOWN", label: "Açılır Menü" },
];

export default function NewFilterPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFeatures, setCategoryFeatures] = useState<FeatureDefinition[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>("");
  const [filterType, setFilterType] = useState("CHECKBOX");
  const [displayStyle, setDisplayStyle] = useState("LIST");
  const [showCount, setShowCount] = useState(true);
  const [isCollapsible, setIsCollapsible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [isActive, setIsActive] = useState(true);
  
  // Range settings
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [step, setStep] = useState("");

  // Custom options (SELECT olmayan özellikler için)
  const [customOptions, setCustomOptions] = useState<{ name: string; value: string }[]>([]);
  const [optionName, setOptionName] = useState("");
  const [optionValue, setOptionValue] = useState("");

  // Get selected feature
  const selectedFeature = useMemo(() => 
    categoryFeatures.find(f => f.id === selectedFeatureId),
    [categoryFeatures, selectedFeatureId]
  );

  // Filter types based on selected feature
  const availableFilterTypes = useMemo(() => {
    if (!selectedFeature) return filterTypes;
    return filterTypes.filter(ft => ft.forTypes.includes(selectedFeature.inputType));
  }, [selectedFeature]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories?includeAll=true");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch category features when category changes
  useEffect(() => {
    if (!categoryId) {
      setCategoryFeatures([]);
      setSelectedFeatureId("");
      return;
    }

    const fetchFeatures = async () => {
      setLoadingFeatures(true);
      try {
        const res = await fetch(`/api/admin/categories/${categoryId}/features`);
        if (res.ok) {
          const data = await res.json();
          setCategoryFeatures(data.features || []);
        }
      } catch (error) {
        console.error("Error fetching features:", error);
      } finally {
        setLoadingFeatures(false);
      }
    };
    fetchFeatures();
  }, [categoryId]);

  // Auto-populate options when SELECT feature is selected
  useEffect(() => {
    if (selectedFeature) {
      // Auto-set filter name
      if (!name) {
        setName(selectedFeature.name);
      }

      // Auto-populate options for SELECT features
      if (selectedFeature.inputType === 'SELECT' && selectedFeature.presetValues.length > 0) {
        setCustomOptions(selectedFeature.presetValues.map(pv => ({
          name: pv.label || pv.value,
          value: pv.value
        })));
      } else {
        setCustomOptions([]);
      }

      // Auto-select appropriate filter type
      if (selectedFeature.inputType === 'NUMBER') {
        setFilterType('RANGE');
      } else {
        setFilterType('CHECKBOX');
      }
    }
  }, [selectedFeatureId, selectedFeature]);

  const addCustomOption = () => {
    if (!optionName.trim() || !optionValue.trim()) {
      alert("Seçenek adı ve değeri gerekli!");
      return;
    }
    setCustomOptions([...customOptions, { name: optionName, value: optionValue }]);
    setOptionName("");
    setOptionValue("");
  };

  const removeCustomOption = (index: number) => {
    setCustomOptions(customOptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("Filtre adı gerekli!");
      return;
    }

    if (!categoryId) {
      alert("Lütfen bir kategori seçin!");
      return;
    }

    if (!selectedFeatureId) {
      alert("Lütfen bir özellik seçin!");
      return;
    }

    if (filterType !== "RANGE" && customOptions.length === 0) {
      alert("Lütfen en az bir seçenek ekleyin!");
      return;
    }

    setSaving(true);
    
    try {
      const res = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId,
          featureId: selectedFeatureId,
          sourceType: "FEATURE",
          filterType,
          displayStyle,
          showCount,
          allowMultiple: filterType === "CHECKBOX" ? allowMultiple : false,
          isCollapsible,
          isCollapsed,
          isActive,
          minValue: filterType === "RANGE" && minValue ? parseFloat(minValue) : null,
          maxValue: filterType === "RANGE" && maxValue ? parseFloat(maxValue) : null,
          step: filterType === "RANGE" && step ? parseFloat(step) : null,
          customOptions: filterType !== "RANGE" ? customOptions : [],
        }),
      });

      if (res.ok) {
        router.push("/filters");
      } else {
        const data = await res.json();
        alert(data.error || "Filtre oluşturulamadı!");
      }
    } catch (error) {
      console.error("Error creating filter:", error);
      alert("Bir hata oluştu!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/filters"
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-stroke hover:bg-gray-100 dark:border-dark-3 dark:hover:bg-dark-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">Yeni Filtre Oluştur</h1>
            <p className="text-gray-500">Teknik özelliklerden filtre oluşturun</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Kaydediliyor..." : "Filtreyi Kaydet"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel - Ana Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kategori Seçimi */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-4 block text-sm font-medium">1. Kategori Seçin *</label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span>Kategoriler yükleniyor...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Henüz kategori tanımlanmamış.
                </p>
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSelectedFeatureId("");
                  setCustomOptions([]);
                }}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                required
              >
                <option value="">Kategori Seçin...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Özellik Seçimi */}
          {categoryId && (
            <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
              <label className="mb-4 block text-sm font-medium">2. Teknik Özellik Seçin *</label>
              {loadingFeatures ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span>Özellikler yükleniyor...</span>
                </div>
              ) : categoryFeatures.length === 0 ? (
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Bu kategoride henüz özellik tanımlanmamış. Önce &quot;Özellikler&quot; sayfasından özellik ekleyin.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categoryFeatures.map((feature) => (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => setSelectedFeatureId(feature.id)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedFeatureId === feature.id
                          ? "border-primary bg-primary/5"
                          : "border-stroke dark:border-dark-3 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-dark dark:text-white">
                            {feature.name}
                            {feature.unit && (
                              <span className="text-gray-400 font-normal ml-1">({feature.unit})</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {feature.inputType === 'SELECT' && feature.presetValues.length > 0 
                              ? `${feature.presetValues.length} seçenek: ${feature.presetValues.map(p => p.label).join(', ')}`
                              : feature.inputType === 'NUMBER' 
                                ? 'Sayısal değer - Aralık filtresi önerilir'
                                : 'Serbest metin'}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          feature.inputType === 'SELECT' 
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                            : feature.inputType === 'NUMBER'
                              ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                        }`}>
                          {feature.inputType === 'SELECT' ? 'Seçim' : feature.inputType === 'NUMBER' ? 'Sayı' : 'Metin'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Filtre Adı */}
          {selectedFeatureId && (
            <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
              <label className="mb-2 block text-sm font-medium">3. Filtre Adı *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Kablosuz Şarj, Kapasite..."
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-lg font-medium dark:border-dark-3 focus:border-primary focus:outline-none"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Frontend&apos;de görünecek filtre başlığı
              </p>
            </div>
          )}

          {/* Filtre Seçenekleri */}
          {selectedFeatureId && filterType !== "RANGE" && (
            <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
              <label className="mb-4 block text-sm font-medium">4. Filtre Seçenekleri *</label>
              
              {/* Otomatik Yüklenen Seçenekler Bilgisi */}
              {selectedFeature?.inputType === 'SELECT' && selectedFeature.presetValues.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    ✓ Seçenekler özellik tanımından otomatik yüklendi
                  </p>
                </div>
              )}
              
              {/* Mevcut Seçenekler */}
              {customOptions.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {customOptions.map((opt, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      <span>{opt.name}</span>
                      <span className="text-xs opacity-60">({opt.value})</span>
                      <button
                        type="button"
                        onClick={() => removeCustomOption(index)}
                        className="hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Manuel Seçenek Ekleme */}
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Manuel seçenek ekle:</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    placeholder="Görünen Ad (örn: Evet)"
                    className="px-4 py-2.5 rounded-lg border border-stroke bg-transparent dark:border-dark-3 focus:border-primary focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={optionValue}
                    onChange={(e) => setOptionValue(e.target.value)}
                    placeholder="Filtre Değeri (örn: Evet)"
                    className="px-4 py-2.5 rounded-lg border border-stroke bg-transparent dark:border-dark-3 focus:border-primary focus:outline-none text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={addCustomOption}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-dashed border-stroke dark:border-dark-3 hover:border-primary hover:bg-primary/5 text-sm font-medium transition-colors"
                >
                  + Seçenek Ekle
                </button>
              </div>
            </div>
          )}

          {/* Filtre Tipi */}
          {selectedFeatureId && (
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
              <label className="mb-4 block text-sm font-medium">5. Filtre Tipi</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableFilterTypes.map((ft) => (
                <button
                  key={ft.value}
                  type="button"
                  onClick={() => setFilterType(ft.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    filterType === ft.value
                      ? "border-primary bg-primary/5"
                      : "border-stroke dark:border-dark-3 hover:border-primary/50"
                  }`}
                >
                  <div className="mb-2 text-primary"><FilterTypeIcon type={ft.value} className="w-6 h-6" /></div>
                  <p className="font-medium text-dark dark:text-white text-sm">{ft.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{ft.desc}</p>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Aralık Ayarları (sadece RANGE tipi için) */}
          {selectedFeatureId && filterType === "RANGE" && (
            <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
              <label className="mb-4 block text-sm font-medium">Aralık Ayarları</label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-xs text-gray-500">Minimum Değer</label>
                  <input
                    type="number"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 dark:border-dark-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs text-gray-500">Maksimum Değer</label>
                  <input
                    type="number"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    placeholder="10000"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 dark:border-dark-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs text-gray-500">Adım</label>
                  <input
                    type="number"
                    value={step}
                    onChange={(e) => setStep(e.target.value)}
                    placeholder="100"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 dark:border-dark-3 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              {selectedFeature?.unit && (
                <p className="mt-2 text-xs text-gray-500">
                  Birim: {selectedFeature.unit}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sağ Panel - Ayarlar */}
        <div className="space-y-6">
          {/* Görünüm Ayarları */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Görünüm</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs text-gray-500">Görüntüleme Stili</label>
                <select
                  value={displayStyle}
                  onChange={(e) => setDisplayStyle(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 dark:border-dark-3"
                >
                  {displayStyles.map((ds) => (
                    <option key={ds.value} value={ds.value}>{ds.label}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCount}
                  onChange={(e) => setShowCount(e.target.checked)}
                  className="h-5 w-5 rounded text-primary"
                />
                <span className="text-sm">Ürün sayısını göster</span>
              </label>

              {filterType === "CHECKBOX" && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowMultiple}
                    onChange={(e) => setAllowMultiple(e.target.checked)}
                    className="h-5 w-5 rounded text-primary"
                  />
                  <span className="text-sm">Çoklu seçim</span>
                </label>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCollapsible}
                  onChange={(e) => setIsCollapsible(e.target.checked)}
                  className="h-5 w-5 rounded text-primary"
                />
                <span className="text-sm">Daraltılabilir</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCollapsed}
                  onChange={(e) => setIsCollapsed(e.target.checked)}
                  className="h-5 w-5 rounded text-primary"
                />
                <span className="text-sm">Varsayılan daraltılmış</span>
              </label>
            </div>
          </div>

          {/* Durum */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Durum</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 rounded text-primary"
              />
              <div>
                <span className="text-sm font-medium text-dark dark:text-white">Aktif</span>
                <p className="text-xs text-gray-500">Filtre frontend&apos;de görünsün</p>
              </div>
            </label>
          </div>

          {/* Önizleme */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Önizleme</h3>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-dark-2">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-dark dark:text-white text-sm">
                  {name || "Filtre Adı"}
                </span>
                {isCollapsible && (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
              {filterType === "RANGE" ? (
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 dark:bg-dark-3 rounded-full">
                    <div className="h-full w-1/2 bg-primary rounded-full"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{minValue || "0"} {selectedFeature?.unit || ''}</span>
                    <span>{maxValue || "10000"} {selectedFeature?.unit || ''}</span>
                  </div>
                </div>
              ) : customOptions.length > 0 ? (
                <div className="space-y-2">
                  {customOptions.slice(0, 4).map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type={filterType === "RADIO" ? "radio" : "checkbox"} name="preview" className="h-4 w-4 rounded" />
                      <span>{opt.name}</span>
                      {showCount && <span className="text-xs text-gray-400">(12)</span>}
                    </label>
                  ))}
                  {customOptions.length > 4 && (
                    <span className="text-xs text-gray-400">+{customOptions.length - 4} daha...</span>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400">Seçenek ekleyin...</div>
              )}
            </div>
          </div>

          {/* Bilgi */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-5">
            <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-400 text-sm">💡 Nasıl Çalışır?</h3>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Bu filtre, seçilen teknik özelliğe göre ürünleri filtreleyecektir. 
              Örneğin &quot;Kablosuz Şarj = Evet&quot; seçildiğinde, ProductFeatureValue 
              tablosunda bu değere sahip ürünler listelenecektir.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
