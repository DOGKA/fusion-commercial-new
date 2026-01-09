"use client";

import { useState, useEffect, useMemo } from "react";

interface FeaturePresetValue {
  id: string;
  value: string;
  label?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductValue {
  id: string;
  valueText: string | null;
  valueNumber: number | null;
  unit: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail?: string | null;
  };
}

interface FeatureDefinition {
  id: string;
  name: string;
  slug: string;
  inputType: 'TEXT' | 'NUMBER' | 'SELECT';
  unit?: string | null;
  description?: string | null;
  isActive: boolean;
  presetValues: FeaturePresetValue[];
  productValues?: ProductValue[];
  _count: {
    categories: number;
    productValues: number;
  };
}

interface CategoryWithFeatures {
  id: string;
  name: string;
  slug: string;
  features: FeatureDefinition[];
}

export default function AttributesPage() {
  const [features, setFeatures] = useState<FeatureDefinition[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFeatureMap, setCategoryFeatureMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureDefinition | null>(null);
  
  // Kategori atama modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [assigningFeature, setAssigningFeature] = useState<FeatureDefinition | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [savingCategories, setSavingCategories] = useState(false);
  
  // Yeni özellik form state
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newInputType, setNewInputType] = useState<'TEXT' | 'NUMBER' | 'SELECT'>('TEXT');
  const [newUnit, setNewUnit] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPresetValues, setNewPresetValues] = useState<string[]>([]);
  const [newPresetInput, setNewPresetInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Verileri çek
  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feature-definitions?includePresets=true&includeProductValues=true");
      if (res.ok) {
        const data = await res.json();
        setFeatures(data.features || []);
      }
    } catch (error) {
      console.error("Error fetching features:", error);
    } finally {
      setLoading(false);
    }
  };

  // Kategorileri ve özellik ilişkilerini çek
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?includeAll=true&includeFeatures=true");
      if (res.ok) {
        const data = await res.json();
        const cats = data.categories || data || [];
        setCategories(cats);
        
        // Kategori-özellik mapping oluştur
        const mapping: Record<string, string[]> = {};
        for (const cat of cats) {
          if (cat.categoryFeatures) {
            mapping[cat.id] = cat.categoryFeatures.map((cf: any) => cf.featureId || cf.feature?.id);
          }
        }
        setCategoryFeatureMap(mapping);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchFeatures();
    fetchCategories();
  }, []);

  // Kategorilere göre özellik gruplandırma
  const categorizedFeatures = useMemo(() => {
    const result: CategoryWithFeatures[] = [];
    
    for (const cat of categories) {
      const catFeatureIds = categoryFeatureMap[cat.id] || [];
      const catFeatures = features.filter(f => catFeatureIds.includes(f.id));
      if (catFeatures.length > 0) {
        result.push({
          ...cat,
          features: catFeatures
        });
      }
    }
    
    return result;
  }, [categories, features, categoryFeatureMap]);

  // Filtrelenmiş özellikler
  const filteredFeatures = useMemo(() => {
    if (selectedCategory === "all") {
      return features;
    }
    const catFeatureIds = categoryFeatureMap[selectedCategory] || [];
    return features.filter(f => catFeatureIds.includes(f.id));
  }, [selectedCategory, features, categoryFeatureMap]);

  // Slug otomatik oluştur
  useEffect(() => {
    if (!editingFeature) {
      const slug = newName
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setNewSlug(slug);
    }
  }, [newName, editingFeature]);

  // Preset değer ekle
  const addPresetValue = () => {
    if (newPresetInput.trim() && !newPresetValues.includes(newPresetInput.trim())) {
      setNewPresetValues([...newPresetValues, newPresetInput.trim()]);
      setNewPresetInput("");
    }
  };

  // Preset değer sil
  const removePresetValue = (value: string) => {
    setNewPresetValues(newPresetValues.filter(v => v !== value));
  };

  // Yeni özellik kaydet
  const handleSave = async () => {
    if (!newName || !newSlug) {
      alert("İsim ve slug zorunludur");
      return;
    }

    setSaving(true);
    try {
      const url = editingFeature 
        ? `/api/admin/feature-definitions/${editingFeature.id}`
        : "/api/admin/feature-definitions";
      
      const method = editingFeature ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          slug: newSlug,
          inputType: newInputType,
          unit: newUnit || null,
          description: newDescription || null,
          presetValues: newInputType === 'SELECT' ? newPresetValues : [],
        }),
      });

      if (res.ok) {
        resetForm();
        fetchFeatures();
      } else {
        const error = await res.json();
        alert("Hata: " + (error.error || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error("Error saving feature:", error);
      alert("Bir hata oluştu!");
    } finally {
      setSaving(false);
    }
  };

  // Özellik sil
  const handleDelete = async (id: string) => {
    if (!confirm("Bu özelliği silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/feature-definitions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchFeatures();
      } else {
        const error = await res.json();
        alert("Hata: " + (error.error || "Silinemedi"));
      }
    } catch (error) {
      console.error("Error deleting feature:", error);
    }
  };

  // Düzenleme modunu aç
  const openEditModal = (feature: FeatureDefinition) => {
    setEditingFeature(feature);
    setNewName(feature.name);
    setNewSlug(feature.slug);
    setNewInputType(feature.inputType);
    setNewUnit(feature.unit || "");
    setNewDescription(feature.description || "");
    setNewPresetValues(feature.presetValues.map(p => p.value));
    setShowAddModal(true);
  };

  // Kategori atama modal'ını aç
  const openCategoryModal = async (feature: FeatureDefinition) => {
    setAssigningFeature(feature);
    
    // Bu özelliğin mevcut kategori atamalarını çek
    try {
      const res = await fetch(`/api/admin/feature-definitions/${feature.id}`);
      if (res.ok) {
        const data = await res.json();
        const categoryIds = (data.feature.categories || []).map((c: any) => c.category?.id || c.categoryId);
        setSelectedCategoryIds(categoryIds.filter(Boolean));
      }
    } catch (error) {
      console.error("Error fetching feature categories:", error);
    }
    
    setShowCategoryModal(true);
  };

  // Kategori atamalarını kaydet
  const saveCategoryAssignments = async () => {
    if (!assigningFeature) return;
    
    setSavingCategories(true);
    try {
      // Her seçili kategori için özelliği ata
      for (const categoryId of selectedCategoryIds) {
        await fetch(`/api/admin/categories/${categoryId}/features`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            featureId: assigningFeature.id,
            isDefault: false,
            isRequired: false,
          }),
        });
      }
      
      // Seçilmemiş kategorilerden özelliği kaldır
      const allCategoryIds = categories.map(c => c.id);
      const removedCategories = allCategoryIds.filter(id => !selectedCategoryIds.includes(id));
      
      for (const categoryId of removedCategories) {
        await fetch(`/api/admin/categories/${categoryId}/features?featureId=${assigningFeature.id}`, {
          method: "DELETE",
        });
      }
      
      alert("Kategori atamaları güncellendi!");
      setShowCategoryModal(false);
      setAssigningFeature(null);
      setSelectedCategoryIds([]);
      fetchFeatures();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category assignments:", error);
      alert("Bir hata oluştu!");
    } finally {
      setSavingCategories(false);
    }
  };

  // Kategori toggle
  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Form resetle
  const resetForm = () => {
    setNewName("");
    setNewSlug("");
    setNewInputType('TEXT');
    setNewUnit("");
    setNewDescription("");
    setNewPresetValues([]);
    setNewPresetInput("");
    setEditingFeature(null);
    setShowAddModal(false);
  };

  // İstatistikler
  const totalFeatures = features.length;
  const totalValues = features.reduce((sum, f) => sum + f.presetValues.length, 0);
  const totalUsage = features.reduce((sum, f) => sum + (f._count?.productValues || 0), 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXT':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'NUMBER':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        );
      case 'SELECT':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TEXT': return 'Metin';
      case 'NUMBER': return 'Sayı';
      case 'SELECT': return 'Seçim';
      default: return type;
    }
  };

  // Ürün değerini formatla
  const formatProductValue = (pv: ProductValue, feature: FeatureDefinition) => {
    if (pv.valueText) return pv.valueText;
    if (pv.valueNumber !== null) {
      const unit = pv.unit || feature.unit || '';
      return `${pv.valueNumber}${unit ? ' ' + unit : ''}`;
    }
    return '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Teknik Özellik Tanımları</h1>
          <p className="text-gray-500">Ürünlerin teknik özelliklerini tanımlayın ve yönetin</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Özellik
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{totalFeatures}</p>
          <p className="text-sm text-gray-500">Toplam Özellik</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-primary">{totalValues}</p>
          <p className="text-sm text-gray-500">Toplam Preset Değer</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{totalUsage}</p>
          <p className="text-sm text-gray-500">Ürünlerde Kullanım</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-orange-500">{categorizedFeatures.length}</p>
          <p className="text-sm text-gray-500">Aktif Kategori</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark overflow-hidden">
        <div className="border-b border-stroke dark:border-dark-3 px-4 py-3 overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-dark-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-3"
              }`}
            >
              Tüm Özellikler ({features.length})
            </button>
            {categorizedFeatures.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-dark-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-3"
                }`}
              >
                {cat.name} ({cat.features.length})
              </button>
            ))}
          </div>
        </div>

        {/* Features List */}
        {filteredFeatures.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">Bu kategoride özellik yok</h3>
            <p className="text-gray-500 mb-4">Yeni özellik oluşturup bu kategoriye atayabilirsiniz.</p>
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-dark-3">
            {filteredFeatures.map((feature) => (
              <div key={feature.id} className="px-6 py-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === feature.id ? null : feature.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-dark-2">
                      {getTypeIcon(feature.inputType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark dark:text-white flex items-center gap-2">
                        {feature.name}
                        {feature.unit && (
                          <span className="text-xs text-gray-400 font-normal">({feature.unit})</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {feature.inputType === 'SELECT' && feature.presetValues.length > 0 
                          ? `${feature.presetValues.length} seçenek` 
                          : feature.inputType === 'SELECT' ? 'Değer yok' : 'Serbest giriş'}
                        {' • '}
                        <span className="text-green-500 font-medium">{feature._count?.productValues || 0} üründe</span>
                        {' • '}
                        {feature._count?.categories || 0} kategoride
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      feature.inputType === 'TEXT' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                      feature.inputType === 'NUMBER' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                      'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                    }`}>
                      {getTypeLabel(feature.inputType)}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Kategori Ata Butonu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCategoryModal(feature);
                        }}
                        className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                        title="Kategorilere Ata"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(feature);
                        }}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-dark-2 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(feature.id);
                        }}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedId === feature.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === feature.id && (
                  <div className="mt-4 pl-14 space-y-4">
                    {feature.description && (
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    )}
                    
                    {/* Preset Değerler (SELECT için) */}
                    {feature.inputType === 'SELECT' && feature.presetValues.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-dark dark:text-white mb-2">Seçim Seçenekleri:</p>
                        <div className="flex flex-wrap gap-2">
                          {feature.presetValues.map((pv) => (
                            <span 
                              key={pv.id} 
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-medium"
                            >
                              {pv.label || pv.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Ürün Değerleri Tablosu */}
                    {feature.productValues && feature.productValues.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-dark dark:text-white mb-2">
                          Ürün Değerleri ({feature.productValues.length} ürün):
                        </p>
                        <div className="rounded-lg border border-stroke dark:border-dark-3 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-dark-2">
                              <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Ürün</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Değer</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stroke dark:divide-dark-3">
                              {feature.productValues.map((pv) => (
                                <tr key={pv.id} className="hover:bg-gray-50 dark:hover:bg-dark-2">
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                      {pv.product.thumbnail && (
                                        <img 
                                          src={pv.product.thumbnail} 
                                          alt={pv.product.name}
                                          className="w-8 h-8 rounded object-cover"
                                        />
                                      )}
                                      <span className="text-dark dark:text-white font-medium">
                                        {pv.product.name.length > 40 
                                          ? pv.product.name.substring(0, 40) + '...' 
                                          : pv.product.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                      feature.inputType === 'SELECT' 
                                        ? pv.valueText === 'Evet' 
                                          ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                                          : pv.valueText === 'Hayır'
                                            ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400'
                                        : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                    }`}>
                                      {formatProductValue(pv, feature)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400">
                      Slug: <code className="bg-gray-100 dark:bg-dark-2 px-1 rounded">{feature.slug}</code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-gray-dark max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">
              {editingFeature ? "Özelliği Düzenle" : "Yeni Özellik Tanımı"}
            </h3>
            
            <div className="space-y-4">
              {/* İsim */}
              <div>
                <label className="mb-2 block text-sm font-medium">Özellik Adı *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Örn: Kapasite"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 dark:border-dark-3 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block text-sm font-medium">Slug *</label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="kapasite"
                  disabled={!!editingFeature}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 dark:border-dark-3 focus:border-primary focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Tip */}
              <div>
                <label className="mb-2 block text-sm font-medium">Giriş Tipi</label>
                <select
                  value={newInputType}
                  onChange={(e) => setNewInputType(e.target.value as 'TEXT' | 'NUMBER' | 'SELECT')}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 dark:border-dark-3 focus:border-primary focus:outline-none"
                >
                  <option value="TEXT">Metin (Serbest giriş)</option>
                  <option value="NUMBER">Sayı (Birim ile)</option>
                  <option value="SELECT">Seçim (Preset değerlerden)</option>
                </select>
              </div>

              {/* Birim (NUMBER için) */}
              {newInputType === 'NUMBER' && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Birim</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="Örn: Wh, W, kg"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 dark:border-dark-3 focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {/* Preset Değerler (SELECT için) */}
              {newInputType === 'SELECT' && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Preset Değerler</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newPresetInput}
                      onChange={(e) => setNewPresetInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPresetValue())}
                      placeholder="Değer ekle..."
                      className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addPresetValue}
                      className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                    >
                      Ekle
                    </button>
                  </div>
                  {newPresetValues.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newPresetValues.map((value, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-2 text-sm"
                        >
                          {value}
                          <button 
                            type="button"
                            onClick={() => removePresetValue(value)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Açıklama */}
              <div>
                <label className="mb-2 block text-sm font-medium">Açıklama (Opsiyonel)</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Admin için not..."
                  rows={2}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 dark:border-dark-3 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={!newName || !newSlug || saving}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : editingFeature ? "Güncelle" : "Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kategori Atama Modal */}
      {showCategoryModal && assigningFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-gray-dark max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-orange-100 dark:bg-orange-500/20">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  Kategori Ataması
                </h3>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-primary">{assigningFeature.name}</span> özelliğini hangi kategorilerde kullanılsın?
                </p>
              </div>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Henüz kategori bulunmuyor</p>
              ) : (
                categories.map((category) => (
                  <label 
                    key={category.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCategoryIds.includes(category.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-2'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="h-5 w-5 rounded border-stroke text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-dark dark:text-white">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.slug}</p>
                    </div>
                    {selectedCategoryIds.includes(category.id) && (
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                ))
              )}
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-stroke dark:border-dark-3">
              <p className="text-sm text-gray-500">
                {selectedCategoryIds.length} kategori seçildi
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setAssigningFeature(null);
                    setSelectedCategoryIds([]);
                  }}
                  className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
                >
                  İptal
                </button>
                <button
                  onClick={saveCategoryAssignments}
                  disabled={savingCategories}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {savingCategories ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
