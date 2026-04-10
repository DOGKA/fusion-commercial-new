"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2, GripVertical, Save, ChevronDown, ChevronUp } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

interface TrendingCard {
  id: string;
  title: string;
  badge: string | null;
  attributes: string | null;
  buttonText: string;
  buttonLink: string;
  image: string | null;
  order: number;
  isActive: boolean;
}

interface PromoItem {
  id: string;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  image: string | null;
  order: number;
  isActive: boolean;
}

interface VideoBannerItem {
  id: string;
  name: string;
  videoType: string;
  videoUrl: string | null;
  isActive: boolean;
}

interface CategoryProduct {
  id?: string;
  title: string;
  badge: string | null;
  spec1: string | null;
  spec2: string | null;
  price: string | null;
  image: string | null;
  link: string | null;
  order: number;
}

interface CategorySection {
  id: string;
  sectionTitle: string;
  bannerImage: string | null;
  bannerEyebrow: string | null;
  bannerTitle: string | null;
  bannerDesc: string | null;
  bannerBtnText: string | null;
  bannerBtnLink: string | null;
  seeMoreImage: string | null;
  seeMoreLink: string | null;
  accessoryLink: string | null;
  order: number;
  isActive: boolean;
  products: CategoryProduct[];
}

interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnail: string | null;
  order: number;
  isActive: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">
        {label}
        {hint && <span className="ml-2 text-xs text-gray-400 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white dark:focus:border-primary"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`block h-6 w-11 rounded-full transition ${checked ? "bg-primary" : "bg-gray-300 dark:bg-dark-3"}`} />
        <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : ""}`} />
      </div>
      <span className="text-sm text-dark dark:text-white">{label}</span>
    </label>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-dark-3 dark:bg-dark-2 ${className}`}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TRENDING TAB
// ═══════════════════════════════════════════════════════════════════════

function TrendingTab() {
  const [items, setItems] = useState<TrendingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/homepage/trending");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const createItem = async () => {
    try {
      const res = await fetch("/api/admin/homepage/trending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Yeni Ürün", order: items.length }),
      });
      if (res.ok) { toast.success("Kart eklendi"); fetchItems(); }
    } catch { toast.error("Hata oluştu"); }
  };

  const updateItem = async (id: string, data: Partial<TrendingCard>) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/homepage/trending/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) { toast.success("Kaydedildi"); fetchItems(); }
    } catch { toast.error("Hata oluştu"); } finally { setSaving(null); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Bu kartı silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/homepage/trending/${id}`, { method: "DELETE" });
      toast.success("Silindi"); fetchItems();
    } catch { toast.error("Hata oluştu"); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Trend carousel kartlarını yönetin. Önerilen görsel: <strong>370 x 470 px</strong></p>
        <button onClick={createItem} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm text-white hover:bg-primary/90">
          <Plus size={16} /> Yeni Kart
        </button>
      </div>

      {items.length === 0 ? (
        <Card><p className="text-center text-gray-400 py-8">Henüz kart eklenmedi</p></Card>
      ) : (
        items.map((item) => (
          <TrendingCardForm key={item.id} item={item} saving={saving === item.id} onSave={(data) => updateItem(item.id, data)} onDelete={() => deleteItem(item.id)} />
        ))
      )}
    </div>
  );
}

function TrendingCardForm({ item, saving, onSave, onDelete }: {
  item: TrendingCard;
  saving: boolean;
  onSave: (data: Partial<TrendingCard>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState(item);
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-3 text-left flex-1">
          <GripVertical size={16} className="text-gray-400" />
          <span className="font-medium text-dark dark:text-white">{form.title}</span>
          {form.badge && <span className="text-xs text-orange-500 font-semibold">{form.badge}</span>}
          {!form.isActive && <span className="text-xs text-gray-400 bg-gray-100 dark:bg-dark-3 px-2 py-0.5 rounded">Pasif</span>}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Ürün Adı"><Input value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
          <FormField label="Badge" hint="ör: Yeni"><Input value={form.badge || ""} onChange={(v) => setForm({ ...form, badge: v || null })} /></FormField>
          <FormField label="Özellikler" hint="ör: 1024Wh | 1800W"><Input value={form.attributes || ""} onChange={(v) => setForm({ ...form, attributes: v || null })} /></FormField>
          <FormField label="Buton Linki"><Input value={form.buttonLink} onChange={(v) => setForm({ ...form, buttonLink: v })} /></FormField>
          <FormField label="Görsel URL" hint="370 x 470 px"><Input value={form.image || ""} onChange={(v) => setForm({ ...form, image: v || null })} /></FormField>
          <FormField label="Sıra"><Input type="number" value={String(form.order)} onChange={(v) => setForm({ ...form, order: parseInt(v) || 0 })} /></FormField>
          <div className="md:col-span-2"><Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Aktif" /></div>
          <div className="md:col-span-2 flex justify-end">
            <button onClick={() => onSave(form)} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm text-white hover:bg-primary/90 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Kaydet
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PROMO TAB
// ═══════════════════════════════════════════════════════════════════════

function PromoTab() {
  const [items, setItems] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/homepage/promos");
      if (res.ok) { const data = await res.json(); setItems(data.items || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const createItem = async () => {
    try {
      const res = await fetch("/api/admin/homepage/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Yeni Banner", order: items.length }),
      });
      if (res.ok) { toast.success("Banner eklendi"); fetchItems(); }
    } catch { toast.error("Hata oluştu"); }
  };

  const updateItem = async (id: string, data: Partial<PromoItem>) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/homepage/promos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) { toast.success("Kaydedildi"); fetchItems(); }
    } catch { toast.error("Hata oluştu"); } finally { setSaving(null); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/homepage/promos/${id}`, { method: "DELETE" });
      toast.success("Silindi"); fetchItems();
    } catch { toast.error("Hata oluştu"); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Promo bannerlarını yönetin. Önerilen görsel: <strong>1440 x 228 px</strong></p>
        <button onClick={createItem} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm text-white hover:bg-primary/90">
          <Plus size={16} /> Yeni Banner
        </button>
      </div>

      {items.map((item) => (
        <PromoCardForm key={item.id} item={item} saving={saving === item.id} onSave={(data) => updateItem(item.id, data)} onDelete={() => deleteItem(item.id)} />
      ))}

      {items.length === 0 && <Card><p className="text-center text-gray-400 py-8">Henüz banner eklenmedi</p></Card>}
    </div>
  );
}

function PromoCardForm({ item, saving, onSave, onDelete }: {
  item: PromoItem;
  saving: boolean;
  onSave: (data: Partial<PromoItem>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState(item);

  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Başlık"><Input value={form.title || ""} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
        <FormField label="Alt Başlık"><Input value={form.subtitle || ""} onChange={(v) => setForm({ ...form, subtitle: v })} /></FormField>
        <FormField label="Buton Metni"><Input value={form.buttonText || ""} onChange={(v) => setForm({ ...form, buttonText: v })} /></FormField>
        <FormField label="Buton Linki"><Input value={form.buttonLink || ""} onChange={(v) => setForm({ ...form, buttonLink: v })} /></FormField>
        <FormField label="Görsel URL" hint="1440 x 228 px"><Input value={form.image || ""} onChange={(v) => setForm({ ...form, image: v })} /></FormField>
        <div className="flex items-end gap-3">
          <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Aktif" />
          <button onClick={() => onSave(form)} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm text-white hover:bg-primary/90 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Kaydet
          </button>
          <button onClick={onDelete} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// VIDEO BANNER TAB
// ═══════════════════════════════════════════════════════════════════════

function VideoBannerTab() {
  const [item, setItem] = useState<VideoBannerItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchItem = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/homepage/video-banner");
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        setItem(items[0] || null);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItem(); }, [fetchItem]);

  const saveItem = async () => {
    if (!item) return;
    setSaving(true);
    try {
      if (item.id) {
        await fetch(`/api/admin/homepage/video-banner/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
      } else {
        await fetch("/api/admin/homepage/video-banner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
      }
      toast.success("Kaydedildi"); fetchItem();
    } catch { toast.error("Hata oluştu"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  const formData = item || { id: "", name: "Video Banner", videoType: "upload", videoUrl: "", isActive: true };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Ana sayfadaki video banner&apos;ı yönetin. MP4 yükleyebilir veya YouTube linki girebilirsiniz.</p>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Video Tipi">
            <select
              value={formData.videoType}
              onChange={(e) => setItem({ ...formData, videoType: e.target.value } as VideoBannerItem)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-sm text-dark outline-none dark:border-dark-3 dark:text-white"
            >
              <option value="upload">MP4 Video Yükle</option>
              <option value="youtube">YouTube Linki</option>
            </select>
          </FormField>
          <FormField label={formData.videoType === "youtube" ? "YouTube Linki" : "Video URL (MP4)"} hint="Otomatik oynatılır, sessiz, döngü">
            <Input value={formData.videoUrl || ""} onChange={(v) => setItem({ ...formData, videoUrl: v } as VideoBannerItem)} placeholder={formData.videoType === "youtube" ? "https://youtube.com/watch?v=..." : "https://...video.mp4"} />
          </FormField>
          <Toggle checked={formData.isActive} onChange={(v) => setItem({ ...formData, isActive: v } as VideoBannerItem)} label="Aktif" />
          <div className="flex justify-end items-end">
            <button onClick={saveItem} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm text-white hover:bg-primary/90 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Kaydet
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CATEGORY SECTION TAB
// ═══════════════════════════════════════════════════════════════════════

function CategoryTab() {
  const [items, setItems] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/homepage/categories");
      if (res.ok) { const data = await res.json(); setItems(data.items || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const createItem = async () => {
    try {
      const res = await fetch("/api/admin/homepage/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionTitle: "Yeni Kategori", order: items.length }),
      });
      if (res.ok) { toast.success("Kategori eklendi"); fetchItems(); }
    } catch { toast.error("Hata oluştu"); }
  };

  const updateItem = async (id: string, data: Partial<CategorySection>) => {
    setSaving(id);
    try {
      await fetch(`/api/admin/homepage/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("Kaydedildi"); fetchItems();
    } catch { toast.error("Hata oluştu"); } finally { setSaving(null); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Bu kategori vitrini silinecek. Emin misiniz?")) return;
    try {
      await fetch(`/api/admin/homepage/categories/${id}`, { method: "DELETE" });
      toast.success("Silindi"); fetchItems();
    } catch { toast.error("Hata oluştu"); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Kategori vitrini bölümlerini yönetin.</p>
        <button onClick={createItem} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm text-white hover:bg-primary/90">
          <Plus size={16} /> Yeni Kategori Vitrini
        </button>
      </div>

      {items.map((item) => (
        <Card key={item.id}>
          <div className="flex items-center justify-between">
            <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="flex items-center gap-3 text-left flex-1">
              <GripVertical size={16} className="text-gray-400" />
              <span className="font-medium text-dark dark:text-white">{item.sectionTitle}</span>
              <span className="text-xs text-gray-400">{item.products?.length || 0} ürün</span>
              {expandedId === item.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            <button onClick={() => deleteItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
          </div>

          {expandedId === item.id && (
            <CategorySectionForm section={item} saving={saving === item.id} onSave={(data) => updateItem(item.id, data)} />
          )}
        </Card>
      ))}

      {items.length === 0 && <Card><p className="text-center text-gray-400 py-8">Henüz kategori vitrini eklenmedi</p></Card>}
    </div>
  );
}

function CategorySectionForm({ section, saving, onSave }: {
  section: CategorySection;
  saving: boolean;
  onSave: (data: Partial<CategorySection>) => void;
}) {
  const [form, setForm] = useState(section);

  const addProduct = () => {
    setForm({
      ...form,
      products: [...(form.products || []), { title: "Yeni Ürün", badge: null, spec1: null, spec2: null, price: null, image: null, link: "#", order: (form.products?.length || 0) }],
    });
  };

  const updateProduct = (idx: number, data: Partial<CategoryProduct>) => {
    const products = [...(form.products || [])];
    products[idx] = { ...products[idx], ...data };
    setForm({ ...form, products });
  };

  const removeProduct = (idx: number) => {
    const products = [...(form.products || [])];
    products.splice(idx, 1);
    setForm({ ...form, products });
  };

  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Bölüm Başlığı"><Input value={form.sectionTitle} onChange={(v) => setForm({ ...form, sectionTitle: v })} /></FormField>
        <FormField label="Sıra"><Input type="number" value={String(form.order)} onChange={(v) => setForm({ ...form, order: parseInt(v) || 0 })} /></FormField>
      </div>

      <div className="border-t border-stroke dark:border-dark-3 pt-4">
        <h4 className="text-sm font-semibold text-dark dark:text-white mb-3">Banner Alanı <span className="text-xs text-gray-400 font-normal ml-2">Önerilen: 1440 x 470 px</span></h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Banner Görseli URL" hint="1440 x 470 px"><Input value={form.bannerImage || ""} onChange={(v) => setForm({ ...form, bannerImage: v || null })} /></FormField>
          <FormField label="Üst Etiket" hint="ör: YENİ"><Input value={form.bannerEyebrow || ""} onChange={(v) => setForm({ ...form, bannerEyebrow: v || null })} /></FormField>
          <FormField label="Banner Başlık"><Input value={form.bannerTitle || ""} onChange={(v) => setForm({ ...form, bannerTitle: v || null })} /></FormField>
          <FormField label="Banner Açıklama"><Input value={form.bannerDesc || ""} onChange={(v) => setForm({ ...form, bannerDesc: v || null })} /></FormField>
          <FormField label="Buton Metni"><Input value={form.bannerBtnText || ""} onChange={(v) => setForm({ ...form, bannerBtnText: v || null })} /></FormField>
          <FormField label="Buton Linki"><Input value={form.bannerBtnLink || ""} onChange={(v) => setForm({ ...form, bannerBtnLink: v || null })} /></FormField>
        </div>
      </div>

      <div className="border-t border-stroke dark:border-dark-3 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-dark dark:text-white">Ürünler <span className="text-xs text-gray-400 font-normal ml-2">Önerilen görsel: 280 x 280 px (max 4)</span></h4>
          {(form.products?.length || 0) < 4 && (
            <button onClick={addProduct} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={14} /> Ürün Ekle</button>
          )}
        </div>
        {(form.products || []).map((product, idx) => (
          <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-3 relative">
            <FormField label="Ürün Adı"><Input value={product.title} onChange={(v) => updateProduct(idx, { title: v })} /></FormField>
            <FormField label="Badge"><Input value={product.badge || ""} onChange={(v) => updateProduct(idx, { badge: v || null })} /></FormField>
            <FormField label="Özellik 1"><Input value={product.spec1 || ""} onChange={(v) => updateProduct(idx, { spec1: v || null })} /></FormField>
            <FormField label="Özellik 2"><Input value={product.spec2 || ""} onChange={(v) => updateProduct(idx, { spec2: v || null })} /></FormField>
            <FormField label="Fiyat"><Input value={product.price || ""} onChange={(v) => updateProduct(idx, { price: v || null })} /></FormField>
            <FormField label="Görsel URL" hint="280x280"><Input value={product.image || ""} onChange={(v) => updateProduct(idx, { image: v || null })} /></FormField>
            <FormField label="Link"><Input value={product.link || ""} onChange={(v) => updateProduct(idx, { link: v || null })} /></FormField>
            <div className="flex items-end">
              <button onClick={() => removeProduct(idx)} className="p-2.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-stroke dark:border-dark-3 pt-4">
        <h4 className="text-sm font-semibold text-dark dark:text-white mb-3">Tümünü Gör &amp; Aksesuarlar</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Tümünü Gör Görseli" hint="200 x 200 px"><Input value={form.seeMoreImage || ""} onChange={(v) => setForm({ ...form, seeMoreImage: v || null })} /></FormField>
          <FormField label="Tümünü Gör Linki"><Input value={form.seeMoreLink || ""} onChange={(v) => setForm({ ...form, seeMoreLink: v || null })} /></FormField>
          <FormField label="2. Kart Metni" hint="ör: Hangi Ürün Bana Uygun?"><Input value={form.accessoryText || ""} onChange={(v) => setForm({ ...form, accessoryText: v || null })} /></FormField>
          <FormField label="2. Kart Linki"><Input value={form.accessoryLink || ""} onChange={(v) => setForm({ ...form, accessoryLink: v || null })} /></FormField>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Aktif" />
        <button onClick={() => onSave(form)} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm text-white hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Kaydet
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// VIDEO GRID TAB
// ═══════════════════════════════════════════════════════════════════════

function VideoGridTab() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/homepage/videos");
      if (res.ok) { const data = await res.json(); setItems(data.items || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const createItem = async () => {
    try {
      const res = await fetch("/api/admin/homepage/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Yeni Video", youtubeUrl: "", order: items.length }),
      });
      if (res.ok) { toast.success("Video eklendi"); fetchItems(); }
    } catch { toast.error("Hata oluştu"); }
  };

  const updateItem = async (id: string, data: Partial<VideoItem>) => {
    setSaving(id);
    try {
      await fetch(`/api/admin/homepage/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("Kaydedildi"); fetchItems();
    } catch { toast.error("Hata oluştu"); } finally { setSaving(null); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Bu videoyu silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/homepage/videos/${id}`, { method: "DELETE" });
      toast.success("Silindi"); fetchItems();
    } catch { toast.error("Hata oluştu"); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">YouTube inceleme videolarını yönetin.</p>
        <button onClick={createItem} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm text-white hover:bg-primary/90">
          <Plus size={16} /> Yeni Video
        </button>
      </div>

      {items.map((item) => (
        <VideoCardForm key={item.id} item={item} saving={saving === item.id} onSave={(data) => updateItem(item.id, data)} onDelete={() => deleteItem(item.id)} />
      ))}

      {items.length === 0 && <Card><p className="text-center text-gray-400 py-8">Henüz video eklenmedi</p></Card>}
    </div>
  );
}

function VideoCardForm({ item, saving, onSave, onDelete }: {
  item: VideoItem;
  saving: boolean;
  onSave: (data: Partial<VideoItem>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState(item);

  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Video Başlığı"><Input value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
        <FormField label="YouTube Linki"><Input value={form.youtubeUrl} onChange={(v) => setForm({ ...form, youtubeUrl: v })} /></FormField>
        <FormField label="Özel Thumbnail URL" hint="Opsiyonel"><Input value={form.thumbnail || ""} onChange={(v) => setForm({ ...form, thumbnail: v || null })} /></FormField>
        <div className="flex items-end gap-3">
          <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Aktif" />
          <button onClick={() => onSave(form)} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm text-white hover:bg-primary/90 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Kaydet
          </button>
          <button onClick={onDelete} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function HomepageAdminPage() {
  const [activeTab, setActiveTab] = useState("trending");

  const tabs = [
    { id: "trending", label: "Trend Carousel" },
    { id: "promo", label: "Promo Banner" },
    { id: "videobanner", label: "Video Banner" },
    { id: "categories", label: "Kategori Vitrini" },
    { id: "videos", label: "Video Grid" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Ana Sayfa Yönetimi</h1>
        <p className="text-gray-500">Ana sayfadaki tüm bölümleri buradan yönetebilirsiniz</p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-stroke dark:border-dark-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "trending" && <TrendingTab />}
      {activeTab === "promo" && <PromoTab />}
      {activeTab === "videobanner" && <VideoBannerTab />}
      {activeTab === "categories" && <CategoryTab />}
      {activeTab === "videos" && <VideoGridTab />}
    </div>
  );
}
