"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Eye,
  Clock,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  AlertCircle,
  ExternalLink,
  Search,
  MousePointer,
  TrendingUp,
  Hash,
  Ticket,
  Percent,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

interface GAData {
  visitors: number;
  pageViews: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  deviceBreakdown: { device: string; sessions: number; percentage: number }[];
  topPages: { page: string; views: number; users: number }[];
  trafficSources: { source: string; sessions: number; users: number; percentage: number }[];
}

interface GSCData {
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  topQueries: { query: string; impressions: number; clicks: number; ctr: number; position: number }[];
  topPages: { page: string; impressions: number; clicks: number; ctr: number; position: number }[];
}

interface CouponStats {
  activeCoupons: number;
  totalUsage: number;
  ordersWithCoupon: number;
  totalDiscount: number;
  topCoupons: {
    id: string;
    code: string;
    description: string | null;
    type: string;
    value: number;
    usageCount: number;
    usageLimit: number | null;
    isActive: boolean;
    isExpired: boolean;
  }[];
}

interface AnalyticsData {
  gaConnected: boolean;
  gscConnected: boolean;
  visitors?: number;
  pageViews?: number;
  sessions?: number;
  avgSessionDuration?: number;
  bounceRate?: number;
  deviceBreakdown?: GAData["deviceBreakdown"];
  topPages?: GAData["topPages"];
  trafficSources?: GAData["trafficSources"];
  gscData?: GSCData | null;
  couponStats: CouponStats;
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("tr-TR").format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}dk ${secs}sn`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-5 h-5" />;
      case "desktop":
        return <Monitor className="w-5 h-5" />;
      case "tablet":
        return <Tablet className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const getDeviceName = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return "Mobil";
      case "desktop":
        return "Masaüstü";
      case "tablet":
        return "Tablet";
      default:
        return device;
    }
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      "Organic Search": "bg-green-500",
      "Direct": "bg-blue-500",
      "Organic Social": "bg-pink-500",
      "Referral": "bg-purple-500",
      "Email": "bg-amber-500",
      "Paid Search": "bg-red-500",
      "Paid Social": "bg-orange-500",
      "Display": "bg-cyan-500",
    };
    return colors[source] || "bg-gray-500";
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
          <p className="text-gray-500">Google Analytics, Search Console ve Kupon İstatistikleri</p>
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

      {/* ==================== GOOGLE ANALYTICS SECTION ==================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-dark dark:text-white">Google Analytics</h2>
          {data?.gaConnected && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Bağlı
            </span>
          )}
        </div>

        {data?.gaConnected ? (
          <>
            {/* GA Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ziyaretçi */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
                  <div>
                    <p className="text-sm text-gray-500">Ziyaretçi</p>
          <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {formatNumber(data?.visitors || 0)}
          </h3>
                  </div>
                </div>
        </div>

        {/* Sayfa Görüntüleme */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
                  <div>
                    <p className="text-sm text-gray-500">Sayfa Görüntüleme</p>
          <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {formatNumber(data?.pageViews || 0)}
          </h3>
                  </div>
        </div>
      </div>

              {/* Ort. Oturum Süresi */}
              <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
                  <div>
                    <p className="text-sm text-gray-500">Ort. Oturum Süresi</p>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {formatDuration(data?.avgSessionDuration || 0)}
              </h3>
            </div>
          </div>
        </div>

              {/* Bounce Rate */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hemen Çıkma Oranı</p>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      %{(data?.bounceRate || 0).toFixed(1)}
                    </h3>
          </div>
            </div>
          </div>
        </div>

            {/* Device & Traffic Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cihaz Dağılımı */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <h3 className="text-base font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
              Cihaz Dağılımı
                </h3>
                {data?.deviceBreakdown && data.deviceBreakdown.length > 0 ? (
            <div className="space-y-4">
              {data.deviceBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                          {getDeviceIcon(item.device)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-dark dark:text-white">
                              {getDeviceName(item.device)}
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
                  <p className="text-sm text-gray-400">Veri bulunamadı</p>
                )}
              </div>

              {/* Trafik Kaynakları */}
              <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <h3 className="text-base font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Trafik Kaynakları
                </h3>
                {data?.trafficSources && data.trafficSources.length > 0 ? (
                  <div className="space-y-3">
                    {data.trafficSources.slice(0, 6).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getSourceColor(item.source)}`} />
                          <span className="text-sm text-dark dark:text-white">{item.source}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{formatNumber(item.sessions)} oturum</span>
                          <span className="text-sm font-medium text-dark dark:text-white">%{item.percentage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Veri bulunamadı</p>
                )}
              </div>
            </div>

            {/* Top Pages */}
            <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
              <h3 className="text-base font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                En Çok Ziyaret Edilen Sayfalar
              </h3>
              {data?.topPages && data.topPages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stroke dark:border-dark-3">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Sayfa</th>
                        <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">Görüntüleme</th>
                        <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">Kullanıcı</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topPages.map((page, index) => (
                        <tr key={index} className="border-b border-stroke dark:border-dark-3 last:border-0">
                          <td className="py-3 px-4">
                            <span className="text-sm text-dark dark:text-white font-mono">{page.page}</span>
                          </td>
                          <td className="py-3 px-4 text-right text-sm text-gray-500">{formatNumber(page.views)}</td>
                          <td className="py-3 px-4 text-right text-sm text-gray-500">{formatNumber(page.users)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Veri bulunamadı</p>
              )}
            </div>
          </>
        ) : (
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
                  Ziyaretçi ve sayfa görüntüleme verilerini görmek için SEO Ayarları sayfasından Google Analytics Data API yapılandırın.
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
      </div>

      {/* ==================== GOOGLE SEARCH CONSOLE SECTION ==================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-dark dark:text-white">Google Search Console (SEO)</h2>
          {data?.gscConnected && data?.gscData && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Bağlı
            </span>
          )}
        </div>

        {data?.gscConnected && data?.gscData ? (
          <>
            {/* GSC Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gösterim */}
              <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gösterim</p>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {formatNumber(data.gscData.impressions)}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Tıklama */}
              <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <MousePointer className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tıklama</p>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {formatNumber(data.gscData.clicks)}
                    </h3>
                  </div>
                </div>
              </div>

              {/* CTR */}
              <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                    <Percent className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tıklama Oranı (CTR)</p>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      %{data.gscData.ctr}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Pozisyon */}
              <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Hash className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ort. Pozisyon</p>
                    <h3 className="text-2xl font-bold text-dark dark:text-white">
                      {data.gscData.position}
                    </h3>
                  </div>
                </div>
        </div>
      </div>

            {/* Top Queries & Pages Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Arama Sorguları */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <h3 className="text-base font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  En Çok Aranan Sorgular
                </h3>
                {data.gscData.topQueries && data.gscData.topQueries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-stroke dark:border-dark-3">
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Sorgu</th>
                          <th className="py-2 px-2 text-right text-xs font-medium text-gray-500">Gösterim</th>
                          <th className="py-2 px-2 text-right text-xs font-medium text-gray-500">Tıklama</th>
                          <th className="py-2 px-2 text-right text-xs font-medium text-gray-500">Poz.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.gscData.topQueries.slice(0, 8).map((item, index) => (
                          <tr key={index} className="border-b border-stroke dark:border-dark-3 last:border-0">
                            <td className="py-2 px-2 text-sm text-dark dark:text-white truncate max-w-[200px]">{item.query}</td>
                            <td className="py-2 px-2 text-right text-sm text-gray-500">{formatNumber(item.impressions)}</td>
                            <td className="py-2 px-2 text-right text-sm text-gray-500">{formatNumber(item.clicks)}</td>
                            <td className="py-2 px-2 text-right text-sm text-gray-500">{item.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Veri bulunamadı</p>
                )}
        </div>

              {/* Top SEO Sayfaları */}
              <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
                <h3 className="text-base font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                  En İyi Performans Gösteren Sayfalar
                </h3>
                {data.gscData.topPages && data.gscData.topPages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-dark-3">
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Sayfa</th>
                          <th className="py-2 px-2 text-right text-xs font-medium text-gray-500">Tıklama</th>
                          <th className="py-2 px-2 text-right text-xs font-medium text-gray-500">CTR</th>
                          <th className="py-2 px-2 text-right text-xs font-medium text-gray-500">Poz.</th>
                </tr>
              </thead>
              <tbody>
                        {data.gscData.topPages.slice(0, 8).map((item, index) => (
                          <tr key={index} className="border-b border-stroke dark:border-dark-3 last:border-0">
                            <td className="py-2 px-2 text-sm text-dark dark:text-white font-mono truncate max-w-[200px]">{item.page || "/"}</td>
                            <td className="py-2 px-2 text-right text-sm text-gray-500">{formatNumber(item.clicks)}</td>
                            <td className="py-2 px-2 text-right text-sm text-gray-500">%{item.ctr}</td>
                            <td className="py-2 px-2 text-right text-sm text-gray-500">{item.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
                  <p className="text-sm text-gray-400">Veri bulunamadı</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-dark dark:text-white mb-1">
                  Google Search Console Bağlı Değil
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  SEO performans verilerini (arama sorguları, gösterimler, tıklamalar) görmek için SEO Ayarları sayfasından Google Search Console API yapılandırın.
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
      </div>

      {/* ==================== COUPON STATISTICS SECTION ==================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-dark dark:text-white">Kupon İstatistikleri</h2>
        </div>

        {/* Coupon Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Aktif Kuponlar */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktif Kuponlar</p>
                <h3 className="text-2xl font-bold text-dark dark:text-white">
                  {data?.couponStats?.activeCoupons || 0}
                </h3>
              </div>
            </div>
          </div>

          {/* Toplam Kullanım */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Kullanım</p>
                <h3 className="text-2xl font-bold text-dark dark:text-white">
                  {formatNumber(data?.couponStats?.totalUsage || 0)}
                </h3>
              </div>
            </div>
          </div>

          {/* Kuponlu Siparişler */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Hash className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kuponlu Siparişler</p>
                <h3 className="text-2xl font-bold text-dark dark:text-white">
                  {formatNumber(data?.couponStats?.ordersWithCoupon || 0)}
                </h3>
              </div>
            </div>
          </div>

          {/* Toplam İndirim */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Percent className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
                <p className="text-sm text-gray-500">Toplam İndirim</p>
                <h3 className="text-2xl font-bold text-dark dark:text-white">
                  {formatCurrency(data?.couponStats?.totalDiscount || 0)}
            </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Top Coupons Table */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h3 className="text-base font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            En Çok Kullanılan Kuponlar
          </h3>
          {data?.couponStats?.topCoupons && data.couponStats.topCoupons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stroke dark:border-dark-3">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Kupon Kodu</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">İndirim</th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">Kullanım</th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">Limit</th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-gray-500">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {data.couponStats.topCoupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-stroke dark:border-dark-3 last:border-0">
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-sm font-mono font-semibold text-dark dark:text-white">{coupon.code}</span>
                          {coupon.description && (
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{coupon.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-dark dark:text-white">
                          {coupon.type === "PERCENTAGE" ? `%${coupon.value}` : formatCurrency(coupon.value)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm font-medium text-dark dark:text-white">{coupon.usageCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm text-gray-500">{coupon.usageLimit || "∞"}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {coupon.isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
                            <XCircle className="w-3 h-3" />
                            Süresi Doldu
                          </span>
                        ) : coupon.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs">
                            <XCircle className="w-3 h-3" />
                            Pasif
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">Henüz kupon kullanımı yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
