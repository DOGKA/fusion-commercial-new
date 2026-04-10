"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2, Save, ChevronDown, ChevronUp, Search } from "lucide-react";
import Image from "next/image";

interface Spec { id?: string; label: string; unit: string | null; order: number; }
interface SpecGroup { id?: string; name: string; order: number; specs: Spec[]; }
interface SpecValue { specId: string; value: string; }
interface CompareProduct {
  id?: string; categoryId: string; productId: string | null;
  name: string; image: string | null; price: number | null; comparePrice: number | null;
  buyLink: string | null; order: number; isActive: boolean; specValues: SpecValue[];
}
interface Category {
  id: string; name: string; slug: string; order: number; isActive: boolean;
  specGroups: SpecGroup[]; products: CompareProduct[];
}
interface DbProduct { id: string; name: string; slug: string; price: number; comparePrice: number | null; thumbnail: string | null; images: string[]; }

function Input({ value, onChange, placeholder, type = "text", className = "" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-dark-3 dark:text-white ${className}`} />;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-dark-3 dark:bg-dark-2 ${className}`}>{children}</div>;
}

export default function ComparePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/compare/categories");
      if (res.ok) { const data = await res.json(); setCategories(data.items || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?limit=200");
      if (res.ok) { const data = await res.json(); setDbProducts(data.products || []); }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchCategories(); fetchProducts(); }, [fetchCategories, fetchProducts]);

  const createCategory = async () => {
    try {
      const slug = `kategori-${Date.now()}`;
      await fetch("/api/admin/compare/categories", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Yeni Kategori", slug, order: categories.length }),
      });
      toast.success("Kategori eklendi"); fetchCategories();
    } catch { toast.error("Hata"); }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Bu kategoriyi ve tum icerigini silmek istediginize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/compare/categories/${id}`, { method: "DELETE" });
      toast.success("Silindi"); fetchCategories();
    } catch { toast.error("Hata"); }
  };

  const saveCategory = async (id: string, data: Partial<Category>) => {
    setSaving(true);
    try {
      await fetch(`/api/admin/compare/categories/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("Kaydedildi"); fetchCategories();
    } catch { toast.error("Hata"); } finally { setSaving(false); }
  };

  const addProduct = async (categoryId: string, product: DbProduct, allSpecs: Spec[]) => {
    try {
      await fetch("/api/admin/compare/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId, productId: product.id, name: product.name,
          image: product.thumbnail || product.images?.[0] || null,
          price: product.price, comparePrice: product.comparePrice,
          buyLink: `/urun/${product.slug}`, order: 0, isActive: true,
          specValues: allSpecs.map(s => ({ specId: s.id!, value: "" })),
        }),
      });
      toast.success("Urun eklendi"); fetchCategories();
    } catch { toast.error("Hata"); }
  };

  const updateProduct = async (prodId: string, data: any) => {
    try {
      await fetch(`/api/admin/compare/products/${prodId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("Kaydedildi"); fetchCategories();
    } catch { toast.error("Hata"); }
  };

  const deleteProduct = async (prodId: string) => {
    if (!confirm("Urunu silmek istediginize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/compare/products/${prodId}`, { method: "DELETE" });
      toast.success("Silindi"); fetchCategories();
    } catch { toast.error("Hata"); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Karsilastirma Yonetimi</h1>
          <p className="text-gray-500">Urun karsilastirma tablolarini yonetin</p>
        </div>
        <button onClick={createCategory} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm text-white hover:bg-primary/90">
          <Plus size={16} /> Yeni Kategori
        </button>
      </div>

      {categories.length === 0 && <Card><p className="text-center text-gray-400 py-8">Henuz kategori eklenmedi</p></Card>}

      {categories.map((cat) => {
        const isExpanded = expandedId === cat.id;
        const allSpecs = cat.specGroups.flatMap(g => g.specs);

        return (
          <Card key={cat.id}>
            <div className="flex items-center justify-between">
              <button onClick={() => setExpandedId(isExpanded ? null : cat.id)} className="flex items-center gap-3 flex-1 text-left">
                <span className="font-semibold text-dark dark:text-white text-lg">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.products.length} urun, {allSpecs.length} ozellik</span>
                {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              <button onClick={() => deleteCategory(cat.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
            </div>

            {isExpanded && (
              <CategoryEditor
                category={cat}
                dbProducts={dbProducts}
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                saving={saving}
                onSave={(data) => saveCategory(cat.id, data)}
                onAddProduct={(p) => addProduct(cat.id, p, allSpecs)}
                onUpdateProduct={updateProduct}
                onDeleteProduct={deleteProduct}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}

function CategoryEditor({ category, dbProducts, productSearch, setProductSearch, saving, onSave, onAddProduct, onUpdateProduct, onDeleteProduct }: {
  category: Category; dbProducts: DbProduct[]; productSearch: string; setProductSearch: (v: string) => void;
  saving: boolean; onSave: (data: Partial<Category>) => void;
  onAddProduct: (p: DbProduct) => void; onUpdateProduct: (id: string, data: any) => void; onDeleteProduct: (id: string) => void;
}) {
  const [form, setForm] = useState(category);

  const addGroup = () => {
    setForm({ ...form, specGroups: [...form.specGroups, { name: "Yeni Grup", order: form.specGroups.length, specs: [] }] });
  };

  const addSpec = (gi: number) => {
    const groups = [...form.specGroups];
    groups[gi] = { ...groups[gi], specs: [...groups[gi].specs, { label: "Yeni Ozellik", unit: null, order: groups[gi].specs.length }] };
    setForm({ ...form, specGroups: groups });
  };

  const updateGroup = (gi: number, data: Partial<SpecGroup>) => {
    const groups = [...form.specGroups];
    groups[gi] = { ...groups[gi], ...data };
    setForm({ ...form, specGroups: groups });
  };

  const updateSpec = (gi: number, si: number, data: Partial<Spec>) => {
    const groups = [...form.specGroups];
    const specs = [...groups[gi].specs];
    specs[si] = { ...specs[si], ...data };
    groups[gi] = { ...groups[gi], specs };
    setForm({ ...form, specGroups: groups });
  };

  const removeGroup = (gi: number) => {
    setForm({ ...form, specGroups: form.specGroups.filter((_, i) => i !== gi) });
  };

  const removeSpec = (gi: number, si: number) => {
    const groups = [...form.specGroups];
    groups[gi] = { ...groups[gi], specs: groups[gi].specs.filter((_, i) => i !== si) };
    setForm({ ...form, specGroups: groups });
  };

  const filteredProducts = dbProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
    !category.products.some(cp => cp.productId === p.id)
  );

  return (
    <div className="mt-5 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="text-sm font-medium text-dark dark:text-white mb-1 block">Kategori Adi</label><Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></div>
        <div><label className="text-sm font-medium text-dark dark:text-white mb-1 block">Slug (URL)</label><Input value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} /></div>
        <div><label className="text-sm font-medium text-dark dark:text-white mb-1 block">Sira</label><Input type="number" value={String(form.order)} onChange={(v) => setForm({ ...form, order: parseInt(v) || 0 })} /></div>
      </div>

      {/* Spec Groups */}
      <div className="border-t border-stroke dark:border-dark-3 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-dark dark:text-white">Ozellik Gruplari</h3>
          <button onClick={addGroup} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={14} /> Grup Ekle</button>
        </div>

        {form.specGroups.map((group, gi) => (
          <div key={gi} className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-dark-3">
            <div className="flex items-center gap-2 mb-2">
              <Input value={group.name} onChange={(v) => updateGroup(gi, { name: v })} placeholder="Grup adi" className="font-medium" />
              <button onClick={() => removeGroup(gi)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 rounded"><Trash2 size={14} /></button>
            </div>
            {group.specs.map((spec, si) => (
              <div key={si} className="flex items-center gap-2 ml-4 mb-1">
                <Input value={spec.label} onChange={(v) => updateSpec(gi, si, { label: v })} placeholder="Ozellik adi (emoji destekli)" />
                <Input value={spec.unit || ""} onChange={(v) => updateSpec(gi, si, { unit: v || null })} placeholder="Birim" className="w-24" />
                <button onClick={() => removeSpec(gi, si)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
              </div>
            ))}
            <button onClick={() => addSpec(gi)} className="text-xs text-primary hover:underline ml-4 mt-1 flex items-center gap-1"><Plus size={12} /> Ozellik Ekle</button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={() => onSave(form)} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm text-white hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Kategori ve Ozellikleri Kaydet
        </button>
      </div>

      {/* Products */}
      <div className="border-t border-stroke dark:border-dark-3 pt-4">
        <h3 className="text-sm font-semibold text-dark dark:text-white mb-3">Urunler</h3>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Veritabanindan urun ara ve ekle..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stroke bg-transparent text-sm outline-none focus:border-primary dark:border-dark-3 dark:text-white"
          />
          {productSearch && filteredProducts.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-stroke bg-white dark:bg-dark-2 dark:border-dark-3 shadow-lg">
              {filteredProducts.slice(0, 10).map((p) => (
                <button key={p.id} onClick={() => { onAddProduct(p); setProductSearch(""); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-dark-3 text-dark dark:text-white">
                  {p.thumbnail && <Image src={p.thumbnail} alt="" width={32} height={32} className="w-8 h-8 rounded object-cover" />}
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-xs text-gray-400">{p.price} TL</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {category.products.map((prod) => {
          const allSpecs = category.specGroups.flatMap(g => g.specs);
          return (
            <ProductSpecEditor key={prod.id} product={prod} specs={allSpecs} groups={category.specGroups}
              onSave={(data) => onUpdateProduct(prod.id!, data)} onDelete={() => onDeleteProduct(prod.id!)} />
          );
        })}

        {category.products.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Henuz urun eklenmedi. Yukaridaki arama kutusundan urun ekleyin.</p>}
      </div>
    </div>
  );
}

function ProductSpecEditor({ product, specs, groups, onSave, onDelete }: {
  product: CompareProduct; specs: Spec[]; groups: SpecGroup[];
  onSave: (data: any) => void; onDelete: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    product.specValues.forEach((sv: any) => { map[sv.specId] = sv.value; });
    return map;
  });
  const [buyLink, setBuyLink] = useState(product.buyLink || "");
  const [imageUrl, setImageUrl] = useState(product.image || "");
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave({
      buyLink,
      image: imageUrl || null,
      specValues: Object.entries(values).map(([specId, value]) => ({ specId, value })),
    });
  };

  return (
    <div className="mb-3 p-3 rounded-lg border border-stroke dark:border-dark-3">
      <div className="flex items-center justify-between">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-3 flex-1 text-left">
          {product.image && <Image src={product.image} alt="" width={40} height={40} className="w-10 h-10 rounded object-cover" />}
          <div>
            <span className="font-medium text-dark dark:text-white text-sm">{product.name}</span>
            {product.price && <span className="text-xs text-gray-400 ml-2">{Number(product.price).toLocaleString("tr-TR")} TL</span>}
          </div>
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </button>
        <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          <div><label className="text-xs text-gray-500 mb-1 block">Ürün Görseli URL</label><Input value={imageUrl} onChange={setImageUrl} placeholder="Transparan PNG önerilir" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Satın Al Linki</label><Input value={buyLink} onChange={setBuyLink} placeholder="/urun/slug veya harici link" /></div>

          {groups.map((group) => (
            <div key={group.id || group.name}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{group.name}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {group.specs.map((spec) => (
                  <div key={spec.id || spec.label}>
                    <label className="text-xs text-gray-400 mb-0.5 block">{spec.label}{spec.unit ? ` (${spec.unit})` : ""}</label>
                    <Input
                      value={values[spec.id!] || ""}
                      onChange={(v) => setValues({ ...values, [spec.id!]: v })}
                      placeholder="Deger girin (emoji destekli)"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90">
              <Save size={14} /> Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
