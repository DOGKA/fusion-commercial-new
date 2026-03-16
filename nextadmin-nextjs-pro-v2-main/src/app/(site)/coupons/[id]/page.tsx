"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  minOrderAmount: string | null;
  maxDiscount: string | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  // Yeni alanlar
  allowedCategories: string[];
  excludedCategories: string[];
  allowedProducts: string[];
  excludedProducts: string[];
  excludeSaleItems: boolean;
  freeShipping: boolean;
}

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [activeTab, setActiveTab] = useState("general");
  const [couponCode, setCouponCode] = useState("");
  const [description, setDescription] = useState("");
  
  // General
  const [discountType, setDiscountType] = useState("percentage");
  const [couponAmount, setCouponAmount] = useState("");
  const [allowFreeShipping, setAllowFreeShipping] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  
  // Usage Restriction
  const [minSpend, setMinSpend] = useState("");
  const [maxSpend, setMaxSpend] = useState("");
  const [individualUseOnly, setIndividualUseOnly] = useState(false);
  const [excludeSaleItems, setExcludeSaleItems] = useState(false);
  const [allowedProducts, setAllowedProducts] = useState<string[]>([]);
  const [excludedProducts, setExcludedProducts] = useState<string[]>([]);
  const [allowedCategories, setAllowedCategories] = useState<string[]>([]);
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
  const [allowedEmails, setAllowedEmails] = useState("");
  
  // Usage Limits
  const [usageLimit, setUsageLimit] = useState("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState("");
  const [usageCount, setUsageCount] = useState(0);

  // Yayın durumu
  const [status, setStatus] = useState("published");
  const [isActive, setIsActive] = useState(true);

  // Kupon ve referans verileri çek
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Kupon verilerini çek
        const couponRes = await fetch(`/api/admin/coupons/${couponId}`);
        if (!couponRes.ok) {
          toast.error("Kupon bulunamadı");
          router.push("/coupons");
          return;
        }
        const coupon: Coupon = await couponRes.json();
        
        // Form alanlarını doldur
        setCouponCode(coupon.code);
        setDescription(coupon.description || "");
        setDiscountType(coupon.discountType === "PERCENTAGE" ? "percentage" : "fixed_cart");
        setCouponAmount(coupon.discountValue?.toString() || "");
        setMinSpend(coupon.minOrderAmount?.toString() || "");
        setMaxSpend(coupon.maxDiscount?.toString() || "");
        setUsageLimit(coupon.usageLimit?.toString() || "");
        setUsageLimitPerUser(coupon.perUserLimit?.toString() || "");
        setUsageCount(coupon.usageCount || 0);
        setIsActive(coupon.isActive);
        setStatus(coupon.isActive ? "published" : "draft");
        
        // Yeni alanlar
        setAllowedCategories(coupon.allowedCategories || []);
        setExcludedCategories(coupon.excludedCategories || []);
        setAllowedProducts(coupon.allowedProducts || []);
        setExcludedProducts(coupon.excludedProducts || []);
        setExcludeSaleItems(coupon.excludeSaleItems || false);
        setAllowFreeShipping(coupon.freeShipping || false);
        
        if (coupon.endDate) {
          const date = new Date(coupon.endDate);
          setExpiryDate(date.toISOString().split('T')[0]);
        }

        // Ürünleri çek
        const productsRes = await fetch("/api/products?limit=100");
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products || []);
        }

        // Kategorileri çek
        const categoriesRes = await fetch("/api/categories");
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          // API { categories: [...] } veya direkt array dönebilir
          setCategories(Array.isArray(data) ? data : (data.categories || []));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Veri yüklenirken hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };

    if (couponId) {
      fetchData();
    }
  }, [couponId, router]);

  const tabs = [
    { id: "general", label: "Genel" },
    { id: "restriction", label: "Kullanım Kısıtlamaları" },
    { id: "limits", label: "Kullanım Limitleri" },
  ];

  // İndirim hesaplama önizleme
  const calculateDiscount = (cartTotal: number) => {
    const amount = parseFloat(couponAmount) || 0;
    if (discountType === "percentage") {
      return Math.min((cartTotal * amount) / 100, cartTotal);
    } else if (discountType === "fixed_cart") {
      return Math.min(amount, cartTotal);
    }
    return 0;
  };

  // Kupon güncelle
  const handleSave = async () => {
    if (!couponCode.trim()) {
      toast.error("Kupon kodu zorunludur");
      return;
    }

    if (!couponAmount || parseFloat(couponAmount) <= 0) {
      toast.error("Geçerli bir indirim miktarı giriniz");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          description,
          discountType: discountType === "percentage" ? "percentage" : "fixed",
          discountValue: parseFloat(couponAmount),
          minOrderAmount: minSpend ? parseFloat(minSpend) : null,
          maxDiscount: maxSpend ? parseFloat(maxSpend) : null,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          perUserLimit: usageLimitPerUser ? parseInt(usageLimitPerUser) : 1,
          endDate: expiryDate || null,
          isActive: status === "published",
          // Kategori ve ürün kısıtlamaları
          allowedCategories,
          excludedCategories,
          allowedProducts,
          excludedProducts,
          excludeSaleItems,
          freeShipping: allowFreeShipping,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kupon güncellenemedi");
      }

      toast.success("Kupon başarıyla güncellendi");
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  // Kupon sil
  const handleDelete = async () => {
    if (!confirm("Bu kuponu silmek istediğinizden emin misiniz?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kupon silinemedi");
      }

      toast.success("Kupon başarıyla silindi");
      router.push("/coupons");
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/coupons"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">Kuponu Düzenle</h1>
            <p className="text-gray-500">Kupon: {couponCode}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Siliniyor..." : "Sil"}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol Panel - Ana Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kupon Kodu */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-2 block text-sm font-medium">Kupon Kodu *</label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="YILSONU2024"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-lg font-mono font-bold tracking-wider uppercase dark:border-dark-3 focus:border-primary focus:outline-none"
            />
            <p className="mt-2 text-xs text-gray-500">Kupon kodu büyük harflerle görünecektir</p>
          </div>

          {/* Açıklama */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-2 block text-sm font-medium">Açıklama (isteğe bağlı)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Bu kupon hakkında dahili not..."
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Tabs */}
          <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark overflow-hidden">
            <div className="flex border-b border-stroke dark:border-dark-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* General Tab */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium">İndirim Tipi</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                    >
                      <option value="percentage">Yüzde İndirimi (%)</option>
                      <option value="fixed_cart">Sabit Sepet İndirimi (₺)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Kupon Miktarı {discountType === "percentage" ? "(%)" : "(₺)"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={couponAmount}
                        onChange={(e) => setCouponAmount(e.target.value)}
                        placeholder="0"
                        min="0"
                        max={discountType === "percentage" ? "100" : undefined}
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 pr-12 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        {discountType === "percentage" ? "%" : "₺"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Kupon Son Kullanma Tarihi</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Usage Restriction Tab */}
              {activeTab === "restriction" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Minimum Harcama (₺)</label>
                      <input
                        type="number"
                        value={minSpend}
                        onChange={(e) => setMinSpend(e.target.value)}
                        placeholder="Limit yok"
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Maksimum İndirim (₺)</label>
                      <input
                        type="number"
                        value={maxSpend}
                        onChange={(e) => setMaxSpend(e.target.value)}
                        placeholder="Limit yok"
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={individualUseOnly}
                        onChange={(e) => setIndividualUseOnly(e.target.checked)}
                        className="h-5 w-5 rounded text-primary"
                      />
                      <div>
                        <span className="font-medium">Tek Başına Kullanım</span>
                        <p className="text-xs text-gray-500">Bu kupon diğer kuponlarla birlikte kullanılamaz</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={excludeSaleItems}
                        onChange={(e) => setExcludeSaleItems(e.target.checked)}
                        className="h-5 w-5 rounded text-primary"
                      />
                      <div>
                        <span className="font-medium">İndirimli Ürünleri Hariç Tut</span>
                        <p className="text-xs text-gray-500">Zaten indirimde olan ürünlere uygulanmaz</p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Sadece Bu Ürünlerde Geçerli</label>
                    <select
                      multiple
                      value={allowedProducts}
                      onChange={(e) => setAllowedProducts(Array.from(e.target.selectedOptions, o => o.value))}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 h-32"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">İzin Verilen Kategoriler</label>
                      <div className="max-h-40 overflow-y-auto rounded-lg border border-stroke p-3 dark:border-dark-3 space-y-2">
                        {categories.map(cat => (
                          <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={allowedCategories.includes(cat.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAllowedCategories([...allowedCategories, cat.id]);
                                } else {
                                  setAllowedCategories(allowedCategories.filter(id => id !== cat.id));
                                }
                              }}
                              className="h-4 w-4 rounded text-primary"
                            />
                            <span className="text-sm">{cat.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Hariç Tutulan Kategoriler</label>
                      <div className="max-h-40 overflow-y-auto rounded-lg border border-stroke p-3 dark:border-dark-3 space-y-2">
                        {categories.map(cat => (
                          <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={excludedCategories.includes(cat.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExcludedCategories([...excludedCategories, cat.id]);
                                } else {
                                  setExcludedCategories(excludedCategories.filter(id => id !== cat.id));
                                }
                              }}
                              className="h-4 w-4 rounded text-primary"
                            />
                            <span className="text-sm">{cat.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">İzin Verilen E-postalar</label>
                    <textarea
                      value={allowedEmails}
                      onChange={(e) => setAllowedEmails(e.target.value)}
                      rows={3}
                      placeholder="ornek@mail.com, diger@mail.com"
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Usage Limits Tab */}
              {activeTab === "limits" && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Kupon Kullanım Limiti</label>
                    <input
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      placeholder="Sınırsız"
                      min="0"
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Kullanıcı Başına Kullanım Limiti</label>
                    <input
                      type="number"
                      value={usageLimitPerUser}
                      onChange={(e) => setUsageLimitPerUser(e.target.value)}
                      placeholder="Sınırsız"
                      min="0"
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Kullanım İstatistikleri */}
                  <div className="rounded-lg border border-stroke p-4 dark:border-dark-3 bg-gray-50 dark:bg-dark-2">
                    <h4 className="font-medium text-dark dark:text-white mb-3">Kullanım İstatistikleri</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-dark dark:text-white">{usageCount}</p>
                        <p className="text-xs text-gray-500">Toplam Kullanım</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-dark dark:text-white">-</p>
                        <p className="text-xs text-gray-500">Toplam İndirim</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500">
                          {usageLimit ? Math.max(0, parseInt(usageLimit) - usageCount) : "∞"}
                        </p>
                        <p className="text-xs text-gray-500">Kalan Kullanım</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel */}
        <div className="space-y-6">
          {/* Yayın Durumu */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Yayın Durumu</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Durum:</span>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded border border-stroke bg-transparent px-2 py-1 text-sm dark:border-dark-3"
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Kullanım:</span>
                <span className="text-dark dark:text-white">{usageCount} kez kullanıldı</span>
              </div>
            </div>
          </div>

          {/* Kupon Önizleme */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Kupon Önizleme</h3>
            
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-white shadow-lg">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-dark" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-dark" />
              
              <div className="text-center mb-4">
                <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-widest bg-white/20 rounded-full font-semibold">
                  İndirim Kuponu
                </span>
              </div>
              
              <div className="text-center mb-4">
                <span className="text-5xl font-black tracking-tight">
                  {couponAmount || "0"}{discountType === "percentage" ? "%" : "₺"}
                </span>
                <p className="text-sm opacity-90 mt-1 font-medium">
                  {discountType === "percentage" ? "İndirim" : "Sepet İndirimi"}
                </p>
              </div>

              <div className="border-t-2 border-dashed border-white/30 my-4" />

              <div className="text-center">
                <div className="inline-block bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-white/20">
                  <span className="font-mono text-lg font-bold tracking-[0.2em]">
                    {couponCode || "KUPONKODU"}
                  </span>
                </div>
              </div>

              {expiryDate && (
                <p className="text-center text-xs opacity-70 mt-3">
                  Son: {new Date(expiryDate).toLocaleDateString('tr-TR')}
                </p>
              )}
            </div>
          </div>

          {/* İndirim Hesaplama */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">İndirim Hesaplama</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Örnek Sepet:</span>
                <span className="text-dark dark:text-white">1.000₺</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">İndirim:</span>
                <span className="text-green-500 font-medium">-{calculateDiscount(1000).toLocaleString('tr-TR')}₺</span>
              </div>
              <div className="border-t border-stroke dark:border-dark-3 pt-3 flex items-center justify-between">
                <span className="font-medium text-dark dark:text-white">Toplam:</span>
                <span className="font-bold text-lg text-dark dark:text-white">
                  {(1000 - calculateDiscount(1000)).toLocaleString('tr-TR')}₺
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
