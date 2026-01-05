"use client";

import { useEffect, useState } from "react";

export default function CookiesPage() {
  const [settings, setSettings] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
    preferences: true,
    showBanner: true,
    bannerPosition: "bottom",
    bannerText: "Bu web sitesi deneyiminizi geliştirmek için çerezler kullanmaktadır.",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load persisted settings
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error("Ayarlar getirilemedi");
        const data = await res.json();

        if (!mounted) return;
        setSettings((prev) => ({
          ...prev,
          showBanner: data.cookieBannerEnabled ?? prev.showBanner,
          bannerPosition: data.cookieBannerPosition ?? prev.bannerPosition,
          bannerText: data.cookieBannerText ?? prev.bannerText,
          analytics: data.cookieDefaultAnalytics ?? prev.analytics,
          marketing: data.cookieDefaultMarketing ?? prev.marketing,
          preferences: data.cookieDefaultPreferences ?? prev.preferences,
        }));
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Beklenmeyen hata");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookieBannerEnabled: settings.showBanner,
          cookieBannerPosition: settings.bannerPosition,
          cookieBannerText: settings.bannerText,
          cookieDefaultAnalytics: settings.analytics,
          cookieDefaultMarketing: settings.marketing,
          cookieDefaultPreferences: settings.preferences,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Kaydetme başarısız");
      }
      setSuccess("Kaydedildi");
      setTimeout(() => setSuccess(null), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Beklenmeyen hata");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Çerez Ayarları</h1>
        <p className="text-gray-500">Çerez politikası ve izin yönetimi</p>
      </div>

      {loading && (
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark text-sm text-gray-500">
          Yükleniyor…
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cookie Types */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Çerez Türleri</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-stroke dark:border-dark-3">
              <div>
                <p className="font-medium text-dark dark:text-white">Zorunlu Çerezler</p>
                <p className="text-sm text-gray-500">Site için gerekli temel çerezler</p>
              </div>
              <input type="checkbox" checked={settings.necessary} disabled className="h-5 w-5 rounded" />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-stroke dark:border-dark-3">
              <div>
                <p className="font-medium text-dark dark:text-white">Analitik Çerezler</p>
                <p className="text-sm text-gray-500">Ziyaretçi istatistikleri için</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.analytics} 
                onChange={(e) => setSettings({...settings, analytics: e.target.checked})}
                className="h-5 w-5 rounded text-primary"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-stroke dark:border-dark-3">
              <div>
                <p className="font-medium text-dark dark:text-white">Pazarlama Çerezleri</p>
                <p className="text-sm text-gray-500">Kişiselleştirilmiş reklamlar için</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.marketing} 
                onChange={(e) => setSettings({...settings, marketing: e.target.checked})}
                className="h-5 w-5 rounded text-primary"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-stroke dark:border-dark-3">
              <div>
                <p className="font-medium text-dark dark:text-white">Tercih Çerezleri</p>
                <p className="text-sm text-gray-500">Kullanıcı tercihleri için</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.preferences} 
                onChange={(e) => setSettings({...settings, preferences: e.target.checked})}
                className="h-5 w-5 rounded text-primary"
              />
            </div>
          </div>
        </div>

        {/* Banner Settings */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Banner Ayarları</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark dark:text-white">Çerez Bannerını Göster</span>
              <input 
                type="checkbox" 
                checked={settings.showBanner} 
                onChange={(e) => setSettings({...settings, showBanner: e.target.checked})}
                className="h-5 w-5 rounded text-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Banner Konumu</label>
              <select 
                value={settings.bannerPosition}
                onChange={(e) => setSettings({...settings, bannerPosition: e.target.value})}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
              >
                <option value="bottom">Alt</option>
                <option value="top">Üst</option>
                <option value="center">Ortada (Popup)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Banner Metni</label>
              <textarea 
                rows={3}
                value={settings.bannerText}
                onChange={(e) => setSettings({...settings, bannerText: e.target.value})}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Önizleme</h2>
        
        <div className="rounded-lg bg-gray-900 text-white p-4 flex items-center justify-between">
          <p className="text-sm">{settings.bannerText}</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-primary text-white text-sm">Kabul Et</button>
            <button className="px-4 py-2 rounded border border-white/30 text-sm">Ayarlar</button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Kaydet
        </button>
      </div>
    </div>
  );
}
