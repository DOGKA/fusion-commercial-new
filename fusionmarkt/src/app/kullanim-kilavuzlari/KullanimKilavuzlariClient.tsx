"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Battery,
  Sun,
  BookOpen,
  ExternalLink,
  Download
} from "lucide-react";
import manualsData from "@/data/manuals-data.json";

// Kategori ikonları
const categoryIcons: Record<string, React.ReactNode> = {
  "Taşınabilir Güç İstasyonu": <Battery className="w-4 h-4" />,
  "Güneş Paneli": <Sun className="w-4 h-4" />,
};

// Kategori renkleri
const categoryColors: Record<string, string> = {
  "Taşınabilir Güç İstasyonu": "from-blue-500 to-blue-600",
  "Güneş Paneli": "from-amber-500 to-amber-600",
};

type Product = {
  category: string;
  name: string;
  slug: string;
  imageUrl: string;
  datasheetUrl?: string;
  userManualUrl?: string;
  installationGuideUrl?: string;
};

type Catalogue = {
  name: string;
  url: string;
};

// Dil bayrakları
const languageFlags: Record<string, string> = {
  "İngilizce": "🇬🇧",
  "Çince": "🇨🇳",
  "Arapça": "🇸🇦",
  "Rusça": "🇷🇺",
  "Fransızca": "🇫🇷",
};

export default function KullanimKilavuzlariClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const products: Product[] = manualsData.products;
  const catalogues: Catalogue[] = manualsData.catalogues;

  // Kategorileri çıkar
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filtreleme
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesCategory;
  });

  // Kategoriye göre grupla
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Altı - Siyahtan Beyaza Smooth Geçiş */}
      <div className="pt-[120px]" style={{ background: 'linear-gradient(to bottom, #000000 0%, #0f172a 10%, #1e293b 25%, #334155 45%, #64748b 60%, #94a3b8 72%, #cbd5e1 82%, #e2e8f0 90%, #f1f5f9 95%, #ffffff 100%)' }}>
        {/* Kataloglar */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-center text-2xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-slate-300 to-slate-400 bg-clip-text text-transparent">
                IEETek Kullanım Kılavuzları PDF İndir
              </span>
            </h1>
            <p className="text-center text-slate-400 text-sm md:text-base mb-4 max-w-2xl mx-auto">
              IEETek taşınabilir güç istasyonları ve güneş panelleri için Türkçe kullanım kılavuzları, teknik veri sayfaları ve kurulum rehberleri
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {catalogues.map((catalogue) => (
                <a
                  key={catalogue.name}
                  href={catalogue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm rounded-lg px-4 py-2.5 text-sm border border-slate-700/50 hover:border-slate-500 hover:bg-slate-700 transition-all duration-300"
                >
                  <span>{languageFlags[catalogue.name]}</span>
                  <span className="text-white">{catalogue.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Kategori Filtreleri */}
        <section className="py-4 pb-8">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto gap-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === "all"
                    ? "bg-white text-slate-900 shadow-md"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                }`}
              >
                Tümü ({products.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? `bg-gradient-to-r ${categoryColors[category]} text-white shadow-md`
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                  }`}
                >
                  {categoryIcons[category]}
                  <span className="whitespace-nowrap">{category.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Ürünler - Grid: Mobil 2 sütun, Web 4 sütun */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
            <div key={category} className="mb-8">
              {/* Kategori Başlık */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColors[category]} text-white`}>
                  {categoryIcons[category]}
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{category}</h2>
                <span className="text-xs text-slate-500">({categoryProducts.length})</span>
              </div>

              {/* Ürün Grid - Mobil 2 sütun, Web 4 sütun */}
              <div className="product-grid gap-3">
                <style jsx>{`
                  .product-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                  }
                  @media (min-width: 640px) {
                    .product-grid {
                      grid-template-columns: repeat(4, 1fr);
                    }
                  }
                `}</style>
                {categoryProducts.map((product, productIndex) => (
                  <div
                    key={product.slug}
                    className="bg-white rounded-lg overflow-hidden border border-slate-200 hover:shadow-md transition-all"
                  >
                    {/* Ürün Görseli Container */}
                    <div className="aspect-square w-full overflow-hidden bg-white p-2">
                      <div className="w-full h-full relative">
                        <Image
                          src={product.imageUrl}
                          alt={`${product.name} Türkçe Kullanım Kılavuzu PDF İndir`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 50vw, 25vw"
                          priority={productIndex < 4}
                        />
                      </div>
                    </div>

                    {/* Ürün Bilgileri */}
                    <div className="p-2">
                      <h3 className="font-medium text-slate-900 text-[11px] md:text-xs line-clamp-1 mb-1.5">
                        {product.name}
                      </h3>

                      {/* İndirme Butonları */}
                      <div className="flex gap-1">
                        {product.datasheetUrl && (
                          <a
                            href={product.datasheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-0.5 py-1 bg-slate-900 text-white rounded text-[9px] md:text-[10px] font-medium hover:bg-slate-800"
                          >
                            <Download className="w-2.5 h-2.5" />
                            PDF
                          </a>
                        )}

                        {product.userManualUrl && (
                          <a
                            href={product.userManualUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-0.5 py-1 bg-[var(--fusion-primary)] text-white rounded text-[9px] md:text-[10px] font-medium"
                          >
                            <BookOpen className="w-2.5 h-2.5" />
                            Kılavuz
                          </a>
                        )}

                        {!product.datasheetUrl && !product.userManualUrl && (
                          <div className="flex-1 py-1 bg-slate-100 text-slate-400 rounded text-center text-[9px]">
                            -
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alt Bölüm - Beyazdan Siyaha Smooth Geçiş */}
      <div style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #f1f5f9 10%, #cbd5e1 25%, #64748b 50%, #334155 70%, #1e293b 85%, #0f172a 95%, #000000 100%)' }}>
        {/* İletişim CTA */}
        <section className="py-6">
          <div className="container mx-auto px-4 text-center">
            <Link
              href="/iletisim"
              className="text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors"
            >
              Döküman bulamadınız mı? İletişime geçin →
            </Link>
          </div>
        </section>

        {/* App Banner */}
        <section className="py-8">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-lg font-bold text-white mb-3">IEETek Mobil Uygulaması</h2>
            <Link
              href="https://ieetek.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--fusion-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Uygulama Kılavuzu
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

