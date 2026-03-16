"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  inMysteryBox: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
}

interface Stats {
  total: number;
  active: number;
  expired: number;
  totalUsage: number;
  inMysteryBox: number;
}

// Toggle Switch Component
function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  colorClass = "bg-primary",
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
  colorClass?: string;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${checked ? colorClass : "bg-gray-300 dark:bg-dark-3"}`}
      title={label}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    expired: 0,
    totalUsage: 0,
    inMysteryBox: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Kuponları getir
  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Kuponlar alınamadı");
      const data = await res.json();
      setCoupons(data.coupons || data);
      
      // İstatistikleri hesapla
      const now = new Date();
      const total = data.coupons?.length || data.length || 0;
      const active = (data.coupons || data).filter((c: Coupon) => 
        c.isActive && (!c.endDate || new Date(c.endDate) >= now)
      ).length;
      const expired = (data.coupons || data).filter((c: Coupon) => 
        !c.isActive || (c.endDate && new Date(c.endDate) < now)
      ).length;
      const totalUsage = (data.coupons || data).reduce((sum: number, c: Coupon) => sum + c.usageCount, 0);
      const inMysteryBox = (data.coupons || data).filter((c: Coupon) => c.inMysteryBox).length;
      
      setStats({ total, active, expired, totalUsage, inMysteryBox });
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Kuponlar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Toggle aktif/pasif
  const handleToggleActive = async (couponId: string, currentValue: boolean) => {
    setUpdating(couponId);
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}/toggle-active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentValue }),
      });
      
      if (!res.ok) throw new Error("Güncelleme başarısız");
      
      const updated = await res.json();
      setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, isActive: updated.isActive } : c));
      toast.success(updated.isActive ? "Kupon aktif edildi" : "Kupon pasif edildi");
      
      // İstatistikleri güncelle
      fetchCoupons();
    } catch (error) {
      console.error("Error toggling active:", error);
      toast.error("Güncelleme başarısız");
    } finally {
      setUpdating(null);
    }
  };

  // Toggle mystery box
  const handleToggleMysteryBox = async (couponId: string, currentValue: boolean) => {
    // Eğer açmak istiyorsak ve zaten 4 kupon varsa engelle
    if (!currentValue) {
      const mysteryBoxCount = coupons.filter(c => c.inMysteryBox).length;
      if (mysteryBoxCount >= 4) {
        toast.error("Kutuya en fazla 4 kupon gönderilebilir!");
        return;
      }
    }
    
    setUpdating(couponId);
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}/toggle-mystery-box`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inMysteryBox: !currentValue }),
      });
      
      if (!res.ok) throw new Error("Güncelleme başarısız");
      
      const updated = await res.json();
      setCoupons(prev => prev.map(c => 
        c.id === couponId 
          ? { ...c, inMysteryBox: updated.inMysteryBox, isActive: updated.isActive } 
          : c
      ));
      
      if (updated.inMysteryBox) {
        toast.success("Kupon kutuya eklendi ve aktif edildi");
      } else {
        toast.success("Kupon kutudan çıkarıldı ve pasif edildi");
      }
      
      // İstatistikleri güncelle
      fetchCoupons();
    } catch (error) {
      console.error("Error toggling mystery box:", error);
      toast.error("Güncelleme başarısız");
    } finally {
      setUpdating(null);
    }
  };

  // Kupon sil
  const handleDelete = async (couponId: string) => {
    if (!confirm("Bu kuponu silmek istediğinizden emin misiniz?")) return;
    
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error("Silme başarısız");
      
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      toast.success("Kupon silindi");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Silme başarısız");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const mysteryBoxCount = coupons.filter(c => c.inMysteryBox).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Kuponlar</h1>
          <p className="text-gray-500">İndirim kuponlarını yönetin</p>
        </div>
        <Link
          href="/coupons/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kupon
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500">Toplam Kupon</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.active}</p>
              <p className="text-sm text-gray-500">Aktif</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.expired}</p>
              <p className="text-sm text-gray-500">Pasif/Süresi Dolmuş</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{stats.totalUsage}</p>
              <p className="text-sm text-gray-500">Toplam Kullanım</p>
            </div>
          </div>
        </div>

        {/* Mystery Box Stats */}
        <div className="rounded-xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 dark:border-yellow-500/30">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-dark dark:text-white">{mysteryBoxCount}/4</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Kutudaki Kupon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Kupon Listesi</h2>
          {mysteryBoxCount > 0 && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {mysteryBoxCount} kupon kutuda
            </span>
          )}
        </div>

        {coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-gray-500 mb-4">Henüz kupon eklenmemiş</p>
            <Link
              href="/coupons/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90"
            >
              İlk Kuponu Oluşturun
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kod</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">İndirim</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Min. Tutar</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Kullanım</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Geçerlilik</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      Aktif
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Kutu
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date();
                  const isLimitReached = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;
                  const isUpdatingThis = updating === coupon.id;
                  
                  return (
                    <tr 
                      key={coupon.id} 
                      className={`border-b border-stroke last:border-0 dark:border-dark-3 transition-colors ${
                        coupon.inMysteryBox ? "bg-yellow-50/50 dark:bg-yellow-500/5" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded">
                            {coupon.code}
                          </span>
                          {coupon.inMysteryBox && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500 text-white text-xs">
                              🎁
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-dark dark:text-white">
                          {coupon.discountType === "PERCENTAGE" 
                            ? `%${Number(coupon.discountValue)}` 
                            : `${Number(coupon.discountValue).toLocaleString("tr-TR")} ₺`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 dark:text-gray-300">
                          {coupon.minOrderAmount ? `${Number(coupon.minOrderAmount).toLocaleString("tr-TR")} ₺` : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 dark:text-gray-300">
                          {coupon.usageCount} / {coupon.usageLimit || "∞"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-600 dark:text-gray-300">
                            {new Date(coupon.startDate).toLocaleDateString("tr-TR")}
                          </p>
                          {coupon.endDate && (
                            <p className={`${isExpired ? "text-red-500" : "text-gray-500"}`}>
                              → {new Date(coupon.endDate).toLocaleDateString("tr-TR")}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Toggle
                            checked={coupon.isActive}
                            onChange={() => handleToggleActive(coupon.id, coupon.isActive)}
                            disabled={isUpdatingThis || coupon.inMysteryBox}
                            label={coupon.inMysteryBox ? "Kutudaki kuponlar otomatik aktif" : "Aktif/Pasif"}
                            colorClass="bg-green-500"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Toggle
                            checked={coupon.inMysteryBox}
                            onChange={() => handleToggleMysteryBox(coupon.id, coupon.inMysteryBox)}
                            disabled={isUpdatingThis || (!coupon.inMysteryBox && mysteryBoxCount >= 4)}
                            label={
                              mysteryBoxCount >= 4 && !coupon.inMysteryBox 
                                ? "Kutu dolu (max 4)" 
                                : "Kutuya gönder"
                            }
                            colorClass="bg-yellow-500"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/coupons/${coupon.id}`}
                            className="rounded p-2 hover:bg-gray-100 dark:hover:bg-dark-2"
                            title="Düzenle"
                          >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="rounded p-2 hover:bg-red-50 dark:hover:bg-red-500/10"
                            title="Sil"
                          >
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-500/30 dark:bg-yellow-500/10">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Mystery Box Kuponları</p>
            <ul className="mt-1 text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Kutuya en fazla <strong>4 kupon</strong> gönderilebilir.</li>
              <li>• Kutuya gönderilen kuponlar otomatik olarak <strong>aktif</strong> olur.</li>
              <li>• Kutudan çıkarılan kuponlar otomatik olarak <strong>pasif</strong> olur.</li>
              <li>• Kutudaki kuponlar site ana sayfasındaki sürpriz kutularından çıkar.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
