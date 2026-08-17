"use client";

/**
 * Sepet & Sipariş Analizleri.
 *
 * Bu ekranda yalnızca veritabanında karşılığı olan sayılar gösteriliyor.
 * Önceki sürümde ürün dönüşüm oranı her yenilemede rastgele üretiliyor, dönüşüm
 * hunisi sipariş sayısının katları olarak uyduruluyor, cihaz dağılımı / terk
 * sebepleri / yoğun saatler ise kodda sabit yazılıyordu. Hepsi kaldırıldı.
 *
 * Ölçülmediği için burada yok: ürün görüntüleme, sepete ekleme oranı, ödeme
 * başlatma, cihaz kırılımı, terk sebebi, saat bazlı yoğunluk.
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface CartAnalyticsData {
  generatedAt: string;
  orders: { total: number; paid: number; cancelled: number };
  rates: { paidRate: number; cancellationRate: number };
  avgOrderValue: {
    allTime: number;
    currentMonth: number;
    lastMonth: number;
    change: number | null;
  };
  revenue: {
    paidAllTime: number;
    currentMonth: number;
    lastMonth: number;
    change: number | null;
  };
  statusDistribution: Array<{
    status: string;
    label: string;
    count: number;
    percent: number;
  }>;
  timeStats: {
    todayOrders: number;
    weekOrders: number;
    monthOrders: number;
    totalOrders: number;
  };
  topProducts: Array<{
    id: string | null;
    name: string;
    thumbnail: string | null;
    price: number;
    quantitySold: number;
    orderCount: number;
  }>;
  carts: { active: number; abandoned: number; thresholdDays: number };
}

const STATUS_BAR_COLORS: Record<string, string> = {
  DELIVERED: "bg-green-500",
  SHIPPED: "bg-blue-500",
  PROCESSING: "bg-indigo-500",
  PENDING: "bg-yellow-500",
  CANCELLED: "bg-red-500",
  REFUNDED: "bg-orange-500",
};

function formatTL(value: number): string {
  return `${value.toLocaleString("tr-TR")} ₺`;
}

function ChangeBadge({
  change,
  lowerIsBetter = false,
}: {
  change: number | null;
  lowerIsBetter?: boolean;
}) {
  if (change === null) {
    return (
      <span
        className="text-xs px-2 py-1 rounded text-gray-500 bg-gray-100 dark:bg-dark-3"
        title="Karşılaştırılacak önceki dönem verisi yok"
      >
        —
      </span>
    );
  }

  const isGood = lowerIsBetter ? change <= 0 : change >= 0;
  return (
    <span
      className={`text-xs px-2 py-1 rounded ${
        isGood
          ? "text-green-500 bg-green-100 dark:bg-green-500/10"
          : "text-red-500 bg-red-100 dark:bg-red-500/10"
      }`}
    >
      {change > 0 ? "+" : ""}
      {change}%
    </span>
  );
}

export default function CartAnalyticsPage() {
  const [data, setData] = useState<CartAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/analytics/cart");
        if (!res.ok) throw new Error("Veriler yüklenemedi");
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { orders, rates, avgOrderValue, revenue, statusDistribution, timeStats, topProducts, carts } = data;
  const maxQuantitySold = Math.max(1, ...topProducts.map((p) => p.quantitySold));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Sepet &amp; Sipariş Analizleri
          </h1>
          <p className="text-gray-500">
            Sipariş ve sepet verilerine dayalı ölçümler
          </p>
        </div>
        <span className="text-sm text-gray-500">
          Son güncelleme:{" "}
          {new Date(data.generatedAt).toLocaleString("tr-TR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Ortalama Sipariş Değeri</p>
            <ChangeBadge change={avgOrderValue.change} />
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">
            {formatTL(avgOrderValue.allTime)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Bu ay {formatTL(avgOrderValue.currentMonth)} · geçen ay{" "}
            {formatTL(avgOrderValue.lastMonth)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Yalnızca ödenmiş {orders.paid} sipariş üzerinden
          </p>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Ödenmiş Sipariş Oranı</p>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">{rates.paidRate}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full dark:bg-dark-3">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${rates.paidRate}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {orders.paid} / {orders.total} sipariş ödendi
          </p>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Sipariş İptal Oranı</p>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">
            {rates.cancellationRate}%
          </p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full dark:bg-dark-3">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-500"
              style={{ width: `${rates.cancellationRate}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {orders.cancelled} / {orders.total} sipariş iptal edildi
          </p>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Bu Ay Ciro</p>
            <ChangeBadge change={revenue.change} />
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">
            {formatTL(revenue.currentMonth)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Geçen ay: {formatTL(revenue.lastMonth)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Tüm zamanlar: {formatTL(revenue.paidAllTime)}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Status Distribution */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m4 10V11m4 6V9M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Sipariş Durumu Dağılımı
          </h2>

          {statusDistribution.length === 0 ? (
            <p className="py-8 text-center text-gray-500">Henüz sipariş yok</p>
          ) : (
            <div className="space-y-4">
              {statusDistribution.map((item) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-dark dark:text-white">
                      {item.count} sipariş ({item.percent}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-dark-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        STATUS_BAR_COLORS[item.status] ?? "bg-gray-400"
                      }`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            En Çok Satılan Ürünler
          </h2>

          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Henüz sipariş verisi yok</p>
              </div>
            ) : (
              topProducts.slice(0, 5).map((product, idx) => (
                <div key={product.id ?? idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex items-center justify-center w-8 h-8 shrink-0 text-lg font-bold text-gray-300 bg-gray-100 dark:bg-dark-3 rounded-lg">
                      {idx + 1}
                    </span>
                    {product.thumbnail ? (
                      <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-3">
                        <Image
                          src={product.thumbnail}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-100 dark:bg-dark-3 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="block text-dark dark:text-white font-medium text-sm line-clamp-1">
                        {product.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTL(product.price)} · {product.orderCount} siparişte
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block w-20 h-2 bg-gray-200 rounded-full dark:bg-dark-3">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(product.quantitySold / maxQuantitySold) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-dark dark:text-white w-16 text-right">
                      {product.quantitySold} adet
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cart + time based stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cart status */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Kayıtlı Sepetler
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 dark:bg-dark-3 p-4">
              <p className="text-sm text-gray-500">Aktif sepet</p>
              <p className="mt-1 text-2xl font-bold text-dark dark:text-white">
                {carts.active}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Son {carts.thresholdDays} gün içinde güncellendi
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-dark-3 p-4">
              <p className="text-sm text-gray-500">Terk edilmiş sepet</p>
              <p className="mt-1 text-2xl font-bold text-dark dark:text-white">
                {carts.abandoned}
              </p>
              <Link
                href="/marketing/abandoned-carts"
                className="mt-1 inline-block text-xs text-primary hover:underline"
              >
                Listeyi aç →
              </Link>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Sepetler yalnızca giriş yapmış kullanıcılar için sunucuya kaydediliyor.
            Misafir sepetleri tarayıcıda kaldığı için bu sayılara girmiyor.
          </p>
        </div>

        {/* Time based order counts */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Dönem Bazlı Siparişler
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Bugün", value: timeStats.todayOrders },
              { label: "Son 7 gün", value: timeStats.weekOrders },
              { label: "Bu ay", value: timeStats.monthOrders },
              { label: "Toplam", value: timeStats.totalOrders },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-gray-50 dark:bg-dark-3 p-4">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-dark dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What is not measured */}
      <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Bu sayfada henüz olmayan metrikler
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              Ürün görüntüleme sayısı, sepete ekleme oranı, ödeme başlatma sayısı,
              cihaz kırılımı, terk edilme sebepleri ve saat bazlı yoğunluk
              ölçülmüyor. Bunlar için ziyaretçi olaylarını veritabanına yazan bir
              takip altyapısı gerekiyor. Sepete ekleme olayı şu anda yalnızca
              Google Ads&apos;e gönderiliyor, veritabanına kaydedilmiyor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
