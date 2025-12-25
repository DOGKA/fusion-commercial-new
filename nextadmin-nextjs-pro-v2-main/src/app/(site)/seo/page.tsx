"use client";

import { useState } from "react";

export default function SeoPage() {
  const [settings, setSettings] = useState({
    siteTitle: "FusionMarkt - Güç İstasyonları ve Solar Paneller",
    siteDescription: "Türkiye'nin en kapsamlı taşınabilir güç çözümleri mağazası. POWERTECH, EcoFlow ve daha fazlası.",
    keywords: "güç istasyonu, solar panel, taşınabilir enerji, kamp ekipmanları",
    ogImage: "",
    twitterHandle: "@fusionmarkt",
    googleAnalytics: "G-XXXXXXXXXX",
    googleTagManager: "GTM-XXXXXXX",
    facebookPixel: "",
    robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://fusionmarkt.com/sitemap.xml",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">SEO Ayarları</h1>
        <p className="text-gray-500">Arama motoru optimizasyonu ayarlarını yönetin</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Meta Tags */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Meta Etiketleri</h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Site Başlığı</label>
              <input 
                type="text" 
                value={settings.siteTitle}
                onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
              />
              <p className="mt-1 text-xs text-gray-500">{settings.siteTitle.length}/60 karakter</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Site Açıklaması</label>
              <textarea 
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
              />
              <p className="mt-1 text-xs text-gray-500">{settings.siteDescription.length}/160 karakter</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Anahtar Kelimeler</label>
              <input 
                type="text" 
                value={settings.keywords}
                onChange={(e) => setSettings({...settings, keywords: e.target.value})}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="virgülle ayırın"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Sosyal Medya</h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">OG Image URL</label>
              <input 
                type="text" 
                value={settings.ogImage}
                onChange={(e) => setSettings({...settings, ogImage: e.target.value})}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="https://example.com/og-image.jpg"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Twitter Handle</label>
              <input 
                type="text" 
                value={settings.twitterHandle}
                onChange={(e) => setSettings({...settings, twitterHandle: e.target.value})}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
              />
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Analitik & Takip</h2>
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Google Analytics ID</label>
              <input 
                type="text" 
                value={settings.googleAnalytics}
                onChange={(e) => setSettings({...settings, googleAnalytics: e.target.value})}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Google Tag Manager ID</label>
              <input 
                type="text" 
                value={settings.googleTagManager}
                onChange={(e) => setSettings({...settings, googleTagManager: e.target.value})}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                placeholder="GTM-XXXXXXX"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Facebook Pixel ID</label>
              <input 
                type="text" 
                value={settings.facebookPixel}
                onChange={(e) => setSettings({...settings, facebookPixel: e.target.value})}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
              />
            </div>
          </div>
        </div>

        {/* Robots.txt */}
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Robots.txt</h2>
          
          <textarea 
            rows={8}
            value={settings.robotsTxt}
            onChange={(e) => setSettings({...settings, robotsTxt: e.target.value})}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-mono text-sm dark:border-dark-3"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Google Önizleme</h2>
        
        <div className="max-w-xl">
          <p className="text-blue-600 text-lg hover:underline cursor-pointer">{settings.siteTitle}</p>
          <p className="text-green-700 text-sm">https://fusionmarkt.com</p>
          <p className="text-gray-600 text-sm">{settings.siteDescription}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="rounded-lg border border-stroke px-6 py-3 dark:border-dark-3">
          Sitemap Oluştur
        </button>
        <button className="rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90">
          Kaydet
        </button>
      </div>
    </div>
  );
}
