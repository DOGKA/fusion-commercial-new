"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Search,
  X,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import ProductCard, { Product } from "@/components/ui/ProductCard";
import { mapApiProductToCard } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import WaveMesh from "@/components/ui/WaveMesh";
import ParticleField from "@/components/three/ParticleField";
import { useMysteryBox } from "@/context/MysteryBoxContext";
import FilterSidePanel from "@/components/filters/FilterSidePanel";
import { getAllFilters } from "@/lib/filters/category-filters";
import { isOnSale, isNewProduct } from "@/lib/badge-config";

interface Banner {
  id: string;
  name: string;
  placement: string;
  isActive: boolean;
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  desktopImage: string | null;
  mobileImage: string | null;
  gradientFrom: string | null;
  gradientTo: string | null;
}

interface ProductWithCategory extends Product {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  createdAt?: string;
  comparePrice?: number | null;
  saleEndDate?: string | null;
  productBadges?: ApiProductBadge[];
}

interface CategoryWithProducts {
  id: string;
  name: string;
  slug: string;
  themeColor: string | null; // Kategori tema rengi
  products: ProductWithCategory[];
}

// API response types
interface ApiProductBadge {
  badge?: {
    slug?: string;
    name?: string;
  };
}

interface ApiVariant {
  id: string;
  sku?: string;
  stock?: number;
  price?: number;
  options?: Array<{
    name: string;
    value: string;
  }>;
  image?: string;
}

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  discountPercentage?: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    themeColor?: string;
  };
  productBadges?: ApiProductBadge[];
  title?: string;
  brand?: string;
  images?: string[];
  comparePrice?: number;
  createdAt?: string;
  saleEndDate?: string | null;
  productType?: "SIMPLE" | "VARIABLE";
  variants?: ApiVariant[];
  shortDescription?: string;
}

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "En Yeniler" },
  { value: "price_asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "price_desc", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "name_asc", label: "İsim: A-Z" },
];

// Kategori slug -> placement mapping
const CATEGORY_PLACEMENT_MAP: Record<string, string> = {
  "endustriyel-eldivenler": "SHOP_CATEGORY_ENDUSTRIYEL_ELDIVENLER",
  "teleskopik-merdivenler": "SHOP_CATEGORY_TELESKOPIK_MERDIVENLER", 
  "tasinabilir-guc-kaynaklari": "SHOP_CATEGORY_TASINABILIR_GUC_KAYNAKLARI",
  "gunes-panelleri": "SHOP_CATEGORY_GUNES_PANELLERI",
};

// Filter types
interface FilterOption {
  id: string;
  name: string;
  value: string;
  color?: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  name: string;
  type: "CHECKBOX" | "RADIO" | "COLOR_SWATCH" | "RANGE";
  options: FilterOption[];
  isCollapsible?: boolean;
}

interface SelectedFilters {
  [filterId: string]: string[];
}

interface RangeValues {
  [filterId: string]: { min: number; max: number };
}

export default function StorePage() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [categoryBanners, setCategoryBanners] = useState<Record<string, Banner>>({});
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  
  // Filter state
  const [storeFilters, setStoreFilters] = useState<FilterGroup[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});
  const [rangeValues, setRangeValues] = useState<RangeValues>({});
  
  // Sort dropdown ref for portal positioning
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  // Load store filters on mount
  useEffect(() => {
    setStoreFilters(getAllFilters());
  }, []);

  // Update dropdown position when sortOpen changes
  useEffect(() => {
    if (sortOpen && sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [sortOpen]);

  // Fetch banners (header + category banners)
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // ✅ Public API kullan - Tum aktif bannerlari cek
        const res = await fetch("/api/public/banners");
        if (res.ok) {
          const data = (await res.json()) as Banner[];
          
          // SHOP_HEADER banner
          const headerBanner = data.find(b => b.placement === "SHOP_HEADER");
          if (headerBanner) setBanner(headerBanner);
          
          // SHOP_CATEGORY_* bannerlar - slug'a gore map'le
          const catBanners: Record<string, Banner> = {};
          data.forEach(b => {
            if (b.placement.startsWith("SHOP_CATEGORY_")) {
              // Placement'tan slug'ı bul
              Object.entries(CATEGORY_PLACEMENT_MAP).forEach(([slug, placement]) => {
                if (b.placement === placement) {
                  catBanners[slug] = b;
                }
              });
            }
          });
          setCategoryBanners(catBanners);
        }
      } catch {
        // ignore
      }
    };
    fetchBanners();
  }, []);

  // Fetch all products and group by category
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/public/products?limit=100");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        const apiProducts = (data.products || []) as ApiProduct[];

        // Kategorilere göre grupla
        const categoryMap = new Map<string, CategoryWithProducts>();

        apiProducts.forEach((product: ApiProduct) => {
          const catId = product.categoryId || "uncategorized";
          const catName = product.category?.name || "Diğer";
          const catSlug = product.category?.slug || "diger";
          const catThemeColor = product.category?.themeColor || null;

          // Convert ApiProduct to ProductWithCategory
          const stockQty = product.stock || 0;
          const productWithCategory = {
            id: product.id,
            title: product.title || product.name,
            name: product.name,
            slug: product.slug,
            price: product.price,
            originalPrice: product.comparePrice || product.originalPrice,
            discountPercent: product.discountPercentage,
            brand: product.brand || "",
            stockStatus: (stockQty > 10 ? "in_stock" : stockQty > 0 ? "low_stock" : "out_of_stock") as "in_stock" | "low_stock" | "out_of_stock",
            stockQuantity: stockQty,
            stock: stockQty,
            image: product.images?.[0],
            images: product.images,
            categoryId: catId,
            categoryName: catName,
            categorySlug: catSlug,
            createdAt: product.createdAt,
            comparePrice: product.comparePrice,
            saleEndDate: product.saleEndDate,
            productBadges: product.productBadges,
            productType: product.productType,
            variants: product.variants,
            shortDescription: product.shortDescription,
          };

          if (!categoryMap.has(catId)) {
            categoryMap.set(catId, {
              id: catId,
              name: catName,
              slug: catSlug,
              themeColor: catThemeColor,
              products: [],
            });
          }
          categoryMap.get(catId)!.products.push(productWithCategory as ProductWithCategory);
        });

        const categoriesArray = Array.from(categoryMap.values())
          .filter((cat) => cat.products.length > 0)
          .sort((a, b) => b.products.length - a.products.length);

        setCategoriesWithProducts(categoriesArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sort products within each category
  const sortProducts = (products: ProductWithCategory[]): ProductWithCategory[] => {
    const sorted = [...products];
    switch (sortBy) {
      case "price_asc":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price_desc":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "name_asc":
        return sorted.sort((a, b) => (a.title || "").localeCompare(b.title || "", "tr"));
      case "newest":
      default:
        return sorted;
    }
  };

  // Filter handlers
  const handleFilterChange = (filterId: string, values: string[]) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterId]: values,
    }));
  };

  const handleRangeChange = (filterId: string, min: number, max: number) => {
    setRangeValues((prev) => ({
      ...prev,
      [filterId]: { min, max },
    }));
  };

  const handleClearFilters = () => {
    setSelectedFilters({});
    setRangeValues({});
  };

  const handleApplyFilters = () => {
    // Filtreleme aktif olduğunda panel kapanır
    setFiltersOpen(false);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FİLTRELEME MANTIĞI - Rozet, Fiyat, Stok
  // ═══════════════════════════════════════════════════════════════════════════
  const applyFiltersToProducts = (products: ProductWithCategory[]) => {
    return products.filter((product: ProductWithCategory & { productBadges?: ApiProductBadge[] }) => {
      // 1. Fiyat Filtresi
      if (rangeValues.price) {
        const { min, max } = rangeValues.price;
        const price = product.price || 0;
        if (min && price < min) return false;
        if (max && price > max) return false;
      }

      // 2. Stok Durumu Filtresi
      if (selectedFilters.availability?.length > 0) {
        const avail = selectedFilters.availability[0];
        if (avail === "in_stock") {
          const stock = product.stockQuantity || 0;
          if (stock <= 0) return false;
        }
      }

      // 3. Rozet Filtresi (Yeni Eklenen, İndirimli)
      // NOT: Bu rozetler sistem tarafından otomatik oluşturuluyor, veritabanında değil!
      if (selectedFilters.badges?.length > 0) {
        const selectedBadges = selectedFilters.badges;
        
        // Ürün için rozet kontrolü yap
        let hasBadge = false;
        
        for (const badgeType of selectedBadges) {
          if (badgeType === "yeni") {
            // "Yeni Eklenen" rozeti: isNewProduct kontrolü (son 30 gün)
            if (isNewProduct(product.createdAt)) {
              hasBadge = true;
              break;
            }
          } else if (badgeType === "indirimli") {
            // "İndirimli" rozeti: isOnSale kontrolü (comparePrice > price)
            const price = Number(product.price) || 0;
            const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
            const saleEndDate = product.saleEndDate ?? null;
            
            if (isOnSale(price, comparePrice, saleEndDate)) {
              hasBadge = true;
              break;
            }
          } else {
            // Diğer manuel rozetler: veritabanından kontrol
            const productBadges = product.productBadges || [];
            const hasManualBadge = productBadges.some((pb: ApiProductBadge) => {
              const badge = pb.badge || {};
              return badge.slug === badgeType || badge.name?.toLowerCase().includes(badgeType);
            });
            if (hasManualBadge) {
              hasBadge = true;
              break;
            }
          }
        }
        
        if (!hasBadge) return false;
      }

      return true;
    });
  };

  // Filter by search, filters, and sort
  const filteredCategories = categoriesWithProducts
    .map((cat) => {
      let products = cat.products;

      // Arama filtresi
      if (searchQuery) {
        products = products.filter((p) => {
          const title = p.title || "";
          return title.toLowerCase().includes(searchQuery.toLowerCase());
        });
      }

      // Diğer filtreler (fiyat, stok, rozet)
      products = applyFiltersToProducts(products);

      // Sıralama
      products = sortProducts(products);

      return {
        ...cat,
        products,
      };
    })
    .filter((cat) => cat.products.length > 0);

  // Total products count (available for future use)
  const _totalProducts = filteredCategories.reduce((sum, cat) => sum + cat.products.length, 0);
  void _totalProducts;

  // Filtre paneli için aktif kategori tema rengi
  // İlk kategorinin (en çok ürünü olan) rengini kullan, yoksa default
  const filterPanelThemeColor = categoriesWithProducts[0]?.themeColor || "#8b5cf6";

  // Mystery Box context
  const { canOpen, hasClaim, coupon, openModal, isLoading: mysteryBoxLoading } = useMysteryBox();

  return (
    <div className="min-h-screen bg-[#060606] relative">
      {/* Filter Side Panel */}
      <FilterSidePanel
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={storeFilters}
        selectedFilters={selectedFilters}
        rangeValues={rangeValues}
        onFilterChange={handleFilterChange}
        onRangeChange={handleRangeChange}
        onClearAll={handleClearFilters}
        onApply={handleApplyFilters}
        themeColor={filterPanelThemeColor}
        categoryName="Tüm Ürünler"
      />

      {/* Full Page Particle Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleField className="opacity-15" particleCount={40} color="#ffffff" />
      </div>

      {/* Content */}
      <div className="relative z-10">
      {/* BANNER */}
      <section style={{ paddingTop: "120px" }} className="container">
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          {banner?.buttonLink ? (
            <Link href={banner.buttonLink} className="block group">
              <BannerImage banner={banner} />
            </Link>
          ) : (
            <BannerImage banner={banner} />
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TOOLBAR - Nano Banana Design - Wave Mesh Glassmorphism
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="container" style={{ marginTop: "48px", marginBottom: "48px" }}>
        <div className="relative">
          {/* Main Toolbar Container - Glassmorphism with Wave Mesh */}
          <div className="relative rounded-[20px] border border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {/* Wave Mesh Background Animation - Prominent like reference design */}
            <div className="absolute inset-0 overflow-hidden rounded-[20px]">
              <WaveMesh 
                color="rgba(255,255,255,0.10)" 
                opacity={1}
              />
            </div>
            
            {/* Very subtle vignette for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.2)_100%)] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 px-4 py-4 lg:px-6 lg:py-5">
              {/* Desktop / Tablet: tek satır */}
              <div className="store-toolbar-content flex items-center gap-3 lg:gap-4 flex-wrap md:flex-nowrap">
                
                {/* Filter Button */}
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="store-filter-button flex items-center gap-2.5 px-4 lg:px-5 h-[42px] rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] hover:border-white/[0.16] text-white/80 hover:text-white transition-all duration-200 whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtre</span>
                </button>

                {/* Search */}
                <div className="store-search-container flex-1 min-w-[200px] lg:min-w-[280px] relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ürün ara..."
                    className="w-full h-[42px] pl-11 pr-12 rounded-xl bg-white/[0.06] hover:bg-white/[0.08] focus:bg-white/[0.10] border border-white/[0.10] focus:border-white/[0.20] text-sm text-white placeholder:text-white/40 outline-none transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-white/50" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    ref={sortButtonRef}
                    onClick={() => setSortOpen(!sortOpen)}
                    className="store-sort-button flex items-center gap-2 px-4 h-[42px] rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] hover:border-white/[0.16] text-white/80 hover:text-white transition-all duration-200 whitespace-nowrap"
                  >
                    <span className="text-sm font-medium">
                      {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                    </span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", sortOpen && "rotate-180")} />
                  </button>

                  {/* Portal Dropdown */}
                  {sortOpen && typeof window !== "undefined" && createPortal(
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-[9998]" 
                        onClick={() => setSortOpen(false)} 
                      />
                      {/* Dropdown Menu */}
                      <div 
                        className="fixed z-[9999] w-56 rounded-2xl border border-white/[0.12] shadow-2xl overflow-hidden"
                        style={{ 
                          top: dropdownPos.top,
                          right: dropdownPos.right,
                          background: 'rgba(18, 18, 18, 0.85)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                        }}
                      >
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setSortOpen(false);
                            }}
                            className={cn(
                              "w-full px-4 py-3 text-left text-sm transition-all duration-150",
                              sortBy === option.value
                                ? "bg-white/[0.12] text-white font-medium"
                                : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>,
                    document.body
                  )}
                </div>

                {/* Mystery Box / Coupon Button */}
                {!mysteryBoxLoading && (
                  hasClaim && coupon ? (
                    /* Kupon açılmış - Kupon kodunu göster */
                    <button
                      onClick={openModal}
                      className="store-coupon-button flex items-center gap-2 px-4 h-[42px] text-emerald-50 transition-all duration-200 whitespace-nowrap group"
                    >
                      <span className="coupon-code font-semibold text-sm tracking-wide">{coupon.code}</span>
                      <span className="coupon-dot text-emerald-400 font-medium text-sm">•</span>
                      <span className="coupon-amount text-sm font-medium text-emerald-300">
                        {coupon.discountType === "percentage" 
                          ? `${coupon.discountValue}%` 
                          : `₺${coupon.discountValue}`
                        }
                      </span>
                      <span className="coupon-label text-sm font-medium text-emerald-300">İndirim</span>
                      <div className="coupon-divider w-px h-4 bg-emerald-400/30 mx-1" />
                      <Info className="coupon-info w-4 h-4 text-emerald-400/70 group-hover:text-emerald-400 transition-colors" />
                    </button>
                  ) : canOpen ? (
                    /* Kutu açılabilir - Süpriz Kutu butonu */
                    <button
                      onClick={openModal}
                      className="store-coupon-button flex items-center gap-2 px-4 h-[42px] text-emerald-50 transition-all duration-200 whitespace-nowrap group"
                    >
                      <span className="font-semibold text-sm tracking-wide">Süpriz Kutu</span>
                      <span className="text-emerald-400 font-medium text-sm">•</span>
                      <span className="text-sm font-medium text-emerald-300">Aç</span>
                      <div className="w-px h-4 bg-emerald-400/30 mx-1" />
                      <Info className="w-4 h-4 text-emerald-400/70 group-hover:text-emerald-400 transition-colors" />
                    </button>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES WITH CAROUSELS */}
      <section style={{ marginTop: "48px", paddingBottom: "80px" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="container text-center py-20">
            <p className="text-white/50">Ürün bulunamadı.</p>
          </div>
        ) : (
          <div>
            {filteredCategories.map((category, idx) => (
              <div key={category.id} style={{ marginTop: idx > 0 ? "100px" : "0" }}>
                <CategoryCarousel 
                  category={category} 
                  bannerData={categoryBanners[category.slug]}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FILTER DRAWER */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#0a0a0a] border-l border-white/10 overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-5 bg-[#0a0a0a] border-b border-white/10">
              <h2 className="text-base font-semibold text-white">Filtreler</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <p className="text-sm text-white/60">Filtreler yakında eklenecek.</p>
              </div>
            </div>

            <div className="sticky bottom-0 p-5 bg-[#0a0a0a] border-t border-white/10">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-white text-black font-medium"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BANNER IMAGE COMPONENT
───────────────────────────────────────────────────────────────────────────── */
function BannerImage({ banner }: { banner: Banner | null }) {
  const hasImage = !!(banner?.desktopImage || banner?.mobileImage);
  const hasContent = !!(banner?.title || banner?.subtitle || banner?.buttonText);

  return (
    <div
      className="relative h-[100px] sm:h-[140px] lg:h-[180px] rounded-2xl overflow-hidden border border-white/10"
      style={{
        background:
          banner?.gradientFrom && banner?.gradientTo
            ? `linear-gradient(90deg, ${banner.gradientTo} 0%, ${banner.gradientFrom} 50%, ${banner.gradientTo} 100%)`
            : "linear-gradient(90deg, rgba(6,182,212,0.10) 0%, rgba(16,185,129,0.15) 50%, rgba(6,182,212,0.10) 100%)",
      }}
    >
      {/* Background Image */}
      {hasImage && (
        <>
          {banner?.mobileImage && (
            <Image
              src={banner.mobileImage}
              alt={banner?.name || "Banner"}
              fill
              className="sm:hidden object-cover"
              sizes="100vw"
            />
          )}
          {banner?.desktopImage && (
            <Image
              src={banner.desktopImage}
              alt={banner?.name || "Banner"}
              fill
              className={cn("hidden sm:block object-cover", !banner?.mobileImage && "block")}
              sizes="100vw"
            />
          )}
        </>
      )}

      {/* Content Overlay */}
      {hasContent && (
        <div className="absolute inset-0 flex items-end p-4 sm:p-5 lg:p-6">
          <div className="flex-1">
            {banner?.title && (
              <h3 className="text-white text-sm sm:text-base lg:text-lg font-semibold mb-1">
                {banner.title}
              </h3>
            )}
            {banner?.subtitle && (
              <p className="text-white/80 text-xs sm:text-sm mb-2 line-clamp-1">
                {banner.subtitle}
              </p>
            )}
          </div>
          {banner?.buttonText && (
            <span
              className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl group-hover:bg-white/20 transition-colors"
            >
              {banner.buttonText}
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      )}

      {/* Placeholder if no content */}
      {!hasImage && !hasContent && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-white/30">SHOP_HEADER banner ekleyin</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY CAROUSEL - Her kategori için auto-scroll carousel + sağda banner
───────────────────────────────────────────────────────────────────────────── */

// Default tema rengi (veritabanında themeColor yoksa)
const DEFAULT_THEME_COLOR = "#8b5cf6"; // Violet

// Helper: Hex renkten daha koyu bir ton oluştur (gradient to için)
const darkenColor = (hex: string, percent: number = 20): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max(((num >> 8) & 0x00ff) - amt, 0);
  const B = Math.max((num & 0x0000ff) - amt, 0);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
};

function CategoryCarousel({ 
  category, 
  bannerData 
}: { 
  category: CategoryWithProducts; 
  bannerData?: Banner;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Tema rengi: Kategori themeColor (veritabanından) veya default
  const themeColor = category.themeColor || DEFAULT_THEME_COLOR;
  
  // Banner renkleri: Banner verisi varsa onu kullan, yoksa themeColor'dan gradient oluştur
  const bannerColors = bannerData?.gradientFrom && bannerData?.gradientTo
    ? { from: bannerData.gradientFrom, to: bannerData.gradientTo }
    : { from: themeColor, to: darkenColor(themeColor, 15) };
  
  // Banner'dan gelen içerik veya default
  const bannerTitle = bannerData?.title || category.name;
  const bannerSubtitle = bannerData?.subtitle || "Kaliteli ürünleri keşfedin";
  const bannerButtonText = bannerData?.buttonText || "Tümünü Gör";

  // Auto scroll
  useEffect(() => {
    if (category.products.length === 0 || isPaused) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollSpeed = 0.5;
    const scrollInterval = 30;

    const autoScroll = setInterval(() => {
      if (!scrollContainer) return;

      scrollContainer.scrollLeft += scrollSpeed;

      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      if (scrollContainer.scrollLeft >= maxScroll - 5) {
        scrollContainer.scrollLeft = 0;
      }
    }, scrollInterval);

    return () => clearInterval(autoScroll);
  }, [category.products, isPaused]);

  const displayProducts = [...category.products, ...category.products];

  return (
    <div className="container">
      {/* Carousel with LEFT Banner - Başlık yok, banner'da var */}
      <div className="relative flex gap-0">
        {/* LEFT Banner - Kompakt Glassmorphism - ProductCard ile aynı boyut */}
        <Link 
          href={`/kategori/${category.slug}`}
          className="hidden lg:flex flex-shrink-0 w-[280px] group relative z-20"
        >
          <div 
            className="relative w-full h-[640px] rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${bannerColors.from}18 0%, ${bannerColors.to}08 100%)`,
              border: `1px solid ${bannerColors.from}`,
            }}
          >
            {/* Opak arka plan katmanı - ürünler altına girerken şeffaflık olmasın */}
            <div 
              className="absolute inset-0 -z-10"
              style={{ background: '#060606' }}
            />
            
            {/* Gradient orb */}
            <div 
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-40"
              style={{ background: `radial-gradient(circle, ${bannerColors.from} 100%, transparent 0%)` }}
            />
            
            {/* Content */}
            <div className="relative h-full flex flex-col p-6">
              {/* Badge */}
              <div 
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[11px] font-semibold w-fit"
                style={{ 
                  background: `${bannerColors.from}30`,
                  color: bannerColors.from,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: bannerColors.from }} />
                <span>{category.products.length} Ürün</span>
              </div>

              {/* Title */}
              <div className="flex-1 flex flex-col justify-center py-4">
                <h4 className="text-xl font-bold text-white leading-snug mb-2">
                  {bannerTitle}
                </h4>
                <p className="text-xs text-white/50">
                  {bannerSubtitle}
                </p>
              </div>

              {/* CTA Button - Glassmorphism */}
              <div 
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-200 group-hover:scale-[1.02] group-hover:border-white/30"
                style={{ 
                  background: `${bannerColors.from}20`,
                }}
              >
                <span className="text-xs font-semibold text-white">{bannerButtonText}</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </Link>


        {/* Carousel Area */}
        <div className="flex-1 relative overflow-hidden" style={{ marginLeft: '-100px' }}>
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 h-[640px]"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", paddingLeft: '116px' }}
          >
            {displayProducts.map((product, idx) => (
              <div key={`${product.id}-${idx}`} className="flex-shrink-0 w-[280px] h-full">
                <ProductCard 
                  product={mapApiProductToCard(product)} 
                  priority={idx < 4}
                  className="h-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
