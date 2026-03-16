"use client";

import { CloseIcon, SearchIcon } from "@/assets/icons";
import { Modal } from "@/components/ui/modal";
import { useState, useMemo } from "react";
import Link from "next/link";

// Admin panel sayfaları için statik arama verileri
const SEARCH_DATA = [
  { title: "Dashboard", url: "/", type: "Sayfa" },
  { title: "Ürünler", url: "/products", type: "Sayfa" },
  { title: "Yeni Ürün Ekle", url: "/products/new", type: "Sayfa" },
  { title: "Kategoriler", url: "/categories", type: "Sayfa" },
  { title: "Siparişler", url: "/orders", type: "Sayfa" },
  { title: "Müşteriler", url: "/users", type: "Sayfa" },
  { title: "Kuponlar", url: "/coupons", type: "Sayfa" },
  { title: "Yeni Kupon Ekle", url: "/coupons/new", type: "Sayfa" },
  { title: "Paket Ürünler (Bundle)", url: "/bundles", type: "Sayfa" },
  { title: "Yeni Paket Ekle", url: "/bundles/new", type: "Sayfa" },
  { title: "Bloglar", url: "/blogs", type: "Sayfa" },
  { title: "Yeni Blog Ekle", url: "/blogs/new", type: "Sayfa" },
  { title: "Slider Yönetimi", url: "/sliders", type: "Sayfa" },
  { title: "Banner Yönetimi", url: "/banners", type: "Sayfa" },
  { title: "Yorumlar", url: "/reviews", type: "Sayfa" },
  { title: "İletişim Mesajları", url: "/contact", type: "Sayfa" },
  { title: "Ayarlar", url: "/settings", type: "Sayfa" },
  { title: "Hesap Ayarları", url: "/account-settings", type: "Sayfa" },
  { title: "Medya Kütüphanesi", url: "/media", type: "Sayfa" },
  { title: "Rozet Yönetimi", url: "/badges", type: "Sayfa" },
  { title: "Filtre Yönetimi", url: "/filters", type: "Sayfa" },
  { title: "SSS / FAQ", url: "/faq", type: "Sayfa" },
  { title: "Yasal Sayfalar", url: "/legal", type: "Sayfa" },
  { title: "Pazarlama", url: "/marketing", type: "Sayfa" },
  { title: "Terk Edilmiş Sepetler", url: "/marketing/abandoned-carts", type: "Sayfa" },
  { title: "Yorum Hatırlatma", url: "/marketing/review-reminder", type: "Sayfa" },
  { title: "Kargo Ayarları", url: "/settings", type: "Sayfa" },
  { title: "Stok Yönetimi", url: "/stocks", type: "Sayfa" },
  { title: "Analitik", url: "/analytics", type: "Sayfa" },
];

export function SearchInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return SEARCH_DATA.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.url.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
  }, [query]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3.5 rounded-full border bg-gray-2 p-3 outline-none ring-primary transition-colors focus-visible:ring-1 dark:border-dark-3 dark:bg-dark-2 dark:hover:border-dark-4 dark:hover:bg-dark-3 dark:hover:text-dark-6 min-[1015px]:w-[300px] min-[1015px]:px-5"
        aria-label="Open search"
      >
        <SearchIcon className="max-[1015px]:size-5" />
        <span className="max-[1015px]:sr-only">Ara</span>
      </button>

      <Modal open={isOpen} onClose={handleClose}>
        <div className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-0 dark:border-none dark:bg-dark dark:text-gray-5">
          <h2 id="search-dialog-title" className="sr-only">
            Arama
          </h2>

          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex flex-1 flex-col overflow-y-auto rounded-xl">
              {/* Search Input */}
              <div className="sticky top-0">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Sayfa ara..."
                  autoFocus
                  className="h-18 w-full border-b border-stroke bg-transparent pl-15 pr-4 text-dark outline-none dark:border-dark-3 dark:bg-dark dark:text-gray-5"
                />
                <SearchIcon
                  width={20}
                  height={20}
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2"
                />
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-4">
                {query.trim() === "" ? (
                  <div className="py-12 text-center text-gray-500">
                    Aramak için yazmaya başlayın...
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    Sonuç bulunamadı
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {filteredResults.map((item) => (
                      <li key={item.url}>
                        <Link
                          href={item.url}
                          onClick={handleClose}
                          className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-100 dark:hover:bg-dark-3"
                        >
                          <SearchIcon className="size-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-dark dark:text-white">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.type} • {item.url}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="absolute right-0 top-0 grid size-11 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border-2 bg-white outline-none transition-colors hover:bg-gray-3 focus-visible:bg-gray-3 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3"
            aria-label="Close search"
          >
            <CloseIcon />
          </button>
        </div>
      </Modal>
    </>
  );
}
