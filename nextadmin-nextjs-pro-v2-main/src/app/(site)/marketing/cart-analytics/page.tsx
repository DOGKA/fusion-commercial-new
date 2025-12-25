import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sepet Analizleri",
};

export default function CartAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Sepet Analizleri</h1>
        <p className="text-gray-500">Sepet performansını ve dönüşüm oranlarını analiz edin</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Sepete Ekleme Oranı</p>
            <span className="text-xs text-green-500 bg-green-100 px-2 py-1 rounded dark:bg-green-500/10">+5.2%</span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">24.5%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full dark:bg-dark-3">
            <div className="h-full w-[24.5%] bg-primary rounded-full"></div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Satın Alma Oranı</p>
            <span className="text-xs text-green-500 bg-green-100 px-2 py-1 rounded dark:bg-green-500/10">+2.1%</span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">68.3%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full dark:bg-dark-3">
            <div className="h-full w-[68.3%] bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Sepet Terk Oranı</p>
            <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded dark:bg-red-500/10">-1.3%</span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">31.7%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full dark:bg-dark-3">
            <div className="h-full w-[31.7%] bg-red-500 rounded-full"></div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Ortalama Sepet Değeri</p>
            <span className="text-xs text-green-500 bg-green-100 px-2 py-1 rounded dark:bg-green-500/10">+8.4%</span>
          </div>
          <p className="text-3xl font-bold text-dark dark:text-white">4,250 ₺</p>
          <p className="mt-2 text-sm text-gray-500">Geçen ay: 3,920 ₺</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Dönüşüm Hunisi</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ürün Görüntüleme</span>
                <span className="text-sm font-medium text-dark dark:text-white">12,450</span>
              </div>
              <div className="h-8 bg-blue-500 rounded"></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sepete Ekleme</span>
                <span className="text-sm font-medium text-dark dark:text-white">3,050 (24.5%)</span>
              </div>
              <div className="h-8 bg-blue-400 rounded" style={{ width: "60%" }}></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ödeme Başlatma</span>
                <span className="text-sm font-medium text-dark dark:text-white">2,280 (74.7%)</span>
              </div>
              <div className="h-8 bg-blue-300 rounded" style={{ width: "45%" }}></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Satın Alma</span>
                <span className="text-sm font-medium text-dark dark:text-white">2,083 (91.4%)</span>
              </div>
              <div className="h-8 bg-green-500 rounded" style={{ width: "40%" }}></div>
            </div>
          </div>
        </div>

        {/* Top Products in Cart */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">En Çok Sepete Eklenen</h2>
          
          <div className="space-y-4">
            {[
              { name: "POWERTECH PRO 3600W", count: 245, conversion: 78 },
              { name: "POWERTECH Solar Panel 200W", count: 189, conversion: 65 },
              { name: "EcoFlow Delta 2 Max", count: 156, conversion: 82 },
              { name: "Kamp Çadırı 4 Kişilik", count: 134, conversion: 71 },
              { name: "POWERTECH AC Şarj Kablosu", count: 98, conversion: 89 },
            ].map((product, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-300">{idx + 1}</span>
                  <span className="text-dark dark:text-white">{product.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{product.count} ekleme</span>
                  <span className={`text-sm font-medium ${product.conversion >= 80 ? "text-green-500" : product.conversion >= 70 ? "text-yellow-500" : "text-red-500"}`}>
                    %{product.conversion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cart by Device */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Cihaz Dağılımı</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-dark dark:text-white">Mobil</span>
              </div>
              <span className="font-medium text-dark dark:text-white">62%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-dark dark:text-white">Masaüstü</span>
              </div>
              <span className="font-medium text-dark dark:text-white">32%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-dark dark:text-white">Tablet</span>
              </div>
              <span className="font-medium text-dark dark:text-white">6%</span>
            </div>
          </div>
        </div>

        {/* Abandonment Reasons */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Terk Edilme Sebepleri</h2>
          
          <div className="space-y-3">
            {[
              { reason: "Kargo ücreti yüksek", percent: 35 },
              { reason: "Sadece bakıyordum", percent: 28 },
              { reason: "Fiyat karşılaştırma", percent: 18 },
              { reason: "Ödeme problemi", percent: 12 },
              { reason: "Diğer", percent: 7 },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.reason}</span>
                  <span className="text-sm font-medium text-dark dark:text-white">%{item.percent}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-dark-3">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Yoğun Saatler</h2>
          
          <div className="space-y-2">
            {[
              { hour: "10:00 - 12:00", value: 85 },
              { hour: "14:00 - 16:00", value: 72 },
              { hour: "20:00 - 22:00", value: 95 },
              { hour: "18:00 - 20:00", value: 68 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-24">{item.hour}</span>
                <div className="flex-1 h-6 bg-gray-200 rounded dark:bg-dark-3">
                  <div 
                    className={`h-full rounded ${item.value >= 90 ? "bg-green-500" : item.value >= 70 ? "bg-blue-500" : "bg-yellow-500"}`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8 text-dark dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
