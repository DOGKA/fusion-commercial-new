"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, RefreshCw, Check, AlertCircle, Eye, EyeOff } from "lucide-react";

interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  ogImage: string | null;
  twitterHandle: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  facebookPixelId: string | null;
  gaPropertyId: string | null;
  gaServiceAccountEmail: string | null;
  gaServiceAccountKey: string | null;
  gscSiteUrl: string | null;
  gscServiceAccountEmail: string | null;
  gscServiceAccountKey: string | null;
  robotsTxt: string | null;
}

export default function SeoPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteTitle: "",
    siteDescription: "",
    keywords: "",
    ogImage: null,
    twitterHandle: null,
    googleAnalyticsId: null,
    googleTagManagerId: null,
    facebookPixelId: null,
    gaPropertyId: null,
    gaServiceAccountEmail: null,
    gaServiceAccountKey: null,
    gscSiteUrl: null,
    gscServiceAccountEmail: null,
    gscServiceAccountKey: null,
    robotsTxt: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showServiceKey, setShowServiceKey] = useState(false);

  // Varsayılan değerler (veritabanında yoksa bunlar gösterilir)
  const defaultValues = {
    siteTitle: "FusionMarkt - Güç İstasyonları ve Solar Paneller",
    siteDescription: "Türkiye'nin en kapsamlı taşınabilir güç çözümleri mağazası. POWERTECH, EcoFlow ve daha fazlası.",
    keywords: "güç istasyonu, solar panel, taşınabilir enerji, kamp ekipmanları, powerstation",
    ogImage: "https://fusionmarkt.com/og-image.jpg",
    twitterHandle: "@fusionmarkt",
    googleAnalyticsId: "G-1YH2BWBZTQ",
    googleTagManagerId: "GTM-P92SX9GL",
    facebookPixelId: "",
    gaPropertyId: "504466773",
    gaServiceAccountEmail: "fusionmarkt-analytics@fusionmarkt-new.iam.gserviceaccount.com",
    gaServiceAccountKey: "", // Private Key admin panelden girilecek - güvenlik için koda eklenmez!
    gscSiteUrl: "https://fusionmarkt.com",
    gscServiceAccountEmail: "", // GA ile aynı olabilir
    gscServiceAccountKey: "", // GA ile aynı olabilir
    robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout/\nDisallow: /hesabim/\nSitemap: https://fusionmarkt.com/sitemap.xml",
  };

  // Ayarları yükle
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          siteTitle: data.siteTitle || defaultValues.siteTitle,
          siteDescription: data.siteDescription || defaultValues.siteDescription,
          keywords: data.keywords || defaultValues.keywords,
          ogImage: data.ogImage || defaultValues.ogImage,
          twitterHandle: data.twitterHandle || defaultValues.twitterHandle,
          googleAnalyticsId: data.googleAnalyticsId || defaultValues.googleAnalyticsId,
          googleTagManagerId: data.googleTagManagerId || defaultValues.googleTagManagerId,
          facebookPixelId: data.facebookPixelId || defaultValues.facebookPixelId,
          gaPropertyId: data.gaPropertyId || defaultValues.gaPropertyId,
          gaServiceAccountEmail: data.gaServiceAccountEmail || defaultValues.gaServiceAccountEmail,
          gaServiceAccountKey: data.gaServiceAccountKey || defaultValues.gaServiceAccountKey,
          gscSiteUrl: data.gscSiteUrl || defaultValues.gscSiteUrl,
          gscServiceAccountEmail: data.gscServiceAccountEmail || defaultValues.gscServiceAccountEmail,
          gscServiceAccountKey: data.gscServiceAccountKey || defaultValues.gscServiceAccountKey,
          robotsTxt: data.robotsTxt || defaultValues.robotsTxt,
        });
      } else {
        // API çalışmıyorsa varsayılan değerleri kullan
        setSettings(defaultValues);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Hata durumunda varsayılan değerleri kullan
      setSettings(defaultValues);
      setMessage({ type: "error", text: "Ayarlar yüklenemedi, varsayılan değerler gösteriliyor" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Kaydet
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Ayarlar başarıyla kaydedildi!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Kayıt başarısız" });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Bir hata oluştu" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            SEO Ayarları
          </h1>
          <p className="text-gray-500">
            Arama motoru optimizasyonu ve analitik ayarlarını yönetin
          </p>
        </div>

      </div>

      {/* Toast Mesaj - Sabit pozisyon */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-6 py-4 rounded-xl shadow-lg animate-pulse ${
            message.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Meta Tags */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">
            Meta Etiketleri
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Site Başlığı
              </label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) =>
                  setSettings({ ...settings, siteTitle: e.target.value })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
              />
              <p className="mt-1 text-xs text-gray-500">
                {settings.siteTitle.length}/60 karakter
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Site Açıklaması
              </label>
              <textarea
                rows={3}
                value={settings.siteDescription}
                onChange={(e) =>
                  setSettings({ ...settings, siteDescription: e.target.value })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
              />
              <p className="mt-1 text-xs text-gray-500">
                {settings.siteDescription.length}/160 karakter
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Anahtar Kelimeler
              </label>
              <input
                type="text"
                value={settings.keywords}
                onChange={(e) =>
                  setSettings({ ...settings, keywords: e.target.value })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="virgülle ayırın"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">
            Sosyal Medya
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                OG Image URL
              </label>
              <input
                type="text"
                value={settings.ogImage || ""}
                onChange={(e) =>
                  setSettings({ ...settings, ogImage: e.target.value })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="https://example.com/og-image.jpg"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Twitter Handle
              </label>
              <input
                type="text"
                value={settings.twitterHandle || ""}
                onChange={(e) =>
                  setSettings({ ...settings, twitterHandle: e.target.value })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="@fusionmarkt"
              />
            </div>
          </div>
        </div>

        {/* Analytics & Tracking */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              Analitik & Takip
            </h2>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Aktif
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Google Analytics 4 - Ölçüm Kimliği
              </label>
              <input
                type="text"
                value={settings.googleAnalyticsId || ""}
                onChange={(e) =>
                  setSettings({ ...settings, googleAnalyticsId: e.target.value })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="G-XXXXXXXXXX"
              />
              <p className="mt-1 text-xs text-gray-500">
                Akış: fusionmarkt.com • Akış Kimliği: 12140158071
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Google Tag Manager ID
              </label>
              <input
                type="text"
                value={settings.googleTagManagerId || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    googleTagManagerId: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="GTM-XXXXXXX"
              />
              <p className="mt-1 text-xs text-gray-500">
                Kapsayıcı: Web • Çalışma Alanı: Default Workspace
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Facebook Pixel ID
              </label>
              <input
                type="text"
                value={settings.facebookPixelId || ""}
                onChange={(e) =>
                  setSettings({ ...settings, facebookPixelId: e.target.value })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="123456789012345"
              />
              <p className="mt-1 text-xs text-gray-500">
                Meta Business Suite {">"} Events Manager {">"} Pixel ID
              </p>
            </div>
          </div>

          {/* Bilgi Kutusu */}
          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>💡 Bilgi:</strong> Bu tracking kodları otomatik olarak sitenize eklenir. 
              Kullanıcının çerez onayına göre aktif olurlar. 
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                Google Analytics Dashboard →
              </a>
            </p>
          </div>
        </div>

        {/* Google Analytics Data API (Dashboard için) */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-2 text-lg font-semibold text-dark dark:text-white">
            Analytics Dashboard API
          </h2>
          <p className="mb-6 text-xs text-gray-500">
            Admin panelde analiz görüntülemek için (opsiyonel)
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                GA4 Property ID
              </label>
              <input
                type="text"
                value={settings.gaPropertyId || ""}
                onChange={(e) =>
                  setSettings({ ...settings, gaPropertyId: e.target.value })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="123456789"
              />
              <p className="mt-1 text-xs text-gray-500">
                GA4 {">"} Admin {">"} Property Settings {">"} Property ID
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Service Account Email
              </label>
              <input
                type="email"
                value={settings.gaServiceAccountEmail || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    gaServiceAccountEmail: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="analytics@project.iam.gserviceaccount.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Service Account Private Key (JSON)
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={settings.gaServiceAccountKey || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      gaServiceAccountKey: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 pr-10 font-mono text-xs dark:border-dark-3"
                  placeholder='{"type": "service_account", "private_key": "..."}'
                  style={
                    showServiceKey
                      ? {}
                      : ({ WebkitTextSecurity: "disc" } as React.CSSProperties)
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowServiceKey(!showServiceKey)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showServiceKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Google Cloud Console {">"} Service Account {">"} Keys {">"} JSON
              </p>
            </div>
          </div>
        </div>

        {/* Google Search Console API */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              Google Search Console API
            </h2>
            {settings.gscSiteUrl && (settings.gscServiceAccountEmail || settings.gaServiceAccountEmail) ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Bağlı
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-medium">
                Yapılandırılmadı
              </span>
            )}
          </div>
          <p className="mb-6 text-xs text-gray-500">
            SEO performans verileri için (arama sorguları, gösterimler, tıklamalar)
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Site URL
              </label>
              <input
                type="text"
                value={settings.gscSiteUrl || ""}
                onChange={(e) =>
                  setSettings({ ...settings, gscSiteUrl: e.target.value })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="https://fusionmarkt.com veya sc-domain:fusionmarkt.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                Search Console {">"} Ayarlar {">"} Mülk Ayarları {">"} Site URL
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Service Account Email (opsiyonel)
              </label>
              <input
                type="email"
                value={settings.gscServiceAccountEmail || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    gscServiceAccountEmail: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="GA ile aynı ise boş bırakın"
              />
              <p className="mt-1 text-xs text-gray-500">
                GA Service Account ile aynı ise boş bırakabilirsiniz
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Service Account Private Key (opsiyonel)
              </label>
              <textarea
                rows={2}
                value={settings.gscServiceAccountKey || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    gscServiceAccountKey: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-mono text-xs dark:border-dark-3"
                placeholder="GA ile aynı ise boş bırakın"
                style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
              />
              <p className="mt-1 text-xs text-gray-500">
                GA Private Key ile aynı ise boş bırakabilirsiniz
              </p>
            </div>

            {/* GSC Bilgi Kutusu */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>⚠️ Önemli:</strong> Service Account'u Search Console'a "Tam" yetkili kullanıcı olarak eklemeniz gerekiyor.
                <br />
                Search Console {">"} Ayarlar {">"} Kullanıcılar ve izinler {">"} Kullanıcı ekle {">"} Service Account Email
              </p>
            </div>
          </div>
        </div>

        {/* Robots.txt */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark lg:col-span-2">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">
            Robots.txt
          </h2>

          <textarea
            rows={8}
            value={settings.robotsTxt || ""}
            onChange={(e) =>
              setSettings({ ...settings, robotsTxt: e.target.value })
            }
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-mono text-sm dark:border-dark-3"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">
          Google Önizleme
        </h2>

        <div className="max-w-xl">
          <p className="text-blue-600 text-lg hover:underline cursor-pointer">
            {settings.siteTitle || "Site Başlığı"}
          </p>
          <p className="text-green-700 text-sm">https://fusionmarkt.com</p>
          <p className="text-gray-600 text-sm">
            {settings.siteDescription || "Site açıklaması..."}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-stroke px-6 py-3 dark:border-dark-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
