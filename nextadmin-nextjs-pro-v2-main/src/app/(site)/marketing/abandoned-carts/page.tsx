"use client";

import { useEffect, useState } from "react";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail?: string;
}

interface AbandonedCart {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  items: CartItem[];
  total: number;
  abandonedAt: string;
  lastReminderSentAt: string | null;
  reminderCount: number;
  reminderSent: boolean;
}

interface Stats {
  totalAbandonedCarts: number;
  totalRemindersSent: number;
  totalNotSent: number;
  totalPotentialLoss: number;
  thresholdDays: number;
}

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number | null;
  endDate: string | null;
  isActive: boolean;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "not_sent" | "sent">("all");
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Detail modal state
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<string>("");
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/marketing/abandoned-carts?filter=${filter}`);
      if (!res.ok) throw new Error("Veriler yüklenemedi");
      const data = await res.json();
      setCarts(data.carts || []);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const res = await fetch("/api/admin/coupons?limit=100");
      if (res.ok) {
        const data = await res.json();
        // API returns array directly, not wrapped in { coupons: [...] }
        const couponsArray = Array.isArray(data) ? data : (data.coupons || []);
        // Filter active coupons only
        const activeCoupons = couponsArray.filter((c: Coupon) => c.isActive);
        setCoupons(activeCoupons);
      }
    } catch (err) {
      console.error("Kuponlar yüklenemedi:", err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const openDetailModal = (cart: AbandonedCart) => {
    setSelectedCart(cart);
    setSelectedCouponId("");
    fetchCoupons();
  };

  const closeDetailModal = () => {
    setSelectedCart(null);
    setSelectedCouponId("");
  };

  const sendReminder = async (cartId: string, couponId?: string) => {
    setSendingReminder(cartId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/marketing/abandoned-carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, couponId: couponId || undefined }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ 
          type: "success", 
          text: data.couponApplied 
            ? `Kuponlu hatırlatma gönderildi: ${data.email}`
            : `Hatırlatma gönderildi: ${data.email}` 
        });
        closeDetailModal();
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error || "Hatırlatma gönderilemedi" });
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata oluştu" });
    } finally {
      setSendingReminder(null);
    }
  };

  const sendBulkReminder = async () => {
    if (!confirm("Tüm uygun sepetlere hatırlatma göndermek istediğinize emin misiniz?")) {
      return;
    }

    setBulkSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/marketing/abandoned-carts/bulk", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: `${data.sent} hatırlatma gönderildi${data.failed > 0 ? `, ${data.failed} başarısız` : ""}`,
        });
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error || "Toplu gönderim başarısız" });
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata oluştu" });
    } finally {
      setBulkSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-medium text-dark dark:text-white">{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Terk Edilmiş Sepetler</h1>
          <p className="text-gray-500">
            Son {stats?.thresholdDays || 7} günde güncellenmemiş sepetleri takip edin ve müşterilere hatırlatma gönderin
          </p>
        </div>
        <button
          onClick={sendBulkReminder}
          disabled={bulkSending || (stats?.totalNotSent || 0) === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {bulkSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Gönderiliyor...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Toplu Hatırlatma Gönder ({stats?.totalNotSent || 0})
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats?.totalAbandonedCarts || 0}</p>
              <p className="text-sm text-gray-500">Terk Edilen Sepet</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">
                {(stats?.totalPotentialLoss || 0).toLocaleString("tr-TR")} ₺
              </p>
              <p className="text-sm text-gray-500">Potansiyel Kayıp</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats?.totalRemindersSent || 0}</p>
              <p className="text-sm text-gray-500">Hatırlatma Gönderildi</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats?.totalNotSent || 0}</p>
              <p className="text-sm text-gray-500">Bekleyen Hatırlatma</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-2 dark:text-gray-400 dark:hover:bg-dark-3"
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setFilter("not_sent")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "not_sent"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-2 dark:text-gray-400 dark:hover:bg-dark-3"
          }`}
        >
          Hatırlatma Gönderilmemiş
        </button>
        <button
          onClick={() => setFilter("sent")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "sent"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-2 dark:text-gray-400 dark:hover:bg-dark-3"
          }`}
        >
          Hatırlatma Gönderilmiş
        </button>
      </div>

      {/* Abandoned Carts Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Terk Edilmiş Sepetler</h2>
        </div>

        {carts.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500">Terk edilmiş sepet bulunamadı</p>
            <p className="text-xs text-gray-400 mt-2">7 günden fazla güncellenmemiş sepetler burada görünür</p>
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-dark-3">
            {carts.map((cart) => (
              <div key={cart.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium text-primary">
                        {cart.customerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-dark dark:text-white">{cart.customerName}</p>
                      <p className="text-sm text-gray-500">{cart.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(cart.abandonedAt).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {cart.reminderSent && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-500">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {cart.reminderCount}x hatırlatma gönderildi
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {cart.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium text-dark dark:text-white">
                        {(item.price * item.quantity).toLocaleString("tr-TR")} ₺
                      </span>
                    </div>
                  ))}
                  {cart.items.length > 2 && (
                    <p className="text-xs text-gray-500">+{cart.items.length - 2} ürün daha</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stroke dark:border-dark-3">
                  <p className="font-semibold text-dark dark:text-white">
                    Toplam: {cart.total.toLocaleString("tr-TR")} ₺
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetailModal(cart)}
                      className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
                    >
                      Detay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl dark:bg-gray-dark m-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stroke p-6 dark:border-dark-3">
              <div>
                <h3 className="text-lg font-semibold text-dark dark:text-white">Sepet Detayı</h3>
                <p className="text-sm text-gray-500">{selectedCart.customerName} - {selectedCart.email}</p>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-dark-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Cart Items */}
              <div>
                <h4 className="text-sm font-semibold text-dark dark:text-white mb-3">Sepetteki Ürünler</h4>
                <div className="space-y-3">
                  {selectedCart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg dark:bg-dark-2">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center dark:bg-dark-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-dark dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-dark dark:text-white">
                        {(item.price * item.quantity).toLocaleString("tr-TR")} ₺
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stroke dark:border-dark-3">
                  <span className="font-semibold text-dark dark:text-white">Toplam</span>
                  <span className="text-xl font-bold text-primary">
                    {selectedCart.total.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              </div>

              {/* Coupon Selection */}
              {selectedCart.reminderCount < 3 && (
                <div>
                  <h4 className="text-sm font-semibold text-dark dark:text-white mb-3">
                    Kupon Ata (Opsiyonel)
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Hatırlatma e-postasına özel bir kupon kodu ekleyebilirsiniz.
                  </p>
                  <select
                    value={selectedCouponId}
                    onChange={(e) => setSelectedCouponId(e.target.value)}
                    disabled={loadingCoupons}
                    className="w-full p-3 border border-stroke rounded-lg bg-white dark:bg-dark-2 dark:border-dark-3 text-dark dark:text-white"
                  >
                    <option value="">Kupon seçilmedi</option>
                    {coupons.map((coupon) => (
                      <option key={coupon.id} value={coupon.id}>
                        {coupon.code} - {coupon.discountType === "PERCENTAGE" ? `%${coupon.discountValue}` : `${coupon.discountValue} ₺`}
                        {coupon.minOrderAmount ? ` (Min: ${coupon.minOrderAmount} ₺)` : ""}
                      </option>
                    ))}
                  </select>
                  {loadingCoupons && (
                    <p className="text-xs text-gray-500 mt-2">Kuponlar yükleniyor...</p>
                  )}
                </div>
              )}

              {/* Info */}
              <div className="bg-gray-50 rounded-lg p-4 dark:bg-dark-2">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Bu sepet {new Date(selectedCart.abandonedAt).toLocaleDateString("tr-TR")} tarihinden beri güncellenmedi.
                    </p>
                    {selectedCart.reminderCount > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Daha önce {selectedCart.reminderCount} hatırlatma gönderildi.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-stroke p-6 dark:border-dark-3">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 rounded-lg border border-stroke hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
              >
                Kapat
              </button>
              {selectedCart.reminderCount < 3 ? (
                <button
                  onClick={() => sendReminder(selectedCart.id, selectedCouponId || undefined)}
                  disabled={sendingReminder === selectedCart.id}
                  className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {sendingReminder === selectedCart.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {selectedCouponId ? "Kuponlu Hatırlatma Gönder" : "Hatırlatma Gönder"}
                    </>
                  )}
                </button>
              ) : (
                <span className="px-4 py-2 text-sm text-gray-500">
                  Maksimum hatırlatma gönderildi
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
