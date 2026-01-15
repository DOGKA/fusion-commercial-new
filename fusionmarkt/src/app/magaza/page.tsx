"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
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
import BundleProductCard, { BundleProduct } from "@/components/ui/BundleProductCard";
import { mapApiProductToCard } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import WaveMesh from "@/components/ui/WaveMesh";
import ParticleField from "@/components/three/ParticleField";
import { useMysteryBox } from "@/context/MysteryBoxContext";
import FilterSidePanel from "@/components/filters/FilterSidePanel";
import { getAllFilters } from "@/lib/filters/category-filters";
import { isOnSale, isNewProduct } from "@/lib/badge-config";
import { useTransformCarousel } from "@/hooks/useTransformCarousel";
import CarouselNavButtons from "@/components/ui/CarouselNavButtons";

// Hydration-safe mounted check (same approach as `ThemeToggle`)
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

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

interface ProductWithCategory extends Omit<Product, 'badges'> {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  createdAt?: string;
  comparePrice?: number | null;
  saleEndDate?: string | null;
  productBadges?: ApiProductBadge[];
  // Bundle-specific fields (when isBundle is true)
  isBundle?: boolean;
  totalValue?: number;
  savings?: number;
  savingsPercent?: number;
  shortDescription?: string | null;
  stock?: number;
  items?: {
    id: string;
    quantity: number;
    product?: {
      id: string;
      name: string;
      slug: string;
      thumbnail: string | null;
      price: number;
    } | null | undefined;
  }[];
  itemCount?: number;
  freeShipping?: boolean;
  badges?: { id: string; name: string; color: string; textColor?: string | null; icon?: string | null }[];
  videoUrl?: string;
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
  videoUrl?: string;
}

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  themeColor?: string | null;
  isActive?: boolean;
}

interface ApiBundleBadge {
  id: string;
  name: string;
  color: string;
  textColor?: string | null;
  icon?: string | null;
}

interface ApiBundle {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  totalValue?: number;
  thumbnail?: string | null;
  images?: string[];
  brand?: string | null;
  stock?: number;
  itemCount?: number;
  items?: {
    id: string;
    quantity: number;
    product?: {
      id: string;
      name: string;
      slug: string;
      thumbnail: string | null;
      price: number;
    } | null;
  }[];
  isBundle?: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  savings?: number;
  savingsPercent?: number;
  shortDescription?: string | null;
  createdAt?: string;
  badges?: ApiBundleBadge[];
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
  // IMPORTANT: We do NOT rely on Tailwind `dark:` variants here because the app
  // theme is driven by `next-themes` + CSS variables, and `dark:` variants are
  // inconsistent in some environments (e.g. incognito).
  const { resolvedTheme } = useTheme();
  const mounted = useIsMounted();
  const isDark = mounted && resolvedTheme === "dark";

  const [banner, setBanner] = useState<Banner | null>(null);
  const [categoryBanners, setCategoryBanners] = useState<Record<string, Banner>>({});
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2000);
  
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

  // Fetch all categories, products AND bundles
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories, products, bundles and shipping settings in parallel
        const [categoriesRes, productsRes, bundlesRes, shippingRes] = await Promise.all([
          fetch("/api/public/categories"),
          fetch("/api/public/products?limit=100"),
          fetch("/api/public/bundles?limit=100"),
          fetch("/api/public/shipping/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [] }),
          }).catch(() => null),
        ]);

        // Get free shipping threshold from shipping API
        let threshold = 2000; // Default
        if (shippingRes && shippingRes.ok) {
          const shippingData = await shippingRes.json();
          threshold = shippingData.freeShippingThreshold || 2000;
        }
        setFreeShippingThreshold(threshold);

        const categoryMap = new Map<string, CategoryWithProducts>();

        // First, add ALL active categories from API (even empty ones)
        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          const apiCategories = (catData.categories || catData || []) as ApiCategory[];
          
          apiCategories.forEach((cat: ApiCategory) => {
            if (cat.isActive !== false) { // Only active categories
              categoryMap.set(cat.id, {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                themeColor: cat.themeColor || null,
                products: [],
              });
            }
          });
        }

        // Process products and add to their categories
        if (productsRes.ok) {
          const data = await productsRes.json();
          const apiProducts = (data.products || []) as ApiProduct[];

          apiProducts.forEach((product: ApiProduct) => {
            const catId = product.categoryId || "uncategorized";
            const catName = product.category?.name || "Diğer";
            const catSlug = product.category?.slug || "diger";
            const catThemeColor = product.category?.themeColor || null;

            const stockQty = product.stock || 0;
            const productPrice = Number(product.price) || 0;
            const productWithCategory = {
              id: product.id,
              title: product.title || product.name,
              name: product.name,
              slug: product.slug,
              price: productPrice,
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
              isBundle: false,
              videoUrl: product.videoUrl, // Videolu ürün etiketi için
              // freeShipping artık mapApiProductToCard içinde hesaplanıyor
            };

            // Create category if not exists (fallback)
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
        }

        // Process bundles and add to their categories
        if (bundlesRes.ok) {
          const bundleData = await bundlesRes.json();
          const apiBundles = (bundleData.bundles || []) as ApiBundle[];

          apiBundles.forEach((bundle: ApiBundle) => {
            // Bundle'ın kategorisini al (API'den tek category objesi dönüyor)
            const catId = bundle.category?.id || "bundle-category";
            const catName = bundle.category?.name || "Bundle / Paket Ürünler";
            const catSlug = bundle.category?.slug || "bundle-paket-urunler";

            const stockQty = bundle.stock || 0;
            const totalValue = bundle.totalValue || bundle.comparePrice || bundle.price;
            const bundlePrice = Number(bundle.price) || 0;
            const savings = totalValue > bundlePrice ? totalValue - bundlePrice : 0;
            const savingsPercent = totalValue > bundlePrice ? Math.round((savings / totalValue) * 100) : 0;
            
            const bundleAsProduct = {
              id: bundle.id,
              title: bundle.name,
              name: bundle.name,
              slug: bundle.slug,
              price: bundlePrice,
              originalPrice: totalValue,
              discountPercent: savingsPercent || undefined,
              brand: bundle.brand || "",
              stockStatus: (stockQty > 10 ? "in_stock" : stockQty > 0 ? "low_stock" : "out_of_stock") as "in_stock" | "low_stock" | "out_of_stock",
              stockQuantity: stockQty,
              stock: stockQty,
              image: bundle.thumbnail,
              images: bundle.images || [bundle.thumbnail].filter(Boolean),
              categoryId: catId,
              categoryName: catName,
              categorySlug: catSlug,
              createdAt: bundle.createdAt,
              comparePrice: totalValue,
              saleEndDate: null,
              productBadges: [],
              isBundle: true,
              // Bundle-specific fields for BundleProductCard
              shortDescription: bundle.shortDescription || null,
              totalValue: totalValue,
              savings: savings,
              savingsPercent: savingsPercent,
              items: bundle.items || [],
              itemCount: bundle.itemCount || (bundle.items?.length || 0),
              freeShipping: bundlePrice >= threshold,
              badges: bundle.badges || [],
            };

            // Create category if not exists (fallback)
            if (!categoryMap.has(catId)) {
              categoryMap.set(catId, {
                id: catId,
                name: catName,
                slug: catSlug,
                themeColor: "#8B5CF6", // Purple theme for bundles
                products: [],
              });
            }
            categoryMap.get(catId)!.products.push(bundleAsProduct as ProductWithCategory);
          });
        }

        // Filter out empty categories and sort by product count
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
    <div className="min-h-screen bg-background relative">
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
        <ParticleField className="opacity-5 dark:opacity-15" particleCount={40} color="currentColor" />
      </div>

      {/* Content */}
      <div className="relative z-10">
      {/* BANNER */}
      <section style={{ paddingTop: "120px" }} className="container">
        <div className="relative overflow-hidden rounded-2xl border border-border">
          {banner?.buttonLink ? (
            <Link href={banner.buttonLink} className="block group">
              <BannerImage banner={banner} isDark={isDark} />
            </Link>
          ) : (
            <BannerImage banner={banner} isDark={isDark} />
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TOOLBAR - Nano Banana Design - Wave Mesh Glassmorphism
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="container" style={{ marginTop: "48px", marginBottom: "48px" }}>
        <div className="relative">
          {/* Main Toolbar Container - Glassmorphism with Wave Mesh */}
          <div 
            className="relative rounded-[20px] border border-border bg-background/95 dark:bg-background/80 backdrop-blur-xl shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden isolate"
            style={{
              // iOS-like Squircle smoothing fix
              clipPath: "inset(0px round 20px)" 
            }}
          >
            {/* Wave Mesh Background Animation */}
            <div className="absolute inset-0 -z-10">
              <WaveMesh color={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"} opacity={1} />
            </div>
            
            {/* Very subtle vignette for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.05)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.2)_100%)] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 px-4 py-4 lg:px-6 lg:py-5">
              {/* Desktop / Tablet: tek satır */}
              <div className="store-toolbar-content flex items-center gap-3 lg:gap-4 flex-wrap md:flex-nowrap">
                
                {/* Filter Button */}
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="store-filter-button flex items-center gap-2.5 px-4 lg:px-5 h-[42px] rounded-xl bg-glass-bg hover:bg-glass-bg-hover border border-glass-border hover:border-glass-border-hover text-foreground-secondary hover:text-foreground transition-all duration-200 whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtre</span>
                </button>

                {/* Search */}
                <div className="store-search-container flex-1 min-w-[200px] lg:min-w-[280px] relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ürün ara..."
                    className="w-full h-[42px] pl-11 pr-12 rounded-xl bg-glass-bg hover:bg-glass-bg-hover focus:bg-glass-bg-active border border-glass-border focus:border-glass-border-active text-sm text-foreground placeholder:text-foreground-muted outline-none transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-glass-bg-hover rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-foreground-tertiary" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    ref={sortButtonRef}
                    onClick={() => setSortOpen(!sortOpen)}
                    className="store-sort-button flex items-center gap-2 px-4 h-[42px] rounded-xl bg-glass-bg hover:bg-glass-bg-hover border border-glass-border hover:border-glass-border-hover text-foreground-secondary hover:text-foreground transition-all duration-200 whitespace-nowrap"
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
                        className="fixed z-[9999] w-56 rounded-2xl border shadow-2xl overflow-hidden"
                        style={{ 
                          top: dropdownPos.top,
                          right: dropdownPos.right,
                          background: isDark ? 'rgba(18, 18, 18, 0.85)' : 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.15)',
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
                                ? isDark 
                                  ? "bg-white/[0.08] text-white font-medium"
                                  : "bg-black/[0.05] text-black font-medium"
                                : isDark
                                  ? "text-white/70 hover:bg-white/[0.04] hover:text-white"
                                  : "text-black/70 hover:bg-black/[0.03] hover:text-black"
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
                      className={cn(
                        "store-coupon-button flex items-center gap-2 px-4 h-[42px] transition-all duration-200 whitespace-nowrap group",
                        // Light: text black, Dark: keep emerald-white styling
                        isDark ? "text-emerald-50" : "text-foreground"
                      )}
                    >
                      <span className={cn("coupon-code font-semibold text-sm tracking-wide", isDark ? "text-emerald-50" : "text-foreground")}>
                        {coupon.code}
                      </span>
                      <span className={cn("coupon-dot font-medium text-sm", isDark ? "text-emerald-400" : "text-foreground")}>•</span>
                      <span className={cn("coupon-amount text-sm font-medium", isDark ? "text-emerald-300" : "text-foreground")}>
                        {coupon.discountType === "percentage" 
                          ? `${coupon.discountValue}%` 
                          : `₺${coupon.discountValue}`
                        }
                      </span>
                      <span className={cn("coupon-label text-sm font-medium", isDark ? "text-emerald-300" : "text-foreground")}>İndirim</span>
                      <div className={cn("coupon-divider w-px h-4 mx-1", isDark ? "bg-emerald-400/30" : "bg-border")} />
                      <Info className={cn("coupon-info w-4 h-4 transition-colors", isDark ? "text-emerald-400/70 group-hover:text-emerald-400" : "text-foreground-muted group-hover:text-foreground")} />
                    </button>
                  ) : canOpen ? (
                    /* Kutu açılabilir - Süpriz Kutu butonu */
                    <button
                      onClick={openModal}
                      className={cn(
                        "store-coupon-button flex items-center gap-2 px-4 h-[42px] transition-all duration-200 whitespace-nowrap group",
                        // Light theme: make label black as requested
                        isDark ? "text-emerald-50" : "text-foreground"
                      )}
                    >
                      <span className={cn("font-semibold text-sm tracking-wide", isDark ? "text-emerald-50" : "text-foreground")}>
                        Süpriz Kutu
                      </span>
                      <span className={cn("font-medium text-sm", isDark ? "text-emerald-400" : "text-foreground")}>•</span>
                      <span className={cn("text-sm font-medium", isDark ? "text-emerald-300" : "text-foreground")}>Aç</span>
                      <div className={cn("w-px h-4 mx-1", isDark ? "bg-emerald-400/30" : "bg-border")} />
                      <Info className={cn("w-4 h-4 transition-colors", isDark ? "text-emerald-400/70 group-hover:text-emerald-400" : "text-foreground-muted group-hover:text-foreground")} />
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
            <Loader2 className="w-8 h-8 text-foreground-muted animate-spin" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="container text-center py-20">
            <p className="text-foreground-muted">Ürün bulunamadı.</p>
          </div>
        ) : (
          <div>
            {filteredCategories.map((category, idx) => (
              <div key={category.id} style={{ marginTop: idx > 0 ? "100px" : "0" }}>
                <CategoryCarousel 
                  category={category} 
                  bannerData={categoryBanners[category.slug]}
                  isDark={isDark}
                  freeShippingThreshold={freeShippingThreshold}
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
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-5 bg-background border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Filtreler</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-2 rounded-xl hover:bg-glass-bg-hover transition-colors"
              >
                <X className="w-5 h-5 text-foreground-tertiary" />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-border bg-glass-bg p-5">
                <p className="text-sm text-foreground-tertiary">Filtreler yakında eklenecek.</p>
              </div>
            </div>

            <div className="sticky bottom-0 p-5 bg-background border-t border-border">
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
function BannerImage({ banner, isDark }: { banner: Banner | null; isDark: boolean }) {
  const hasImage = !!(banner?.desktopImage || banner?.mobileImage);
  const hasContent = !!(banner?.title || banner?.subtitle || banner?.buttonText);

  // Requirement: Light = white/teal/white, Dark = black/teal/black
  // Do NOT rely on Tailwind `dark:` variants; use `isDark`.
  const lightGradient =
    "linear-gradient(90deg, rgb(248, 250, 252) 0%, rgb(20, 184, 166) 50%, rgb(248, 250, 252) 100%)";
  const darkGradient = "linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(20, 184, 166) 50%, rgb(0, 0, 0) 100%)";
  const bg = isDark ? darkGradient : lightGradient;

  return (
    <div className="relative h-[100px] sm:h-[140px] lg:h-[180px] rounded-2xl overflow-hidden border border-border" style={{ background: bg }}>
      {/* Background Image */}
      {hasImage && (
        <>
          {banner?.mobileImage && (
            <Image
              src={banner.mobileImage}
              alt={banner?.name || "Banner"}
              fill
              className={cn("sm:hidden object-cover", !isDark && "opacity-90")}
              sizes="100vw"
            />
          )}
          {banner?.desktopImage && (
            <Image
              src={banner.desktopImage}
              alt={banner?.name || "Banner"}
              fill
              className={cn("hidden sm:block object-cover", !banner?.mobileImage && "block", !isDark && "opacity-90")}
              sizes="100vw"
            />
          )}
        </>
      )}

      {/* Readability veil in dark */}
      {isDark && <div className="absolute inset-0 bg-black/25 pointer-events-none" />}

      {/* Content */}
      {hasContent && (
        <div className="absolute inset-0 flex items-end p-4 sm:p-5 lg:p-6">
          <div className="flex-1">
            {banner?.title && (
              <h3 className={cn("text-sm sm:text-base lg:text-lg font-semibold mb-1 relative", isDark ? "text-white" : "text-gray-900 drop-shadow-sm")}>
                {banner.title}
              </h3>
            )}
            {banner?.subtitle && (
              <p className={cn("text-xs sm:text-sm mb-2 line-clamp-1 relative", isDark ? "text-white/80" : "text-gray-700")}>
                {banner.subtitle}
              </p>
            )}
          </div>
          {banner?.buttonText && (
            <span
              className={cn(
                "inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium backdrop-blur-sm rounded-xl transition-colors relative",
                isDark
                  ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  : "bg-white/80 text-gray-900 border border-gray-200 hover:bg-white shadow-sm"
              )}
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
          <span className={cn("text-sm", isDark ? "text-white/50" : "text-gray-500")}>SHOP_HEADER banner ekleyin</span>
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
  bannerData,
  isDark,
  freeShippingThreshold,
}: { 
  category: CategoryWithProducts; 
  bannerData?: Banner;
  isDark: boolean;
  freeShippingThreshold: number;
}) {
  const [isMobile, setIsMobile] = useState(false);
  
  // Use CSS Transform carousel hook - ultra-smooth GPU scrolling
  const { 
    containerRef, 
    wrapperRef, 
    containerStyle, 
    wrapperStyle, 
    handlers,
    scrollBy,
    pauseAutoScroll,
    resumeAutoScroll,
  } = useTransformCarousel({
    autoScroll: category.products.length > 0,
    autoScrollSpeed: 40, // px/sn - yavaş & akıcı
    pauseOnHover: true,
    pauseDuration: 3000,
    friction: 0.95,
  });

  // Mobile check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Dynamic repeat for 360° infinite scroll - ensures enough items to scroll
  // Minimum 12 cards to guarantee scrollWidth > containerWidth on all screens
  const minCardsNeeded = 12;
  const productCount = category.products.length;
  const repeatCount = productCount > 0 ? Math.max(3, Math.ceil(minCardsNeeded / productCount)) : 3;
  const displayProducts = Array(repeatCount).fill(category.products).flat();

  return (
    <div className="container">
      {/* Mobile Category Header - Only visible on mobile */}
      {isMobile && (
        <div className="flex items-center justify-between mb-4 px-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            <h3 className="text-lg font-bold text-foreground">{bannerTitle}</h3>
          </div>
          <Link 
            href={`/kategori/${category.slug}`}
            className="flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: themeColor }}
          >
            <span>Tümünü Gör</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Desktop Navigation Buttons - Above carousel, aligned right */}
      <div className="hidden lg:flex justify-end mb-3">
        <CarouselNavButtons
          scrollBy={scrollBy}
          pauseAutoScroll={pauseAutoScroll}
          resumeAutoScroll={resumeAutoScroll}
          scrollAmount={296}
          theme="dynamic"
          themeColor={themeColor}
        />
      </div>
      
      {/* Carousel with LEFT Banner - Başlık yok, banner'da var */}
      <div className="relative flex gap-0">
        {/* LEFT Banner - Tek Link, içinde Light ve Dark theme versiyonları */}
        <Link 
          href={`/kategori/${category.slug}`}
          className="hidden lg:flex flex-shrink-0 w-[280px] group relative z-20"
        >
          <div
            className="relative w-full h-[640px] rounded-2xl overflow-hidden"
            style={{
              border: `1px solid var(--border)`,
              backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
            }}
          >
            {/* Color gradient overlay (metalik) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isDark
                  ? `linear-gradient(145deg, ${bannerColors.from}40 0%, ${bannerColors.from}25 30%, ${bannerColors.from}10 50%, transparent 70%)`
                  : `linear-gradient(145deg, ${bannerColors.from}50 0%, ${bannerColors.from}35 30%, ${bannerColors.from}18 50%, transparent 70%)`,
              }}
            />

            {/* Right-side fade: Light=white, Dark=black */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isDark
                  ? "linear-gradient(to left, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 30%, rgba(10,10,10,0.3) 60%, transparent 100%)"
                  : "linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.3) 60%, transparent 100%)",
              }}
            />

            {/* Metallic shine */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.15) 25%, transparent 50%, rgba(255,255,255,0.08) 75%, transparent 100%)"
                  : "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.5) 25%, transparent 50%, rgba(255,255,255,0.3) 75%, transparent 100%)",
                opacity: isDark ? 0.3 : 0.4,
              }}
            />

            {/* Gradient orb */}
            <div
              className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl"
              style={{ background: bannerColors.from, opacity: isDark ? 0.45 : 0.45 }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col p-6">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[11px] font-semibold w-fit"
                style={{
                  background: `${bannerColors.from}${isDark ? "25" : "20"}`,
                  color: bannerColors.from,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: bannerColors.from }} />
                <span>{category.products.length} Ürün</span>
              </div>

              {/* Title */}
              <div className="flex-1 flex flex-col justify-center py-4">
                <h4 className={cn("text-xl font-bold leading-snug mb-2", isDark ? "text-white" : "text-gray-900")}>
                  {bannerTitle}
                </h4>
                <p className={cn("text-xs", isDark ? "text-white/60" : "text-gray-600")}>{bannerSubtitle}</p>
              </div>

              {/* CTA Button */}
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl backdrop-blur-sm transition-all duration-200 group-hover:scale-[1.02]",
                  isDark ? "border border-white/20 bg-white/10 hover:bg-white/20" : "border border-gray-200 bg-white/70 hover:bg-white/90"
                )}
              >
                <span className={cn("text-xs font-semibold", isDark ? "text-white" : "text-gray-900")}>{bannerButtonText}</span>
                <ChevronRight className={cn("w-4 h-4", isDark ? "text-white" : "text-gray-900")} />
              </div>
            </div>
          </div>
        </Link>

        {/* Carousel Area - 360° infinite scroll with CSS Transform */}
        <div className="flex-1 relative overflow-hidden" style={{ marginLeft: isMobile ? '0' : '-100px' }}>
          {/* Container - viewport */}
          <div
            ref={containerRef}
            style={{ 
              ...containerStyle, 
              paddingLeft: isMobile ? '16px' : '116px',
              paddingRight: isMobile ? '16px' : '0',
            }}
            className="pb-4 pt-1"
          >
            {/* Wrapper - content moves via transform */}
            <div
              ref={wrapperRef}
              style={{ ...wrapperStyle, gap: '16px' }}
              {...handlers}
              className="flex items-stretch"
            >
              {displayProducts.map((product: ProductWithCategory, idx: number) => (
                <div 
                  key={`${product.id}-${idx}`} 
                  className="flex-shrink-0 w-[280px]"
                >
                  {product.isBundle ? (
                    <BundleProductCard 
                      bundle={{
                        id: String(product.id),
                        slug: product.slug,
                        name: product.title,
                        price: product.price,
                        totalValue: product.totalValue || product.originalPrice || product.price,
                        savings: product.savings || 0,
                        savingsPercent: product.savingsPercent || 0,
                        thumbnail: product.image,
                        stock: product.stock || product.stockQuantity || 0,
                        items: product.items || [],
                        itemCount: product.itemCount || 0,
                        ratingAverage: product.ratingAverage,
                        ratingCount: product.ratingCount,
                        freeShipping: product.freeShipping,
                        badges: product.badges || [],
                        videoLabel: product.videoUrl ? "Videolu Ürün" : undefined,
                      } as BundleProduct}
                      priority={idx < 4}
                    />
                  ) : (
                    <ProductCard 
                      product={mapApiProductToCard(product, freeShippingThreshold)} 
                      priority={idx < 4}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
