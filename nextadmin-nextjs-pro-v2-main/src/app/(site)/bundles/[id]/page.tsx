"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/FormElements/RichTextEditor";
import MediaLibrary from "@/components/MediaLibrary";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  stock: number;
  price?: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  stock: number;
  brand: string | null;
  variants?: ProductVariant[];
}

interface BundleItem {
  id: string;
  productId: string;
  variantId: string | null;
  variantName?: string;
  product: Product;
  quantity: number;
}

interface SelectedCategory {
  categoryId: string;
  isPrimary: boolean;
}

interface BundleData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  pricingType: "FIXED" | "SUM" | "SUM_DISCOUNT";
  price: number;
  comparePrice: number | null;
  thumbnail: string | null;
  images: string[];
  videoUrl: string | null;
  brand: string | null;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  categories: { id: string; name: string; slug: string; isPrimary: boolean }[];
  items: {
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    product: Product;
  }[];
}

const generateSlug = (value: string) => {
  return value
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function EditBundlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Form state'leri
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [pricingType, setPricingType] = useState<"FIXED" | "SUM" | "SUM_DISCOUNT">("FIXED");
  const [price, setPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  
  // SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  
  // Kategoriler
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>([]);
  
  // Ürünler
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  
  // Varyasyon seçici
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
  const [showVariantPicker, setShowVariantPicker] = useState(false);
  
  // Media
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaSelectMode, setMediaSelectMode] = useState<"thumbnail" | "gallery">("thumbnail");

  // Bundle ve referans verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bundleRes, categoriesRes, productsRes] = await Promise.all([
          fetch(`/api/bundles/${id}`),
          fetch("/api/categories?includeAll=true"),
          fetch("/api/products?limit=1000"),
        ]);

        if (bundleRes.ok) {
          const bundle: BundleData = await bundleRes.json();
          
          // Form state'lerini doldur
          setName(bundle.name);
          setSlug(bundle.slug);
          setDescription(bundle.description || "");
          setShortDescription(bundle.shortDescription || "");
          setPricingType(bundle.pricingType);
          setPrice(bundle.price.toString());
          setThumbnail(bundle.thumbnail || "");
          setProductImages(bundle.images || []);
          setVideoUrl(bundle.videoUrl || "");
          setBrand(bundle.brand || "");
          setSku(bundle.sku || "");
          setIsActive(bundle.isActive);
          setIsFeatured(bundle.isFeatured);
          setMetaTitle(bundle.metaTitle || "");
          setMetaDescription(bundle.metaDescription || "");
          setMetaKeywords((bundle.metaKeywords || []).join(", "));
          
          // Kategoriler
          setSelectedCategories(
            bundle.categories.map(c => ({ categoryId: c.id, isPrimary: c.isPrimary }))
          );
          
          // Bundle items
          setBundleItems(
            bundle.items.map(item => ({
              id: item.id,
              productId: item.productId,
              variantId: item.variantId,
              product: item.product,
              quantity: item.quantity,
            }))
          );
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || data || []);
        }

        if (productsRes.ok) {
          const data = await productsRes.json();
          setAllProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Markalar state
  const [brandOptions, setBrandOptions] = useState<Array<{ id: string; name: string }>>([]);

  // Markaları yükle
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/brands");
        if (res.ok) {
          const data = await res.json();
          setBrandOptions(data.brands || []);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  // Hesaplanan fiyatlar
  const totalProductValue = bundleItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  const calculatedPrice = pricingType === "FIXED" 
    ? parseFloat(price) || 0
    : pricingType === "SUM" 
      ? totalProductValue
      : totalProductValue * (1 - (parseFloat(discountPercent) || 0) / 100);

  const savings = totalProductValue - calculatedPrice;

  // Minimum stok
  const minStock = bundleItems.length > 0
    ? Math.min(...bundleItems.map(item => Math.floor(item.product.stock / item.quantity)))
    : 0;

  // Kategori işlemleri
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const exists = prev.find(c => c.categoryId === categoryId);
      if (exists) {
        return prev.filter(c => c.categoryId !== categoryId);
      } else {
        return [...prev, { categoryId, isPrimary: prev.length === 0 }];
      }
    });
  };

  const setPrimaryCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.map(c => ({ ...c, isPrimary: c.categoryId === categoryId }))
    );
  };

  // Ürün seçildiğinde çağrılır
  const handleProductSelect = (product: Product) => {
    // Eğer ürünün varyasyonları varsa varyasyon seçici göster
    if (product.variants && product.variants.length > 0) {
      setSelectedProductForVariant(product);
      setShowVariantPicker(true);
    } else {
      // Varyasyon yoksa direkt ekle
      addProduct(product, undefined, undefined);
    }
  };

  // Ürün işlemleri
  const addProduct = (product: Product, variantId?: string, variantName?: string) => {
    const exists = bundleItems.find(
      item => item.productId === product.id && item.variantId === (variantId || null)
    );
    if (exists) {
      toast.error("Bu ürün/varyasyon zaten pakette mevcut");
      return;
    }

    setBundleItems(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        productId: product.id,
        variantId: variantId || null,
        variantName: variantName,
        product,
        quantity: 1,
      },
    ]);
    setShowProductPicker(false);
    setShowVariantPicker(false);
    setSelectedProductForVariant(null);
    setProductSearch("");
  };

  // Tüm varyasyonları ekle
  const addAllVariants = (product: Product) => {
    if (!product.variants) return;
    
    let addedCount = 0;
    product.variants.forEach(variant => {
      const exists = bundleItems.find(
        item => item.productId === product.id && item.variantId === variant.id
      );
      if (!exists) {
        setBundleItems(prev => [
          ...prev,
          {
            id: `temp-${Date.now()}-${variant.id}`,
            productId: product.id,
            variantId: variant.id,
            variantName: `${variant.name}: ${variant.value}`,
            product,
            quantity: 1,
          },
        ]);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      toast.success(`${addedCount} varyasyon eklendi`);
    }
    setShowVariantPicker(false);
    setSelectedProductForVariant(null);
    setShowProductPicker(false);
    setProductSearch("");
  };

  const removeProduct = (itemId: string) => {
    setBundleItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setBundleItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...bundleItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setBundleItems(newItems);
  };

  const filteredProducts = allProducts.filter(p => {
    if (!productSearch) return true;
    const search = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(search) || 
           (p.brand && p.brand.toLowerCase().includes(search));
  });

  // Kaydet
  const handleSave = async () => {
    const normalizedSlug = slug.trim() || generateSlug(name);
    if (!name) {
      toast.error("Paket adı zorunludur");
      return;
    }
    if (!normalizedSlug) {
      toast.error("URL slug zorunludur");
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error("En az bir kategori seçmelisiniz");
      return;
    }
    if (bundleItems.length === 0) {
      toast.error("En az bir ürün eklemelisiniz");
      return;
    }
    if (pricingType === "FIXED" && !price) {
      toast.error("Paket fiyatı zorunludur");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/bundles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: normalizedSlug,
          description,
          shortDescription,
          pricingType,
          price: calculatedPrice,
          thumbnail,
          images: productImages,
          videoUrl,
          brand,
          sku,
          isActive,
          isFeatured,
          metaTitle,
          metaDescription,
          metaKeywords: metaKeywords.split(",").map(k => k.trim()).filter(Boolean),
          categories: selectedCategories,
          items: bundleItems.map((item, index) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            sortOrder: index,
          })),
        }),
      });

      if (res.ok) {
        toast.success("Paket başarıyla kaydedildi");
        router.push("/bundles");
      } else {
        const data = await res.json();
        toast.error(data.error || "Paket güncellenemedi");
      }
    } catch (error) {
      console.error("Error updating bundle:", error);
      toast.error("Paket güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "Genel" },
    { id: "products", label: "Paket İçeriği" },
    { id: "pricing", label: "Fiyatlandırma" },
    { id: "seo", label: "SEO" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Paketi Düzenle</h1>
          <p className="text-gray-500">{name}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
          >
            İptal
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol Panel - Ana Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paket Adı */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-2 block text-sm font-medium">Paket Adı *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Yaz Koruma Paketi"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-lg font-medium dark:border-dark-3 focus:border-primary focus:outline-none"
            />
            <div className="mt-2">
              <label className="mb-1 block text-xs text-gray-500">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-dark-3 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Kategoriler */}
          <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent p-6 dark:border-primary/20 dark:bg-gray-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-dark dark:text-white">Kategori *</h3>
                <p className="text-xs text-gray-500">Paket hangi kategoride görünsün?</p>
              </div>
            </div>
            
            <select
              value={selectedCategories[0]?.categoryId || ""}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedCategories([{ categoryId: e.target.value, isPrimary: true }]);
                } else {
                  setSelectedCategories([]);
                }
              }}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm font-medium dark:border-dark-3 dark:bg-dark-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Kategori Seçin...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark overflow-hidden">
            <div className="flex overflow-x-auto border-b border-stroke dark:border-dark-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                  {tab.id === "products" && bundleItems.length > 0 && (
                    <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {bundleItems.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* General Tab */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Paket Açıklaması</label>
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Paket hakkında detaylı bilgi yazın..."
                      minHeight="250px"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Kısa Açıklama</label>
                    <textarea
                      rows={3}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Listede görünecek kısa açıklama..."
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Marka</label>
                            <select
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                            >
                              <option value="">Marka seçin...</option>
                              {brandOptions.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                                </option>
                              ))}
                            </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">SKU</label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="BUNDLE-001"
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-dark dark:text-white">
                      Paket İçeriği ({bundleItems.length} ürün)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowProductPicker(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Ürün Ekle
                    </button>
                  </div>

                  {bundleItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-stroke rounded-xl dark:border-dark-3">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-gray-500 mb-2">Henüz ürün eklenmedi</p>
                      <button
                        type="button"
                        onClick={() => setShowProductPicker(true)}
                        className="text-primary hover:underline text-sm"
                      >
                        İlk ürünü ekle
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bundleItems.map((item, index) => (
                        <div 
                          key={item.id}
                          className="flex items-center gap-4 p-4 rounded-xl border border-stroke bg-gray-50/50 dark:border-dark-3 dark:bg-dark-2/50"
                        >
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => moveItem(index, "up")}
                              disabled={index === 0}
                              className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-dark-3"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(index, "down")}
                              disabled={index === bundleItems.length - 1}
                              className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-dark-3"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>

                          <div className="h-14 w-14 rounded-lg bg-white dark:bg-dark-2 overflow-hidden flex-shrink-0 border border-stroke dark:border-dark-3">
                            {item.product.thumbnail ? (
                              <Image
                                src={item.product.thumbnail}
                                alt={item.product.name}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-dark dark:text-white truncate">{item.product.name}</p>
                            {item.variantName && (
                              <p className="text-xs text-amber-500 font-medium">{item.variantName}</p>
                            )}
                            <p className="text-sm text-gray-500">
                              {item.product.price.toLocaleString("tr-TR")} ₺ • Stok: {item.variantId 
                                ? item.product.variants?.find(v => v.id === item.variantId)?.stock || item.product.stock
                                : item.product.stock
                              }
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 rounded-lg border border-stroke flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 dark:border-dark-3 dark:hover:bg-dark-3"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg border border-stroke flex items-center justify-center hover:bg-gray-100 dark:border-dark-3 dark:hover:bg-dark-3"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right w-24">
                            <p className="font-medium text-dark dark:text-white">
                              {(item.product.price * item.quantity).toLocaleString("tr-TR")} ₺
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeProduct(item.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 dark:hover:bg-red-500/10"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}

                      <div className="flex justify-end pt-4 border-t border-stroke dark:border-dark-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Ürünlerin Toplam Değeri</p>
                          <p className="text-xl font-bold text-dark dark:text-white">
                            {totalProductValue.toLocaleString("tr-TR")} ₺
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing Tab */}
              {activeTab === "pricing" && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Fiyatlandırma Tipi</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: "FIXED", label: "Sabit Fiyat", desc: "Fiyatı kendin belirle" },
                        { value: "SUM", label: "Ürün Toplamı", desc: "Ürün fiyatlarının toplamı" },
                        { value: "SUM_DISCOUNT", label: "İndirimli Toplam", desc: "Toplam - % indirim" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPricingType(option.value as typeof pricingType)}
                          className={`p-4 rounded-xl border text-left transition-colors ${
                            pricingType === option.value
                              ? "border-primary bg-primary/5"
                              : "border-stroke hover:border-gray-300 dark:border-dark-3"
                          }`}
                        >
                          <p className={`font-medium ${pricingType === option.value ? "text-primary" : "text-dark dark:text-white"}`}>
                            {option.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {pricingType === "FIXED" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium">Paket Fiyatı (₺) *</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}

                  {pricingType === "SUM_DISCOUNT" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium">İndirim Yüzdesi (%)</label>
                      <input
                        type="number"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        placeholder="10"
                        min="0"
                        max="100"
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}

                  {bundleItems.length > 0 && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 dark:from-green-500/10 dark:to-emerald-500/10 dark:border-green-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600 dark:text-gray-400">Ürünlerin Toplam Değeri:</span>
                        <span className="font-medium line-through text-gray-400">
                          {totalProductValue.toLocaleString("tr-TR")} ₺
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600 dark:text-gray-400">Paket Fiyatı:</span>
                        <span className="text-xl font-bold text-green-600">
                          {calculatedPrice.toLocaleString("tr-TR")} ₺
                        </span>
                      </div>
                      {savings > 0 && (
                        <div className="flex items-center justify-between pt-3 border-t border-green-200 dark:border-green-500/20">
                          <span className="text-green-600 font-medium">Müşteri Kazancı:</span>
                          <span className="text-green-600 font-bold">
                            {savings.toLocaleString("tr-TR")} ₺ ({Math.round((savings / totalProductValue) * 100)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === "seo" && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium">SEO Başlık</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Arama sonuçlarında görünecek başlık..."
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                    <p className={`mt-1 text-xs ${metaTitle.length > 60 ? 'text-red-500' : metaTitle.length > 50 ? 'text-yellow-500' : 'text-gray-500'}`}>
                      {metaTitle.length}/60 karakter {metaTitle.length > 60 && '(çok uzun!)'}
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Meta Açıklama</label>
                    <textarea
                      rows={3}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Arama sonuçlarında görünecek açıklama..."
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                    <p className={`mt-1 text-xs ${metaDescription.length > 160 ? 'text-red-500' : metaDescription.length > 150 ? 'text-yellow-500' : 'text-gray-500'}`}>
                      {metaDescription.length}/160 karakter {metaDescription.length > 160 && '(çok uzun!)'}
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">URL Slug</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">fusionmarkt.com/urun/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        placeholder="paket-adi"
                        className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Anahtar Kelimeler</label>
                    <input
                      type="text"
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                      placeholder="anahtar, kelimeler, virgülle, ayrılmış"
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Virgülle ayırın (örn: solar paket, güç istasyonu, taşınabilir enerji)
                    </p>
                  </div>
                  
                  {/* Google Önizleme */}
                  <div className="rounded-lg border border-stroke p-4 dark:border-dark-3 bg-gray-50 dark:bg-dark-2">
                    <p className="text-sm font-medium mb-3">Google Önizleme</p>
                    <div className="space-y-1">
                      <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">
                        {metaTitle || name || "Paket Adı"} - FusionMarkt
                      </p>
                      <p className="text-[#006621] text-sm">
                        fusionmarkt.com › urun › {slug || "paket-adi"}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {metaDescription || shortDescription || "Meta açıklama buraya gelecek. Arama sonuçlarında kullanıcıların göreceği açıklama metni..."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel */}
        <div className="space-y-6">
          {/* Durum */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="font-semibold text-dark dark:text-white mb-4">Durum</h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Aktif</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-gray-300 dark:bg-dark-2"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isActive ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Öne Çıkar</span>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isFeatured ? "bg-amber-500" : "bg-gray-300 dark:bg-dark-2"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isFeatured ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </label>
            </div>
          </div>

          {/* Özet */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="font-semibold text-dark dark:text-white mb-4">Paket Özeti</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ürün Sayısı:</span>
                <span className="font-medium text-dark dark:text-white">{bundleItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kategori Sayısı:</span>
                <span className="font-medium text-dark dark:text-white">{selectedCategories.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tahmini Stok:</span>
                <span className={`font-medium ${minStock === 0 ? "text-red-500" : "text-green-500"}`}>
                  {bundleItems.length > 0 ? minStock : "-"}
                </span>
              </div>
              <div className="pt-3 border-t border-stroke dark:border-dark-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Paket Fiyatı:</span>
                  <span className="font-bold text-lg text-primary">
                    {calculatedPrice.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Görsel */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="font-semibold text-dark dark:text-white mb-4">Paket Görseli</h3>
            
            <div 
              onClick={() => {
                setMediaSelectMode("thumbnail");
                setShowMediaModal(true);
              }}
              className="aspect-square rounded-xl border-2 border-dashed border-stroke cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center overflow-hidden dark:border-dark-3"
            >
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  alt="Thumbnail"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-500">Görsel eklemek için tıklayın</p>
                </div>
              )}
            </div>

            {thumbnail && (
              <button
                type="button"
                onClick={() => setThumbnail("")}
                className="w-full mt-2 text-sm text-red-500 hover:underline"
              >
                Görseli Kaldır
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ürün Seçici Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-xl bg-white dark:bg-gray-dark flex flex-col">
            <div className="p-4 border-b border-stroke dark:border-dark-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dark dark:text-white">Ürün Ekle</h3>
                <button
                  onClick={() => setShowProductPicker(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-dark-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Ürün ara..."
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 dark:border-dark-3 focus:border-primary focus:outline-none"
                autoFocus
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Ürün bulunamadı</p>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.slice(0, 50).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductSelect(product)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-stroke hover:border-primary hover:bg-primary/5 transition-colors dark:border-dark-3"
                    >
                      <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-dark-2 overflow-hidden flex-shrink-0">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-dark dark:text-white truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{product.price.toLocaleString("tr-TR")} ₺</span>
                          <span>•</span>
                          <span>Stok: {product.stock}</span>
                          {product.variants && product.variants.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-500 font-medium">{product.variants.length} varyasyon</span>
                            </>
                          )}
                        </div>
                      </div>
                      {product.variants && product.variants.length > 0 ? (
                        <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Varyasyon Seçici Modal */}
      {showVariantPicker && selectedProductForVariant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-dark">
            <div className="p-4 border-b border-stroke dark:border-dark-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-dark dark:text-white">Varyasyon Seçin</h3>
                  <p className="text-sm text-gray-500">{selectedProductForVariant.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowVariantPicker(false);
                    setSelectedProductForVariant(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-dark-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {/* Tümünü Ekle Butonu */}
              <button
                type="button"
                onClick={() => addAllVariants(selectedProductForVariant)}
                className="w-full mb-3 p-3 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 text-primary font-medium hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                  </svg>
                  Tüm Varyasyonları Ekle ({selectedProductForVariant.variants?.length})
                </div>
              </button>

              <div className="text-xs text-gray-500 text-center mb-3">veya tek tek seçin</div>

              {/* Varyasyon Listesi */}
              <div className="space-y-2">
                {selectedProductForVariant.variants?.map((variant) => {
                  const isAlreadyAdded = bundleItems.some(
                    item => item.productId === selectedProductForVariant.id && item.variantId === variant.id
                  );
                  
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        if (!isAlreadyAdded) {
                          addProduct(selectedProductForVariant, variant.id, `${variant.name}: ${variant.value}`);
                        }
                      }}
                      disabled={isAlreadyAdded}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isAlreadyAdded 
                          ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed dark:border-dark-3 dark:bg-dark-2"
                          : "border-stroke hover:border-primary hover:bg-primary/5 dark:border-dark-3"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-2 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-500">{variant.value.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-dark dark:text-white">{variant.name}: {variant.value}</p>
                          <p className="text-sm text-gray-500">
                            {variant.price ? `${variant.price.toLocaleString("tr-TR")} ₺ • ` : ""}
                            Stok: {variant.stock}
                          </p>
                        </div>
                      </div>
                      {isAlreadyAdded ? (
                        <span className="text-xs text-gray-400">Eklendi</span>
                      ) : (
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaModal && (
        <MediaLibrary
          isOpen={showMediaModal}
          onSelect={(media) => {
            if (Array.isArray(media)) {
              // Multiple selection (gallery mode)
              setProductImages((prev) => [...prev, ...media.map(m => m.url)]);
            } else {
              // Single selection
              if (mediaSelectMode === "thumbnail") {
                setThumbnail(media.url);
              } else {
                setProductImages((prev) => [...prev, media.url]);
              }
            }
            setShowMediaModal(false);
          }}
          onClose={() => setShowMediaModal(false)}
          multiple={mediaSelectMode === "gallery"}
        />
      )}
    </div>
  );
}

