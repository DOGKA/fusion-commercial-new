"use client";

import { useState } from "react";

const legalPages = [
  {
    id: "distance-sales",
    title: "Mesafeli Satış Sözleşmesi",
    slug: "mesafeli-satis-sozlesmesi",
    isActive: true,
    showOnCheckout: true,
    requireAcceptance: true,
    lastUpdated: "2024-12-10",
    content: `MESAFELI SATIŞ SÖZLEŞMESİ

Referans No: [Sipariş Onay Numarası]

TARAFLAR

1. SATICI
Ticaret Unvanı: FusionMarkt E-Ticaret Ltd. Şti.
Adres: [Şirket Adresi]
Telefon: [Telefon Numarası]
E-posta: info@fusionmarkt.com

2. ALICI
[Müşteri bilgileri sipariş sırasında otomatik doldurulur]

MADDE 1 - KONU
İşbu sözleşmenin konusu, Alıcı'nın Satıcı'ya ait web sitesinden elektronik ortamda siparişini yaptığı ürün/ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkındaki Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.

MADDE 2 - ÜRÜN BİLGİLERİ
[Sipariş edilen ürünlerin detayları]

MADDE 3 - GENEL HÜKÜMLER
3.1. Alıcı, satışa konu ürün/ürünlerin temel nitelikleri, satış fiyatı, ödeme şekli, teslimat koşulları vb. satışa konu mal/hizmetlerle ilgili tüm ön bilgileri okuyup, bilgi sahibi olduğunu ve elektronik ortamda gerekli onayı verdiğini beyan eder.

...devamı`
  },
  {
    id: "user-agreement",
    title: "Kullanıcı Sözleşmesi",
    slug: "kullanici-sozlesmesi",
    isActive: true,
    showOnCheckout: true,
    requireAcceptance: true,
    lastUpdated: "2024-12-08",
    content: `KULLANICI SÖZLEŞMESİ VE FERAGATNAME

LÜTFEN BU SİTEYİ KULLANMADAN ÖNCE AŞAĞIDAKİ HÜKÜM VE KOŞULLARI DİKKATLİCE OKUYUN.

1. GENEL
Bu web sitesini kullanarak, işbu kullanım koşullarını kabul etmiş sayılırsınız...`
  },
  {
    id: "privacy-policy",
    title: "Gizlilik Politikası",
    slug: "gizlilik-politikasi",
    isActive: true,
    showOnCheckout: false,
    requireAcceptance: false,
    lastUpdated: "2024-12-05",
    content: `GİZLİLİK POLİTİKASI

FusionMarkt olarak kişisel verilerinizin güvenliği en önemli önceliğimizdir...`
  },
  {
    id: "terms",
    title: "Kullanım Koşulları",
    slug: "kullanim-kosullari",
    isActive: true,
    showOnCheckout: false,
    requireAcceptance: false,
    lastUpdated: "2024-12-01",
    content: `KULLANIM KOŞULLARI

Web sitemizi kullanarak aşağıdaki koşulları kabul etmiş olursunuz...`
  },
  {
    id: "return-policy",
    title: "İade ve Değişim Politikası",
    slug: "iade-degisim-politikasi",
    isActive: true,
    showOnCheckout: true,
    requireAcceptance: false,
    lastUpdated: "2024-11-28",
    content: `İADE VE DEĞİŞİM POLİTİKASI

Ürünlerimizi 14 gün içinde iade edebilirsiniz...`
  },
  {
    id: "kvkk",
    title: "KVKK Aydınlatma Metni",
    slug: "kvkk-aydinlatma-metni",
    isActive: true,
    showOnCheckout: false,
    requireAcceptance: false,
    lastUpdated: "2024-11-25",
    content: `KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) AYDINLATMA METNİ

6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında...`
  },
  {
    id: "cookie-policy",
    title: "Çerez Politikası",
    slug: "cerez-politikasi",
    isActive: true,
    showOnCheckout: false,
    requireAcceptance: false,
    lastUpdated: "2024-11-20",
    content: `ÇEREZ POLİTİKASI

Web sitemiz çeşitli çerezler kullanmaktadır...`
  },
];

export default function LegalPage() {
  const [selectedPage, setSelectedPage] = useState(legalPages[0]);
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState(selectedPage.content);

  const handlePageSelect = (page: typeof legalPages[0]) => {
    setSelectedPage(page);
    setContent(page.content);
    setEditMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Yasal Sayfalar & Sözleşmeler</h1>
          <p className="text-gray-500">Ödeme sayfasında gösterilecek sözleşmeleri ve yasal metinleri yönetin</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Sayfa
        </button>
      </div>

      {/* Checkout Preview */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">Ödeme Sayfası Önizlemesi</h2>
        <div className="rounded-lg border border-stroke p-4 dark:border-dark-3 bg-gray-50 dark:bg-dark-2">
          <div className="space-y-3">
            {legalPages.filter(p => p.showOnCheckout && p.isActive).map((page) => (
              <label key={page.id} className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 h-4 w-4 rounded border-stroke text-primary" 
                  defaultChecked={page.requireAcceptance}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <a href="#" className="text-primary hover:underline">{page.title}</a>
                  {page.requireAcceptance && <span className="text-red-500"> *</span>}
                  {" "}bölümünü okudum ve kabul ediyorum.
                </span>
              </label>
            ))}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-stroke text-primary" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Haber bültenimize abone olun (isteğe bağlı)
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Page List */}
        <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
          <div className="border-b border-stroke px-4 py-3 dark:border-dark-3">
            <h2 className="font-semibold text-dark dark:text-white">Sayfalar</h2>
          </div>
          <div className="divide-y divide-stroke dark:divide-dark-3">
            {legalPages.map((page) => (
              <button
                key={page.id}
                onClick={() => handlePageSelect(page)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors ${
                  selectedPage.id === page.id ? "bg-primary/5 border-l-2 border-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${selectedPage.id === page.id ? "text-primary" : "text-dark dark:text-white"}`}>
                    {page.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${page.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {page.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {page.showOnCheckout && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Ödemede
                    </span>
                  )}
                  {page.requireAcceptance && (
                    <span className="text-red-500">Zorunlu</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Page Settings */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">{selectedPage.title} - Ayarlar</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Sayfa URL</label>
                <input 
                  type="text" 
                  value={selectedPage.slug}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm dark:border-dark-3"
                  readOnly
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Son Güncelleme</label>
                <input 
                  type="text" 
                  value={selectedPage.lastUpdated}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm dark:border-dark-3"
                  readOnly
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked={selectedPage.isActive} className="h-4 w-4 rounded text-primary" />
                <span className="text-sm">Aktif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked={selectedPage.showOnCheckout} className="h-4 w-4 rounded text-primary" />
                <span className="text-sm">Ödeme Sayfasında Göster</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked={selectedPage.requireAcceptance} className="h-4 w-4 rounded text-primary" />
                <span className="text-sm">Onay Zorunlu</span>
              </label>
            </div>
          </div>

          {/* Content Editor */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark dark:text-white">İçerik</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-sm text-primary hover:underline"
              >
                {editMode ? "Önizleme" : "Düzenle"}
              </button>
            </div>

            {editMode ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 font-mono text-sm dark:border-dark-3"
              />
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert rounded-lg border border-stroke p-4 dark:border-dark-3 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300">
                  {content}
                </pre>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2">
                Önizle
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90">
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
