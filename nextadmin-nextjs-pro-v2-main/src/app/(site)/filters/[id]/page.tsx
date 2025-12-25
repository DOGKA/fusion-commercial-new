"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FilterOption {
  name: string;
  value: string;
}

interface Filter {
  id: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  sourceType: string;
  filterType: string;
  displayStyle: string;
  showCount: boolean;
  isCollapsible: boolean;
  isCollapsed: boolean;
  allowMultiple: boolean;
  minValue?: number;
  maxValue?: number;
  step?: number;
  order: number;
  isActive: boolean;
  options?: FilterOption[];
}

const filterTypes = [
  { value: "CHECKBOX", label: "Çoklu Seçim" },
  { value: "RADIO", label: "Tekli Seçim" },
  { value: "RANGE", label: "Aralık (Slider)" },
];

const displayStyles = [
  { value: "LIST", label: "Liste" },
  { value: "INLINE", label: "Yan Yana" },
];

export default function EditFilterPage() {
  const router = useRouter();
  const params = useParams();
  const filterId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<Filter | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

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
  const [options, setOptions] = useState<FilterOption[]>([]);

  // Range settings
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [step, setStep] = useState("");

  // Custom option ekleme
  const [optionName, setOptionName] = useState("");
  const [optionValue, setOptionValue] = useState("");

  const addCustomOption = () => {
    if (!optionName.trim() || !optionValue.trim()) {
      alert("Seçenek adı ve değeri gerekli!");
      return;
    }
    setOptions([...options, { name: optionName, value: optionValue }]);
    setOptionName("");
    setOptionValue("");
  };

  const removeCustomOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  // Load filter data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch filter
        const filterRes = await fetch(`/api/filters/${filterId}`);
        if (!filterRes.ok) {
          router.push("/filters");
          return;
        }
        const filterData = await filterRes.json();
        setFilter(filterData);

        // Set form values
        setName(filterData.name);
        setCategoryId(filterData.categoryId || "");
        setFilterType(filterData.filterType);
        setDisplayStyle(filterData.displayStyle);
        setShowCount(filterData.showCount);
        setIsCollapsible(filterData.isCollapsible);
        setIsCollapsed(filterData.isCollapsed);
        setAllowMultiple(filterData.allowMultiple);
        setIsActive(filterData.isActive);
        setOptions(filterData.options || []);
        setMinValue(filterData.minValue?.toString() || "");
        setMaxValue(filterData.maxValue?.toString() || "");
        setStep(filterData.step?.toString() || "");

        // Fetch categories
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(Array.isArray(catData) ? catData : []);
        }
      } catch (error) {
        console.error("Error loading filter:", error);
      } finally {
        setLoading(false);
      }
    };

    if (filterId) {
      fetchData();
    }
  }, [filterId, router]);

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

    setSaving(true);

    try {
      const res = await fetch(`/api/filters/${filterId}`, {
        method: "PUT",
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
          customOptions: filterType !== "RANGE" ? options : [],
        }),
      });

      if (res.ok) {
        router.push("/filters");
      } else {
        const data = await res.json();
        alert(data.error || "Filtre güncellenemedi!");
      }
    } catch (error) {
      console.error("Error updating filter:", error);
      alert("Bir hata oluştu!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!filter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-gray-500">Filtre bulunamadı</p>
        <Link href="/filters" className="px-4 py-2 rounded-lg bg-primary text-white">
          Filtrelere Dön
        </Link>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-dark dark:text-white">Filtreyi Düzenle</h1>
            <p className="text-gray-500">{filter.name}</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Filtre Adı */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <label className="mb-2 block text-sm font-medium">Filtre Adı *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
            required
          />
        </div>

        {/* Kategori */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <label className="mb-2 block text-sm font-medium">Kategori *</label>
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
        </div>

        {/* Filtre Tipi */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <label className="mb-4 block text-sm font-medium">Filtre Tipi</label>
          <div className="grid grid-cols-3 gap-3">
            {filterTypes.map((ft) => (
              <button
                key={ft.value}
                type="button"
                onClick={() => setFilterType(ft.value)}
                className={`p-4 rounded-lg border-2 text-center ${
                  filterType === ft.value
                    ? "border-primary bg-primary/5"
                    : "border-stroke dark:border-dark-3"
                }`}
              >
                <p className="font-medium text-sm">{ft.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Görünüm */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <label className="mb-4 block text-sm font-medium">Görünüm</label>
          <div className="grid grid-cols-2 gap-3">
            {displayStyles.map((ds) => (
              <button
                key={ds.value}
                type="button"
                onClick={() => setDisplayStyle(ds.value)}
                className={`p-3 rounded-lg border-2 text-center ${
                  displayStyle === ds.value
                    ? "border-primary bg-primary/5"
                    : "border-stroke dark:border-dark-3"
                }`}
              >
                <p className="text-sm">{ds.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Seçenekler */}
        {filterType !== "RANGE" && (
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-4 block text-sm font-medium">
              Filtre Seçenekleri ({options.length})
            </label>
            
            {/* Mevcut Seçenekler */}
            {options.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {options.map((opt, index) => (
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
                Örnek: "Evet" / "true", "100W" / "100", "S / 08" / "S,08"
              </p>
            </div>
          </div>
        )}

        {/* Ayarlar */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <label className="mb-4 block text-sm font-medium">Ayarlar</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 rounded text-primary"
              />
              <span className="text-sm">Aktif</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showCount}
                onChange={(e) => setShowCount(e.target.checked)}
                className="h-5 w-5 rounded text-primary"
              />
              <span className="text-sm">Ürün sayısını göster</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isCollapsible}
                onChange={(e) => setIsCollapsible(e.target.checked)}
                className="h-5 w-5 rounded text-primary"
              />
              <span className="text-sm">Daraltılabilir</span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
