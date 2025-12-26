"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface CartAnalyticsData {
  stats: {
    addToCartRate: { value: number; change: number };
    purchaseRate: { value: number; change: number };
    abandonmentRate: { value: number; change: number };
    avgCartValue: { value: number; lastMonth: number; change: number };
  };
  funnel: {
    productViews: number;
    addedToCart: number;
    checkoutStarted: number;
    purchased: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    thumbnail: string | null;
    price: number;
    count: number;
    orderCount: number;
    conversionRate: number;
  }>;
  timeStats: {
    todayOrders: number;
    weekOrders: number;
    monthOrders: number;
    totalOrders: number;
  };
  deviceDistribution: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  abandonmentReasons: Array<{ reason: string; percent: number }>;
  peakHours: Array<{ hour: string; value: number }>;
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

  const { stats, funnel, topProducts, deviceDistribution, abandonmentReasons, peakHours } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Sepet Analizleri</h1>
          <p className="text-gray-500">Sepet performansını ve dönüşüm oranlarını analiz edin</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Canlı Veri
          </span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Sepete Ekleme Oranı</p>
            <span className={`text-xs px-2 py-1 rounded ${
              stats.addToCartRate.change >= 0 
                ? "text-green-500 bg-green-100 dark:bg-green-500/10" 
                : "text-red-500 bg-red-100 dark:bg-red-500/10"
            }`}>
              {stats.addToCartRate.change >= 0 ? "+" : ""}{stats.addToCartRate.change}%
            </span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">{stats.addToCartRate.value}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full dark:bg-dark-3">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${stats.addToCartRate.value}%` }}
            ></div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Satın Alma Oranı</p>
            <span className={`text-xs px-2 py-1 rounded ${
              stats.purchaseRate.change >= 0 
                ? "text-green-500 bg-green-100 dark:bg-green-500/10" 
                : "text-red-500 bg-red-100 dark:bg-red-500/10"
            }`}>
              {stats.purchaseRate.change >= 0 ? "+" : ""}{stats.purchaseRate.change}%
            </span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">{stats.purchaseRate.value}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full dark:bg-dark-3">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500" 
              style={{ width: `${stats.purchaseRate.value}%` }}
            ></div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Sepet Terk Oranı</p>
            <span className={`text-xs px-2 py-1 rounded ${
              stats.abandonmentRate.change <= 0 
                ? "text-green-500 bg-green-100 dark:bg-green-500/10" 
                : "text-red-500 bg-red-100 dark:bg-red-500/10"
            }`}>
              {stats.abandonmentRate.change >= 0 ? "+" : ""}{stats.abandonmentRate.change}%
            </span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">{stats.abandonmentRate.value}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full dark:bg-dark-3">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-500" 
              style={{ width: `${stats.abandonmentRate.value}%` }}
            ></div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Ortalama Sepet Değeri</p>
            <span className={`text-xs px-2 py-1 rounded ${
              stats.avgCartValue.change >= 0 
                ? "text-green-500 bg-green-100 dark:bg-green-500/10" 
                : "text-red-500 bg-red-100 dark:bg-red-500/10"
            }`}>
              {stats.avgCartValue.change >= 0 ? "+" : ""}{stats.avgCartValue.change}%
            </span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">
            {stats.avgCartValue.value.toLocaleString("tr-TR")} ₺
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Geçen ay: {stats.avgCartValue.lastMonth.toLocaleString("tr-TR")} ₺
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Dönüşüm Hunisi
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ürün Görüntüleme</span>
                <span className="text-sm font-medium text-dark dark:text-white">
                  {funnel.productViews.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="h-8 bg-blue-500 rounded"></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sepete Ekleme</span>
                <span className="text-sm font-medium text-dark dark:text-white">
                  {funnel.addedToCart.toLocaleString("tr-TR")} ({Math.round((funnel.addedToCart / funnel.productViews) * 100)}%)
                </span>
              </div>
              <div 
                className="h-8 bg-blue-400 rounded" 
                style={{ width: `${(funnel.addedToCart / funnel.productViews) * 100}%` }}
              ></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ödeme Başlatma</span>
                <span className="text-sm font-medium text-dark dark:text-white">
                  {funnel.checkoutStarted.toLocaleString("tr-TR")} ({Math.round((funnel.checkoutStarted / funnel.addedToCart) * 100)}%)
                </span>
              </div>
              <div 
                className="h-8 bg-blue-300 rounded" 
                style={{ width: `${(funnel.checkoutStarted / funnel.productViews) * 100}%` }}
              ></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Satın Alma</span>
                <span className="text-sm font-medium text-dark dark:text-white">
                  {funnel.purchased.toLocaleString("tr-TR")} ({Math.round((funnel.purchased / funnel.checkoutStarted) * 100)}%)
                </span>
              </div>
              <div 
                className="h-8 bg-green-500 rounded" 
                style={{ width: `${(funnel.purchased / funnel.productViews) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Top Products in Cart */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            En Çok Satın Alınan Ürünler
          </h2>
          
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>Henüz sipariş verisi yok</p>
              </div>
            ) : (
              topProducts.slice(0, 5).map((product, idx) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 text-lg font-bold text-gray-300 bg-gray-100 dark:bg-dark-3 rounded-lg">
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      {product.thumbnail ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-3">
                          <Image 
                            src={product.thumbnail} 
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-3 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <span className="text-dark dark:text-white font-medium text-sm line-clamp-1">
                          {product.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.price.toLocaleString("tr-TR")} ₺
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{product.count} adet</span>
                    <span className={`text-sm font-medium ${
                      product.conversionRate >= 80 ? "text-green-500" : 
                      product.conversionRate >= 70 ? "text-yellow-500" : "text-red-500"
                    }`}>
                      %{product.conversionRate}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cart by Device */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Cihaz Dağılımı
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-dark dark:text-white">Mobil</span>
              </div>
              <span className="font-medium text-dark dark:text-white">{deviceDistribution.mobile}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-dark dark:text-white">Masaüstü</span>
              </div>
              <span className="font-medium text-dark dark:text-white">{deviceDistribution.desktop}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-dark dark:text-white">Tablet</span>
              </div>
              <span className="font-medium text-dark dark:text-white">{deviceDistribution.tablet}%</span>
            </div>
          </div>
        </div>

        {/* Abandonment Reasons */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Terk Edilme Sebepleri
          </h2>
          
          <div className="space-y-3">
            {abandonmentReasons.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.reason}</span>
                  <span className="text-sm font-medium text-dark dark:text-white">%{item.percent}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-dark-3">
                  <div 
                    className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500" 
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Yoğun Saatler
          </h2>
          
          <div className="space-y-2">
            {peakHours.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-24">{item.hour}</span>
                <div className="flex-1 h-6 bg-gray-200 rounded dark:bg-dark-3">
                  <div 
                    className={`h-full rounded transition-all duration-500 ${
                      item.value >= 90 ? "bg-green-500" : 
                      item.value >= 70 ? "bg-blue-500" : "bg-yellow-500"
                    }`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8 text-dark dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Veriler Hakkında
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Bu veriler sipariş ve ürün bilgilerine dayanmaktadır. Daha detaylı analitik için 
              kullanıcı davranışı takibi (tracking) ve A/B test araçları entegre edilebilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
