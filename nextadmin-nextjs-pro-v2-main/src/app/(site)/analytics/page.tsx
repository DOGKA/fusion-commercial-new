"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Eye,
  Clock,
  RefreshCw,
  BarChart3,
  LineChart,
  PieChart,
  Globe,
  Smartphone,
  Monitor,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface AnalyticsData {
  // Sipariş verileri (veritabanından)
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  // Ziyaretçi verileri (GA Data API'den - eğer yapılandırılmışsa)
  gaConnected: boolean;
  visitors?: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  pageViews?: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  topPages?: { page: string; views: number }[];
  deviceBreakdown?: { device: string; percentage: number }[];
  trafficSources?: { source: string; sessions: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("tr-TR").format(value);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Analiz
          </h1>
          <p className="text-gray-500">Site ve satış performansınızı takip edin</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex rounded-lg border border-stroke dark:border-dark-3 overflow-hidden">
            {(["today", "week", "month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-gray-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {p === "today" ? "Bugün" : p === "week" ? "Bu Hafta" : "Bu Ay"}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke dark:border-dark-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Satış Metrikleri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Sipariş */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-dark dark:text-white">
            {formatNumber(
              period === "today"
                ? data?.ordersToday || 0
                : period === "week"
                ? data?.ordersThisWeek || 0
                : data?.ordersThisMonth || 0
            )}
          </h3>
          <p className="text-sm text-gray-500">Sipariş</p>
        </div>

        {/* Toplam Gelir */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              +8%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-dark dark:text-white">
            {formatCurrency(
              period === "today"
                ? data?.revenueToday || 0
                : period === "week"
                ? data?.revenueThisWeek || 0
                : data?.revenueThisMonth || 0
            )}
          </h3>
          <p className="text-sm text-gray-500">Gelir</p>
        </div>

        {/* Ziyaretçi */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            {data?.gaConnected ? (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                +15%
              </span>
            ) : (
              <span className="text-xs text-gray-400">GA Bağlı Değil</span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-dark dark:text-white">
            {data?.gaConnected
              ? formatNumber(
                  period === "today"
                    ? data?.visitors?.today || 0
                    : period === "week"
                    ? data?.visitors?.thisWeek || 0
                    : data?.visitors?.thisMonth || 0
                )
              : "-"}
          </h3>
          <p className="text-sm text-gray-500">Ziyaretçi</p>
        </div>

        {/* Sayfa Görüntüleme */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Eye className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            {data?.gaConnected ? (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                +10%
              </span>
            ) : (
              <span className="text-xs text-gray-400">GA Bağlı Değil</span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-dark dark:text-white">
            {data?.gaConnected
              ? formatNumber(
                  period === "today"
                    ? data?.pageViews?.today || 0
                    : period === "week"
                    ? data?.pageViews?.thisWeek || 0
                    : data?.pageViews?.thisMonth || 0
                )
              : "-"}
          </h3>
          <p className="text-sm text-gray-500">Sayfa Görüntüleme</p>
        </div>
      </div>

      {/* GA Bağlı Değil Uyarısı */}
      {!data?.gaConnected && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-dark dark:text-white mb-1">
                Google Analytics Bağlı Değil
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ziyaretçi ve sayfa görüntüleme verilerini görmek için SEO
                Ayarları sayfasından Google Analytics Data API yapılandırın.
              </p>
              <a
                href="/seo"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                SEO Ayarlarına Git
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Detaylı Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satış Grafiği Placeholder */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              Satış Trendi
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Grafik verisi yükleniyor...</p>
            </div>
          </div>
        </div>

        {/* Cihaz Dağılımı */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Cihaz Dağılımı
            </h2>
          </div>
          {data?.gaConnected && data?.deviceBreakdown ? (
            <div className="space-y-4">
              {data.deviceBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {item.device === "mobile" ? (
                      <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : item.device === "desktop" ? (
                      <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-dark dark:text-white capitalize">
                        {item.device === "mobile"
                          ? "Mobil"
                          : item.device === "desktop"
                          ? "Masaüstü"
                          : "Tablet"}
                      </span>
                      <span className="text-sm text-gray-500">
                        %{item.percentage}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {data?.gaConnected ? "Veri yükleniyor..." : "GA bağlantısı gerekli"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popüler Sayfalar */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            En Çok Ziyaret Edilen Sayfalar
          </h2>
        </div>
        {data?.gaConnected && data?.topPages ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                    Sayfa
                  </th>
                  <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                    Görüntüleme
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((page, index) => (
                  <tr
                    key={index}
                    className="border-b border-stroke dark:border-dark-3 last:border-0"
                  >
                    <td className="py-3 px-4 text-sm text-dark dark:text-white">
                      {page.page}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-500">
                      {formatNumber(page.views)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {data?.gaConnected ? "Veri yükleniyor..." : "GA bağlantısı gerekli"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Ortalama Sipariş Değeri */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Ortalama Sipariş Değeri</p>
            <h3 className="text-3xl font-bold text-dark dark:text-white">
              {formatCurrency(data?.averageOrderValue || 0)}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
