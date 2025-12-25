"use client";

import { useState } from "react";

const demoFaqs = [
  { id: "1", question: "Kargo ücreti ne kadar?", answer: "500 TL üzeri siparişlerde kargo ücretsizdir.", category: "Kargo", isActive: true, order: 1 },
  { id: "2", question: "İade koşulları nelerdir?", answer: "14 gün içinde kullanılmamış ürünleri iade edebilirsiniz.", category: "İade", isActive: true, order: 2 },
  { id: "3", question: "Taksit imkanı var mı?", answer: "Tüm kredi kartlarına 12 aya varan taksit imkanı sunuyoruz.", category: "Ödeme", isActive: true, order: 3 },
  { id: "4", question: "Garanti süresi ne kadar?", answer: "Tüm ürünlerimiz 2 yıl garantilidir.", category: "Garanti", isActive: true, order: 4 },
];

export default function FaqPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">S.S.S Yönetimi</h1>
          <p className="text-gray-500">Sık sorulan soruları düzenleyin</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Soru
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{demoFaqs.length}</p>
          <p className="text-sm text-gray-500">Toplam Soru</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{demoFaqs.filter(f => f.isActive).length}</p>
          <p className="text-sm text-gray-500">Aktif</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-primary">{[...new Set(demoFaqs.map(f => f.category))].length}</p>
          <p className="text-sm text-gray-500">Kategori</p>
        </div>
      </div>

      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Sorular</h2>
        </div>
        <div className="divide-y divide-stroke dark:divide-dark-3">
          {demoFaqs.map((faq) => (
            <div key={faq.id} className="px-6 py-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-300">{faq.order}</span>
                  <div>
                    <p className="font-medium text-dark dark:text-white">{faq.question}</p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded dark:bg-dark-2">{faq.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${faq.isActive ? "bg-green-100 text-green-600 dark:bg-green-500/10" : "bg-red-100 text-red-600 dark:bg-red-500/10"}`}>
                    {faq.isActive ? "Aktif" : "Pasif"}
                  </span>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedId === faq.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {expandedId === faq.id && (
                <div className="mt-4 pl-10">
                  <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  <div className="flex gap-2 mt-4">
                    <button className="px-3 py-1.5 rounded text-sm bg-primary text-white">Düzenle</button>
                    <button className="px-3 py-1.5 rounded text-sm border border-stroke dark:border-dark-3">Sil</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
