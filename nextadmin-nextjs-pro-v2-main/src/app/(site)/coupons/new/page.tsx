"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function NewCouponPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
  const [limitUsageToXItems, setLimitUsageToXItems] = useState("");

  // Yayın durumu
  const [status, setStatus] = useState("published");

  // Ürünleri ve kategorileri çek
  useEffect(() => {
    const fetchData = async () => {
      try {
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
          setCategories(data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const generateCouponCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponCode(code);
  };

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
    } else if (discountType === "fixed_product") {
      return amount;
    }
    return 0;
  };

  // Kupon kaydet
  const handleSave = async (isDraft: boolean = false) => {
    if (!couponCode.trim()) {
      toast.error("Kupon kodu zorunludur");
      return;
    }

    if (!couponAmount || parseFloat(couponAmount) <= 0) {
      toast.error("Geçerli bir indirim miktarı giriniz");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
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
          isActive: isDraft ? false : status === "published",
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
        throw new Error(error.error || "Kupon oluşturulamadı");
      }

      toast.success(isDraft ? "Kupon taslak olarak kaydedildi" : "Kupon başarıyla oluşturuldu");
      router.push("/coupons");
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Yeni Kupon Oluştur</h1>
          <p className="text-gray-500">İndirim kuponu oluşturun ve müşterilerinize sunun</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleSave(true)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2 disabled:opacity-50"
          >
            {isLoading ? "Kaydediliyor..." : "Taslak Kaydet"}
          </button>
          <button 
            onClick={() => handleSave(false)}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Kaydediliyor..." : "Kuponu Yayınla"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol Panel - Ana Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kupon Kodu */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-2 block text-sm font-medium">Kupon Kodu *</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="YILSONU2024"
                className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-3 text-lg font-mono font-bold tracking-wider uppercase dark:border-dark-3 focus:border-primary focus:outline-none"
              />
              <button
                onClick={generateCouponCode}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-dark-2 dark:hover:bg-dark-3 text-sm font-medium transition-colors"
              >
                🎲 Otomatik Oluştur
              </button>
            </div>
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
            <p className="mt-2 text-xs text-gray-500">Bu açıklama sadece admin panelinde görünür, müşteriler görmez</p>
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
                  {/* İndirim Tipi */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">İndirim Tipi</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                    >
                      <option value="percentage">Yüzde İndirimi (%)</option>
                      <option value="fixed_cart">Sabit Sepet İndirimi (₺)</option>
                      <option value="fixed_product">Sabit Ürün İndirimi (₺)</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {discountType === "percentage" && "Sepet toplamının yüzdesi kadar indirim uygular"}
                      {discountType === "fixed_cart" && "Sepet toplamından sabit bir tutar düşer"}
                      {discountType === "fixed_product" && "Her ürün için sabit bir tutar düşer"}
                    </p>
                  </div>

                  {/* Kupon Miktarı */}
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

                  {/* Ücretsiz Kargo */}
                  <div className="rounded-lg border border-stroke p-4 dark:border-dark-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowFreeShipping}
                        onChange={(e) => setAllowFreeShipping(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded text-primary"
                      />
                      <div>
                        <span className="font-medium text-dark dark:text-white">Ücretsiz Kargo</span>
                        <p className="text-sm text-gray-500 mt-1">
                          Bu kuponu kullanan müşterilere ücretsiz kargo sağlar.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Son Kullanma Tarihi */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">Kupon Son Kullanma Tarihi</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">Boş bırakılırsa kupon süresiz geçerli olur</p>
                  </div>
                </div>
              )}

              {/* Usage Restriction Tab */}
              {activeTab === "restriction" && (
                <div className="space-y-6">
                  {/* Minimum/Maximum Harcama */}
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
                      <label className="mb-2 block text-sm font-medium">Maksimum Harcama (₺)</label>
                      <input
                        type="number"
                        value={maxSpend}
                        onChange={(e) => setMaxSpend(e.target.value)}
                        placeholder="Limit yok"
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Checkboxes */}
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

                  {/* İzin Verilen Ürünler */}
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
                    <p className="mt-1 text-xs text-gray-500">
                      {products.length === 0 
                        ? "Ürünler yükleniyor..." 
                        : "Ctrl/Cmd tuşuna basarak birden fazla seçebilirsiniz. Boş bırakılırsa tüm ürünlerde geçerli."}
                    </p>
                  </div>

                  {/* Hariç Tutulan Ürünler */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">Bu Ürünlerde Geçersiz</label>
                    <select
                      multiple
                      value={excludedProducts}
                      onChange={(e) => setExcludedProducts(Array.from(e.target.selectedOptions, o => o.value))}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 h-32"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Kategoriler */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">İzin Verilen Kategoriler</label>
                      <div className="max-h-40 overflow-y-auto rounded-lg border border-stroke p-3 dark:border-dark-3 space-y-2">
                        {categories.length === 0 ? (
                          <p className="text-xs text-gray-500">Kategoriler yükleniyor...</p>
                        ) : (
                          categories.map(cat => (
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
                          ))
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Hariç Tutulan Kategoriler</label>
                      <div className="max-h-40 overflow-y-auto rounded-lg border border-stroke p-3 dark:border-dark-3 space-y-2">
                        {categories.length === 0 ? (
                          <p className="text-xs text-gray-500">Kategoriler yükleniyor...</p>
                        ) : (
                          categories.map(cat => (
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
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* İzin Verilen E-postalar */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">İzin Verilen E-postalar</label>
                    <textarea
                      value={allowedEmails}
                      onChange={(e) => setAllowedEmails(e.target.value)}
                      rows={3}
                      placeholder="ornek@mail.com, diger@mail.com"
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">Sadece bu e-posta adreslerine sahip kullanıcılar kuponu kullanabilir. Virgülle ayırın.</p>
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
                    <p className="mt-1 text-xs text-gray-500">Bu kupon toplamda kaç kez kullanılabilir. Boş bırakılırsa sınırsız.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">X Ürünle Sınırla</label>
                    <input
                      type="number"
                      value={limitUsageToXItems}
                      onChange={(e) => setLimitUsageToXItems(e.target.value)}
                      placeholder="Tüm uygun ürünlere uygula"
                      min="0"
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">Sepetteki maksimum kaç ürüne indirim uygulanacak.</p>
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
                    <p className="mt-1 text-xs text-gray-500">Her kullanıcı bu kuponu kaç kez kullanabilir.</p>
                  </div>

                  {/* Kullanım İstatistikleri */}
                  <div className="rounded-lg border border-stroke p-4 dark:border-dark-3 bg-gray-50 dark:bg-dark-2">
                    <h4 className="font-medium text-dark dark:text-white mb-3">Kullanım İstatistikleri</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-dark dark:text-white">0</p>
                        <p className="text-xs text-gray-500">Toplam Kullanım</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-dark dark:text-white">0₺</p>
                        <p className="text-xs text-gray-500">Toplam İndirim</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500">{usageLimit ? parseInt(usageLimit) : "∞"}</p>
                        <p className="text-xs text-gray-500">Kalan Kullanım</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel - Önizleme ve Yayın */}
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
                <span className="text-gray-500">Görünürlük:</span>
                <span className="text-dark dark:text-white">Herkese Açık</span>
              </div>
            </div>
          </div>

          {/* Kupon Önizleme - Düzeltilmiş Tasarım */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Kupon Önizleme</h3>
            
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-white shadow-lg">
              {/* Dekoratif kesik noktalar - sol */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-dark" />
              {/* Dekoratif kesik noktalar - sağ */}
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-dark" />
              
              {/* Üst kısım */}
              <div className="text-center mb-4">
                <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-widest bg-white/20 rounded-full font-semibold">
                  İndirim Kuponu
                </span>
              </div>
              
              {/* Ana indirim değeri */}
              <div className="text-center mb-4">
                <span className="text-5xl font-black tracking-tight">
                  {couponAmount || "0"}{discountType === "percentage" ? "%" : "₺"}
                </span>
                <p className="text-sm opacity-90 mt-1 font-medium">
                  {discountType === "percentage" && "İndirim"}
                  {discountType === "fixed_cart" && "Sepet İndirimi"}
                  {discountType === "fixed_product" && "Ürün Başına"}
                </p>
              </div>

              {/* Kesik çizgi ayırıcı */}
              <div className="border-t-2 border-dashed border-white/30 my-4" />

              {/* Kupon kodu */}
              <div className="text-center">
                <div className="inline-block bg-white/15 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-white/20">
                  <span className="font-mono text-lg font-bold tracking-[0.2em]">
                    {couponCode || "KUPONKODU"}
                  </span>
                </div>
              </div>

              {/* Ücretsiz kargo badge */}
              {allowFreeShipping && (
                <div className="text-center mt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-white/20 px-3 py-1.5 rounded-full font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
                      <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
                      <circle cx="7" cy="18" r="2" />
                      <path d="M15 18H9" />
                      <circle cx="17" cy="18" r="2" />
                    </svg>
                    Ücretsiz Kargo
                  </span>
                </div>
              )}

              {/* Son kullanma tarihi */}
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

          {/* Özet */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Kupon Özeti</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={couponCode ? "text-green-500" : "text-gray-400"}>
                  {couponCode ? "✓" : "○"}
                </span>
                <span className={couponCode ? "text-dark dark:text-white" : "text-gray-400"}>
                  Kupon kodu belirlendi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={couponAmount ? "text-green-500" : "text-gray-400"}>
                  {couponAmount ? "✓" : "○"}
                </span>
                <span className={couponAmount ? "text-dark dark:text-white" : "text-gray-400"}>
                  İndirim miktarı belirlendi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={minSpend ? "text-green-500" : "text-gray-400"}>
                  {minSpend ? "✓" : "○"}
                </span>
                <span className={minSpend ? "text-dark dark:text-white" : "text-gray-400"}>
                  Minimum harcama: {minSpend || "Yok"}₺
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={usageLimit ? "text-green-500" : "text-gray-400"}>
                  {usageLimit ? "✓" : "○"}
                </span>
                <span className={usageLimit ? "text-dark dark:text-white" : "text-gray-400"}>
                  Kullanım limiti: {usageLimit || "Sınırsız"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
