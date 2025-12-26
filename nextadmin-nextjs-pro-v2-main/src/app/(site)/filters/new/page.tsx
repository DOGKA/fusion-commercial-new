"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AttributeValue {
  id: string;
  name: string;
  slug: string;
  value?: string;
  color?: string;
  image?: string;
  order: number;
  isActive: boolean;
}

interface Attribute {
  id: string;
  name: string;
  slug: string;
  type: string;
  values: AttributeValue[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const filterTypes = [
  { value: "CHECKBOX", label: "Çoklu Seçim", desc: "Birden fazla seçenek seçilebilir" },
  { value: "RADIO", label: "Tekli Seçim", desc: "Sadece bir seçenek seçilebilir" },
  { value: "COLOR_SWATCH", label: "Renk Paleti", desc: "Renk kutuları ile görsel seçim" },
  { value: "IMAGE_SWATCH", label: "Görsel Seçim", desc: "Görsellerle seçim" },
  { value: "RANGE", label: "Aralık (Slider)", desc: "Min-Max değer aralığı" },
  { value: "DROPDOWN", label: "Açılır Menü", desc: "Dropdown seçimi" },
];

const FilterTypeIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    CHECKBOX: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
    RADIO: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>,
    COLOR_SWATCH: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r="3.5" /><path d="M3 13.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0" /><path d="M14 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0" /></svg>,
    IMAGE_SWATCH: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>,
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
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [filterType, setFilterType] = useState("CHECKBOX");
  const [displayStyle, setDisplayStyle] = useState("LIST");
  const [showCount, setShowCount] = useState(true);
  const [isCollapsible, setIsCollapsible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [isActive, setIsActive] = useState(true);
  
  // Attribute selection
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [autoPopulate, setAutoPopulate] = useState(true);
  
  // Range settings
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [step, setStep] = useState("");

  // Custom options (manuel seçenek ekleme)
  const [customOptions, setCustomOptions] = useState<{ name: string; value: string }[]>([]);
  const [optionName, setOptionName] = useState("");
  const [optionValue, setOptionValue] = useState("");

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

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch attributes on mount
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const res = await fetch("/api/filters/attributes");
        if (res.ok) {
          const data = await res.json();
          setAttributes(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching attributes:", error);
      } finally {
        setLoadingAttributes(false);
      }
    };
    fetchAttributes();
  }, []);

  // Get selected attribute
  const selectedAttribute = attributes.find(a => a.id === selectedAttributeId);

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
          sourceType: "ATTRIBUTE",
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
          customOptions,
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
            <p className="text-gray-500">Ürün filtreleme için yeni bir filtre ekleyin</p>
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
          {/* Filtre Adı */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-2 block text-sm font-medium">Filtre Adı *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Renk, Beden, Kapasite..."
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-lg font-medium dark:border-dark-3 focus:border-primary focus:outline-none"
              required
            />
          </div>

          {/* Kategori Seçimi */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-4 block text-sm font-medium">Kategori *</label>
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
                onChange={(e) => setCategoryId(e.target.value)}
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
            <p className="mt-2 text-xs text-gray-500">
              Bu filtre seçilen kategorideki ürünler için kullanılacaktır
            </p>
          </div>

          {/* Filtre Seçenekleri */}
          {filterType !== "RANGE" && (
            <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
              <label className="mb-4 block text-sm font-medium">Filtre Seçenekleri *</label>
              
              {/* Mevcut Seçenekler */}
              {customOptions.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {customOptions.map((opt, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      <span>{opt.name}</span>
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

              {/* Yeni Seçenek Ekle */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    placeholder="Seçenek Adı (örn: Evet)"
                    className="px-4 py-2.5 rounded-lg border border-stroke bg-transparent dark:border-dark-3 focus:border-primary focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={optionValue}
                    onChange={(e) => setOptionValue(e.target.value)}
                    placeholder="Değer (örn: true)"
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
                <p className="text-xs text-gray-500">
                  Örnek: &quot;Evet&quot; / &quot;true&quot;, &quot;100W&quot; / &quot;100&quot;, &quot;S / 08&quot; / &quot;S,08&quot;
                </p>
              </div>
            </div>
          )}

          {/* Filtre Tipi */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-4 block text-sm font-medium">Filtre Tipi</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filterTypes.map((ft) => (
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

          {/* Aralık Ayarları (sadece RANGE tipi için) */}
          {filterType === "RANGE" && (
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
              {filterType === "COLOR_SWATCH" && selectedAttribute ? (
                <div className="flex flex-wrap gap-2">
                  {selectedAttribute.values.slice(0, 6).map((val) => (
                    <div
                      key={val.id}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: val.color || "#ccc" }}
                      title={val.name}
                    />
                  ))}
                </div>
              ) : filterType === "RANGE" ? (
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 dark:bg-dark-3 rounded-full">
                    <div className="h-full w-1/2 bg-primary rounded-full"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{minValue || "0"}</span>
                    <span>{maxValue || "10000"}</span>
                  </div>
                </div>
              ) : selectedAttribute ? (
                <div className="space-y-2">
                  {selectedAttribute.values.slice(0, 4).map((val) => (
                    <label key={val.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type={filterType === "RADIO" ? "radio" : "checkbox"} name="preview" className="h-4 w-4 rounded" />
                      <span>{val.name}</span>
                      {showCount && <span className="text-xs text-gray-400">(12)</span>}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400">Özellik seçin...</div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
