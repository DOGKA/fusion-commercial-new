"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, ChevronDown, X, Loader2, FolderPlus } from "lucide-react";

interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  _count?: { faqs: number };
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
  category: FaqCategory;
  order: number;
  isActive: boolean;
}

interface FaqStats {
  totalFaqs: number;
  activeFaqs: number;
  totalCategories: number;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [stats, setStats] = useState<FaqStats>({ totalFaqs: 0, activeFaqs: 0, totalCategories: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Modal states
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [editingCategory, setEditingCategory] = useState<FaqCategory | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    categoryId: "",
    isActive: true,
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    color: "#6366f1",
    isActive: true,
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/faqs?includeInactive=true");
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || []);
        setCategories(data.categories || []);
        setStats(data.stats || { totalFaqs: 0, activeFaqs: 0, totalCategories: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // FAQ CRUD
  const openAddFaq = () => {
    setEditingFaq(null);
    setFaqForm({ question: "", answer: "", categoryId: categories[0]?.id || "", isActive: true });
    setShowFaqModal(true);
  };

  const openEditFaq = (faq: Faq) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      categoryId: faq.categoryId,
      isActive: faq.isActive,
    });
    setShowFaqModal(true);
  };

  const saveFaq = async () => {
    if (!faqForm.question || !faqForm.answer || !faqForm.categoryId) return;
    
    setSaving(true);
    try {
      const method = editingFaq ? "PUT" : "POST";
      const body = editingFaq 
        ? { id: editingFaq.id, ...faqForm }
        : faqForm;
      
      const res = await fetch("/api/admin/faqs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (res.ok) {
        setShowFaqModal(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save FAQ:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (id: string) => {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
    
    try {
      const res = await fetch(`/api/admin/faqs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
    }
  };

  // Category CRUD
  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", slug: "", description: "", icon: "", color: "#6366f1", isActive: true });
    setShowCategoryModal(true);
  };

  const openEditCategory = (category: FaqCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#6366f1",
      isActive: category.isActive,
    });
    setShowCategoryModal(true);
  };

  const saveCategory = async () => {
    if (!categoryForm.name || !categoryForm.slug) return;
    
    setSaving(true);
    try {
      const method = editingCategory ? "PUT" : "POST";
      const body = editingCategory 
        ? { id: editingCategory.id, ...categoryForm }
        : categoryForm;
      
      const res = await fetch("/api/admin/faqs/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (res.ok) {
        setShowCategoryModal(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save category:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz? Kategoride soru varsa silemezsiniz.")) return;
    
    try {
      const res = await fetch(`/api/admin/faqs/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Kategori silinemedi");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Group FAQs by category
  const groupedFaqs = categories.reduce((acc, cat) => {
    acc[cat.id] = faqs.filter(f => f.categoryId === cat.id);
    return acc;
  }, {} as Record<string, Faq[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">S.S.S Yönetimi</h1>
          <p className="text-gray-500">Sık sorulan soruları düzenleyin</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={openAddCategory}
            className="inline-flex items-center gap-2 rounded-lg border border-stroke px-4 py-2.5 text-dark hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          >
            <FolderPlus className="w-5 h-5" />
            Yeni Kategori
          </button>
          <button 
            onClick={openAddFaq}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Yeni Soru
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{stats.totalFaqs}</p>
          <p className="text-sm text-gray-500">Toplam Soru</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{stats.activeFaqs}</p>
          <p className="text-sm text-gray-500">Aktif</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-primary">{stats.totalCategories}</p>
          <p className="text-sm text-gray-500">Kategori</p>
        </div>
      </div>

      {/* Categories & FAQs */}
      {categories.length === 0 ? (
        <div className="rounded-xl border border-stroke bg-white p-12 text-center dark:border-dark-3 dark:bg-gray-dark">
          <FolderPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">Henüz kategori yok</h3>
          <p className="text-gray-500 mb-4">Soru eklemek için önce bir kategori oluşturun.</p>
          <button 
            onClick={openAddCategory}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90"
          >
            <FolderPlus className="w-5 h-5" />
            Kategori Oluştur
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-dark-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <span className="text-lg" style={{ color: category.color }}>📁</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-dark dark:text-white">{category.name}</h2>
                    <span className="text-xs text-gray-500">{groupedFaqs[category.id]?.length || 0} soru</span>
                  </div>
                  {!category.isActive && (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-600 dark:bg-red-500/10">Pasif</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEditCategory(category)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-2"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                  <button 
                    onClick={() => deleteCategory(category.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* FAQs in Category */}
              <div className="divide-y divide-stroke dark:divide-dark-3">
                {groupedFaqs[category.id]?.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    Bu kategoride henüz soru yok
                  </div>
                ) : (
                  groupedFaqs[category.id]?.map((faq) => (
                    <div key={faq.id} className="px-6 py-4">
                      <div 
                        className="flex items-center justify-between cursor-pointer" 
                        onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-dark dark:text-white truncate">{faq.question}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${faq.isActive ? "bg-green-100 text-green-600 dark:bg-green-500/10" : "bg-red-100 text-red-600 dark:bg-red-500/10"}`}>
                            {faq.isActive ? "Aktif" : "Pasif"}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedId === faq.id ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                      {expandedId === faq.id && (
                        <div className="mt-4 pl-0">
                          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{faq.answer}</p>
                          <div className="flex gap-2 mt-4">
                            <button 
                              onClick={() => openEditFaq(faq)}
                              className="px-3 py-1.5 rounded text-sm bg-primary text-white hover:bg-primary/90"
                            >
                              Düzenle
                            </button>
                            <button 
                              onClick={() => deleteFaq(faq.id)}
                              className="px-3 py-1.5 rounded text-sm border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-dark rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-dark-3">
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                {editingFaq ? "Soruyu Düzenle" : "Yeni Soru Ekle"}
              </h3>
              <button onClick={() => setShowFaqModal(false)} className="p-1 hover:bg-gray-100 rounded dark:hover:bg-dark-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Kategori</label>
                <select
                  value={faqForm.categoryId}
                  onChange={(e) => setFaqForm({ ...faqForm, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Soru</label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                  placeholder="Soru yazın..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Cevap</label>
                <textarea
                  rows={4}
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                  placeholder="Cevap yazın..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="faqActive"
                  checked={faqForm.isActive}
                  onChange={(e) => setFaqForm({ ...faqForm, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="faqActive" className="text-sm text-dark dark:text-white">Aktif</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-stroke px-6 py-4 dark:border-dark-3">
              <button 
                onClick={() => setShowFaqModal(false)}
                className="px-4 py-2 rounded-lg border border-stroke dark:border-dark-3"
              >
                İptal
              </button>
              <button 
                onClick={saveFaq}
                disabled={saving || !faqForm.question || !faqForm.answer || !faqForm.categoryId}
                className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-dark rounded-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-dark-3">
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori"}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="p-1 hover:bg-gray-100 rounded dark:hover:bg-dark-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Kategori Adı</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCategoryForm({ 
                      ...categoryForm, 
                      name,
                      slug: editingCategory ? categoryForm.slug : generateSlug(name)
                    });
                  }}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                  placeholder="Örn: İade ve Değişim"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                  placeholder="iade-degisim"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Açıklama</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                  placeholder="Kategori açıklaması (opsiyonel)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Renk</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="catActive" className="text-sm text-dark dark:text-white">Aktif</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-stroke px-6 py-4 dark:border-dark-3">
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 rounded-lg border border-stroke dark:border-dark-3"
              >
                İptal
              </button>
              <button 
                onClick={saveCategory}
                disabled={saving || !categoryForm.name || !categoryForm.slug}
                className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
