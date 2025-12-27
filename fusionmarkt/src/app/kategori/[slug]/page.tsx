/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Package,
  Filter,
  Mic,
  Store,
  X,
  SlidersHorizontal,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { mapApiProductToCard } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import FilterSidePanel from "@/components/filters/FilterSidePanel";
import { getFiltersByCategory } from "@/lib/filters/category-filters";

// ============================================
// INTERFACES
// ============================================
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  themeColor: string | null;
  parent: { id: string; name: string; slug: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc" | "bestseller";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "En Yeniler" },
  { value: "bestseller", label: "En Çok Satan" },
  { value: "price_asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "price_desc", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "name_asc", label: "İsim: A-Z" },
];

// Default theme color
const DEFAULT_THEME_COLOR = "#8B5CF6";

// ============================================
// GLASSMORPHISM BANNER COMPONENT
// ============================================
interface GlassBannerProps {
  themeColor: string;
  onFilterClick: () => void;
  onVoiceClick: () => void;
  isListening: boolean;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  sortOpen: boolean;
  setSortOpen: (open: boolean) => void;
  activeFilterCount: number;
}

function GlassBanner({ 
  themeColor, 
  onFilterClick, 
  onVoiceClick, 
  isListening,
  sortBy,
  onSortChange,
  sortOpen,
  setSortOpen,
  activeFilterCount,
}: GlassBannerProps) {
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

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

  return (
    <div className="relative z-10 w-full pt-[120px] pb-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className="relative rounded-xl backdrop-blur-md px-4 py-2.5 flex items-center gap-3"
          style={{
            background: `linear-gradient(90deg, ${themeColor}12 0%, ${themeColor}08 100%)`,
            border: `1px solid ${themeColor}25`,
          }}
        >
          {/* Shimmer Effect - Sadece Banner İçinde */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${themeColor}40 50%, transparent 100%)`,
                animation: 'banner-shimmer 2.5s ease-in-out infinite',
              }}
            />
          </div>

          {/* Mağaza Link - Sol */}
          <Link
            href="/magaza"
            className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Store className="w-4 h-4 text-white/80" />
            <span className="text-white/90 text-sm font-medium">Mağaza</span>
          </Link>

          {/* Filtre Button */}
          <button
            onClick={onFilterClick}
            className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-white/80" />
            <span className="text-white/90 text-sm font-medium">Filtre</span>
            {activeFilterCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full"
                style={{ backgroundColor: themeColor }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex-1" />

          {/* Sesli Ara - Orta/Sağ */}
          <button
            onClick={onVoiceClick}
            className={cn(
              "relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
              isListening ? "bg-red-500/20 animate-pulse" : "hover:bg-white/5"
            )}
          >
            <Mic className="w-4 h-4 text-white/80" />
            <span className="text-white/90 text-sm font-medium hidden sm:inline">
              {isListening ? "Okuyor..." : "Sesli Oku"}
            </span>
          </button>

          {/* Sırala Dropdown - Portal */}
          <div className="relative">
            <button
              ref={sortButtonRef}
              onClick={() => setSortOpen(!sortOpen)}
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-white/90 text-sm font-medium">Sırala</span>
              <ChevronDown className={cn("w-4 h-4 text-white/80 transition-transform duration-200", sortOpen && "rotate-180")} />
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
                        onSortChange(option.value);
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
        </div>
      </div>

      <style jsx>{`
        @keyframes banner-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ============================================
// FILTER TYPES FOR SIDE PANEL
// ============================================
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

// ============================================
// MAIN COMPONENT
// ============================================
export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const carouselRef = useRef<HTMLDivElement>(null);

  // Data State
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  // UI State
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "newest"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [sortOpen, setSortOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Filter State
  const [categoryFilters, setCategoryFilters] = useState<FilterGroup[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});
  const [rangeValues, setRangeValues] = useState<RangeValues>({});
  const [allProducts, setAllProducts] = useState<any[]>([]); // Tüm ürünler (filtreleme için)

  // Mobile Detection
  const [isMobile, setIsMobile] = useState(false);
  
  // Mobile carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const cardWidth = 296; // 280px card + 16px gap

  // Get theme color from category or use default
  const themeColor = category?.themeColor || DEFAULT_THEME_COLOR;

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch data - Tüm ürünleri al (client-side filtreleme için)
  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        // Tüm ürünleri çek (limit=200)
        const res = await fetch(
          `/api/public/categories/${slug}?page=1&limit=200&sort=${sortBy}`
        );
        if (res.ok) {
          const data = await res.json();
          setCategory(data.category);
          setAllProducts(data.products || []);
          setProducts(data.products || []);
          setPagination(data.pagination);
        } else {
          setCategory(null);
          setAllProducts([]);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [slug, sortBy]);

  // Load category-specific filters
  useEffect(() => {
    if (slug) {
      const filters = getFiltersByCategory(slug);
      setCategoryFilters(filters);
      // Reset selected filters when category changes
      setSelectedFilters({});
      setRangeValues({});
    }
  }, [slug]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: Ürünün teknik özellik değerini al
  // ═══════════════════════════════════════════════════════════════════════════
  const getProductFeatureValue = (product: any, featureSlug: string): string | null => {
    const featureValues = product.productFeatureValues || [];
    const feature = featureValues.find((fv: any) => fv.feature?.slug === featureSlug);
    if (!feature) return null;
    // valueText veya valueNumber'ı string olarak döndür
    const value = feature.valueText ?? feature.valueNumber;
    return value !== null && value !== undefined ? String(value) : null;
  };


  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT-SIDE FİLTRELEME MANTIĞI - TEKNİK ÖZELLİKLERDEN VERİ ÇEKİYOR
  // ═══════════════════════════════════════════════════════════════════════════
  const filteredProducts = useMemo(() => {
    if (Object.keys(selectedFilters).length === 0) {
      return allProducts;
    }

    return allProducts.filter((product: any) => {
      const productName = product.name?.toLowerCase() || "";
      const productDesc = product.description?.toLowerCase() || "";
      const productText = `${productName} ${productDesc}`;
      
      // Variant isimleri
      const variantNames = (product.variants || [])
        .map((v: any) => v.name?.toLowerCase() || "")
        .join(" ");

      // Her filtre grubu için kontrol
      for (const [filterId, values] of Object.entries(selectedFilters)) {
        if (!values || values.length === 0) continue;

        let matchFound = false;

        // ═══════════════════════════════════════════════════════════════════
        // BEDEN FİLTRESİ - Variant'larda ara (S/08, M/09, L/10, XL/11 eşleştirmesi)
        // ═══════════════════════════════════════════════════════════════════
        if (filterId === "size") {
          matchFound = values.some((sizeGroup: string) => {
            // Virgülle ayrılmış değerleri ayır (örn: "S,08" -> ["S", "08"])
            const sizes = sizeGroup.split(",").map(s => s.trim().toLowerCase());
            // Variant isimlerinde bu bedenlerden herhangi biri var mı?
            return sizes.some(size => variantNames.includes(size));
          });
        }
        // ═══════════════════════════════════════════════════════════════════
        // DOKUNMATIK EKRAN FİLTRESİ - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "touchscreen") {
          const featureValue = getProductFeatureValue(product, "dokunmatik-ekran-uyumlu");
          if (values.includes("true")) {
            matchFound = featureValue === "true";
          } else if (values.includes("false")) {
            matchFound = featureValue === "false" || featureValue === null;
          }
        }
        // ═══════════════════════════════════════════════════════════════════
        // KESİLME DİRENCİ FİLTRESİ - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "cut_resistance") {
          const featureValue = getProductFeatureValue(product, "kesim-seviyesi");
          matchFound = values.some((level: string) => {
            if (featureValue) {
              return String(featureValue).toUpperCase() === level.toUpperCase();
            }
            // Fallback: metin araması
            const upperLevel = level.toUpperCase();
            const patterns = [
              new RegExp(`kesim seviyesi ${upperLevel}(?:\\s|$|\\.|,)`, 'i'),
              new RegExp(`kesilme seviyesi ${upperLevel}(?:\\s|$|\\.|,)`, 'i'),
              new RegExp(`${upperLevel} seviye(?:\\s|$|\\.|,)`, 'i'),
              new RegExp(`level ${upperLevel}(?:\\s|$|\\.|,)`, 'i'),
            ];
            return patterns.some(p => p.test(productText));
          });
        }
        // ═══════════════════════════════════════════════════════════════════
        // MALZEME FİLTRESİ - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "material") {
          const featureValue = getProductFeatureValue(product, "kaplama");
          matchFound = values.some((mat: string) => {
            if (featureValue) {
              return String(featureValue).toLowerCase() === mat.toLowerCase();
            }
            // Fallback: metin araması
            const materialMap: Record<string, string[]> = {
              nitril: ["nitril", "nitrile"],
              pu: ["pu", "polyurethane"],
              latex: ["lateks", "latex"],
            };
            return (materialMap[mat] || [mat]).some(m => productText.includes(m.toLowerCase()));
          });
        }
        // ═══════════════════════════════════════════════════════════════════
        // KABLOSUZ ŞARJ FİLTRESİ - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "wireless_charging") {
          const featureValue = getProductFeatureValue(product, "kablosuz-sarj");
          if (values.includes("true")) {
            matchFound = featureValue === "true";
          } else if (values.includes("false")) {
            matchFound = featureValue === "false" || featureValue === null;
          }
        }
        // ═══════════════════════════════════════════════════════════════════
        // DAHİLİ FENER FİLTRESİ - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "builtin_flashlight") {
          const featureValue = getProductFeatureValue(product, "dahili-fener");
          if (values.includes("true")) {
            matchFound = featureValue === "true";
          } else if (values.includes("false")) {
            matchFound = featureValue === "false" || featureValue === null;
          }
        }
        // ═══════════════════════════════════════════════════════════════════
        // DAHİLİ POWERBANK FİLTRESİ - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "builtin_powerbank") {
          const featureValue = getProductFeatureValue(product, "dahili-powerbank");
          if (values.includes("true")) {
            matchFound = featureValue === "true";
          } else if (values.includes("false")) {
            matchFound = featureValue === "false" || featureValue === null;
          }
        }
        // ═══════════════════════════════════════════════════════════════════
        // AC ÇIKIŞ FİLTRESİ - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "ac_output") {
          const featureValue = getProductFeatureValue(product, "ac-cikis");
          if (values.includes("true")) {
            matchFound = featureValue === "true";
          } else if (values.includes("false")) {
            matchFound = featureValue === "false" || featureValue === null;
          }
        }
        // ═══════════════════════════════════════════════════════════════════
        // KAPASİTE FİLTRESİ (Wh) - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "capacity") {
          const capacityValue = getProductFeatureValue(product, "kapasite");
          const capacity = typeof capacityValue === 'number' ? capacityValue : parseFloat(String(capacityValue)) || 0;
          
          matchFound = values.some((range: string) => {
            if (range === "500-1000") return capacity >= 500 && capacity < 1000;
            if (range === "1000-1500") return capacity >= 1000 && capacity < 1500;
            if (range === "1500-2500") return capacity >= 1500 && capacity < 2500;
            if (range === "2500+") return capacity >= 2500;
            return false;
          });
        }
        // ═══════════════════════════════════════════════════════════════════
        // ÇIKIŞ GÜCÜ FİLTRESİ (W) - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "output_power") {
          const powerValue = getProductFeatureValue(product, "cikis-gucu");
          const power = typeof powerValue === 'number' ? powerValue : parseFloat(String(powerValue)) || 0;
          
          matchFound = values.some((range: string) => {
            if (range === "1000-2000") return power >= 1000 && power < 2000;
            if (range === "2000-3000") return power >= 2000 && power < 3000;
            if (range === "3000-5000") return power >= 3000 && power < 5000;
            if (range === "5000+") return power >= 5000;
            return false;
          });
        }
        // ═══════════════════════════════════════════════════════════════════
        // PANEL GÜCÜ FİLTRESİ (Güneş Panelleri) - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "panel_power") {
          const powerValue = getProductFeatureValue(product, "panel-gucu");
          const power = typeof powerValue === 'number' ? powerValue : parseFloat(String(powerValue)) || 0;
          
          matchFound = values.some((val: string) => {
            const targetPower = parseInt(val);
            return power === targetPower;
          });
        }
        // ═══════════════════════════════════════════════════════════════════
        // BASAMAK SAYISI FİLTRESİ (Merdivenler) - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "step_count") {
          const stepValue = getProductFeatureValue(product, "basamak-sayisi");
          const steps = typeof stepValue === 'number' ? stepValue : parseInt(String(stepValue)) || 0;
          
          matchFound = values.some((val: string) => {
            const targetSteps = parseInt(val);
            return steps === targetSteps;
          });
        }
        // ═══════════════════════════════════════════════════════════════════
        // MERDİVEN TİPİ FİLTRESİ - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "ladder_type") {
          const typeValue = getProductFeatureValue(product, "merdiven-tipi");
          matchFound = values.some((val: string) => {
            return String(typeValue).toLowerCase() === val.toLowerCase();
          });
        }
        // ═══════════════════════════════════════════════════════════════════
        // YALITKAN FİLTRESİ - Teknik özelliklerden çek
        // ═══════════════════════════════════════════════════════════════════
        else if (filterId === "insulated") {
          const featureValue = getProductFeatureValue(product, "yalitkan");
          if (values.includes("true")) {
            matchFound = featureValue === "true";
          } else if (values.includes("false")) {
            matchFound = featureValue === "false" || featureValue === null;
          }
        }
        // ═══════════════════════════════════════════════════════════════════
        // GENEL FİLTRE - Metin araması (fallback)
        // ═══════════════════════════════════════════════════════════════════
        else {
          matchFound = values.some((val: string) => 
            productText.includes(val.toLowerCase())
          );
        }

        // Eğer bu filtre grubu için eşleşme bulunamadıysa, ürünü filtrele
        if (!matchFound) {
          return false;
        }
      }

      return true;
    });
  }, [allProducts, selectedFilters]);

  // Filtrelenmiş ürünleri sayfalama için ayarla
  useEffect(() => {
    const startIndex = (currentPage - 1) * 12;
    const endIndex = startIndex + 12;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    setProducts(paginatedProducts);
    
    // Pagination bilgisini güncelle
    const totalPages = Math.ceil(filteredProducts.length / 12);
    setPagination(prev => prev ? {
      ...prev,
      totalProducts: filteredProducts.length,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    } : null);
  }, [filteredProducts, currentPage]);

  // Text-to-Speech Handler - Sesli Oku
  const handleReadAloud = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      alert("Tarayıcınız sesli okumayı desteklemiyor.");
      return;
    }

    const synth = window.speechSynthesis;

    // Eğer zaten okuyorsa durdur
    if (synth.speaking) {
      synth.cancel();
      setIsListening(false);
      return;
    }

    // Kategori bilgilerini oku
    const categoryName = category?.name || "Kategori";
    const productCount = products.length;
    
    const textToRead = `${categoryName} kategorisinde ${productCount} ürün bulunmaktadır. ${
      products.slice(0, 3).map(p => p.name).join(", ")
    }${products.length > 3 ? " ve daha fazlası" : ""}.`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "tr-TR";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsListening(true);
    utterance.onend = () => setIsListening(false);
    utterance.onerror = () => setIsListening(false);

    synth.speak(utterance);
  }, [category, products]);

  // URL helpers
  const updateURL = (newPage: number, newSort: SortOption) => {
    const p = new URLSearchParams();
    if (newPage > 1) p.set("page", String(newPage));
    if (newSort !== "newest") p.set("sort", newSort);
    router.push(`/kategori/${slug}${p.toString() ? `?${p.toString()}` : ""}`, { scroll: false });
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
    updateURL(1, newSort);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURL(newPage, sortBy);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    setCurrentPage(1);
    setFilterPanelOpen(false); // Paneli kapat
    // URL'den filtre parametrelerini kaldır
    const p = new URLSearchParams();
    if (sortBy !== "newest") p.set("sort", sortBy);
    router.push(`/kategori/${slug}${p.toString() ? `?${p.toString()}` : ""}`, { scroll: false });
  };

  const handleApplyFilters = () => {
    // Filtreleri uygula - sayfa 1'e dön
    setCurrentPage(1);
    setFilterPanelOpen(false); // Paneli kapat
    
    // URL'ye filtre parametrelerini ekle
    const p = new URLSearchParams();
    
    // Sayfa ve sıralama
    p.set("page", "1"); // Filtre değiştiğinde ilk sayfaya dön
    if (sortBy !== "newest") p.set("sort", sortBy);
    
    // Seçili filtreleri URL'ye ekle
    Object.entries(selectedFilters).forEach(([filterId, values]) => {
      if (values.length > 0) {
        p.set(`filter_${filterId}`, values.join(","));
      }
    });
    
    // Range değerlerini URL'ye ekle
    Object.entries(rangeValues).forEach(([filterId, { min, max }]) => {
      if (min > 0 || max > 0) {
        p.set(`range_${filterId}_min`, String(min));
        p.set(`range_${filterId}_max`, String(max));
      }
    });
    
    setCurrentPage(1);
    router.push(`/kategori/${slug}?${p.toString()}`, { scroll: false });
  };

  // Mobile carousel scroll
  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.8;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Touch/swipe handlers for mobile carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && currentIndex < products.length - 1) {
        goToIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        goToIndex(currentIndex - 1);
      }
    }
  };

  const goToIndex = (index: number) => {
    const scrollContainer = mobileScrollRef.current;
    if (!scrollContainer) return;
    
    const targetScroll = index * cardWidth;
    scrollContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    setCurrentIndex(index);
  };

  // Update currentIndex on scroll
  useEffect(() => {
    const scrollContainer = mobileScrollRef.current;
    if (!scrollContainer || !isMobile) return;

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < products.length) {
        setCurrentIndex(newIndex);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [isMobile, currentIndex, products.length]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${themeColor}40`, borderTopColor: themeColor }}
          />
          <span className="text-white/60">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Not found
  if (!category) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
          <Package className="w-12 h-12 text-white/30" />
        </div>
        <h1 className="text-2xl font-bold text-white">Kategori Bulunamadı</h1>
        <Link href="/magaza" className="px-6 py-3 rounded-xl bg-primary text-white font-medium">
          Mağazaya Git
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ============================================ */}
      {/* GLASSMORPHISM BANNER - Shimmer sadece içinde */}
      {/* ============================================ */}
      <GlassBanner 
        themeColor={themeColor}
        onFilterClick={() => setFilterPanelOpen(true)}
        onVoiceClick={handleReadAloud}
        isListening={isListening}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortOpen={sortOpen}
        setSortOpen={setSortOpen}
        activeFilterCount={Object.values(selectedFilters).filter(v => v.length > 0).length}
      />

      {/* ============================================ */}
      {/* FILTER SIDE PANEL */}
      {/* ============================================ */}
      <FilterSidePanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={categoryFilters}
        selectedFilters={selectedFilters}
        rangeValues={rangeValues}
        onFilterChange={handleFilterChange}
        onRangeChange={handleRangeChange}
        onClearAll={handleClearFilters}
        onApply={handleApplyFilters}
        themeColor={themeColor}
        categoryName={category?.name}
      />

      {/* ============================================ */}
      {/* PRODUCTS */}
      {/* ============================================ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {products.length > 0 ? (
          <>
            {/* MOBILE: Carousel with Swipe & Dots */}
            <div className="md:hidden relative">
              <div
                ref={mobileScrollRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
                style={{ 
                  scrollbarWidth: "none", 
                  msOverflowStyle: "none",
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {products.map((product, idx) => (
                  <div 
                    key={product.id} 
                    className="flex-shrink-0 w-[280px] snap-start"
                  >
                    <ProductCard product={mapApiProductToCard(product)} priority={idx < 4} />
                  </div>
                ))}
              </div>

              {/* Dot Indicators - themeColor based */}
              {products.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-4 pb-2">
                  {products.length <= 5 ? (
                    // Show all dots if 5 or fewer products
                    products.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToIndex(index)}
                        className="group relative p-1"
                        aria-label={`Ürün ${index + 1}`}
                      >
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            index === currentIndex
                              ? 'w-6'
                              : 'w-1.5 bg-white/30 group-hover:bg-white/50'
                          }`}
                          style={index === currentIndex ? { backgroundColor: themeColor } : {}}
                        />
                      </button>
                    ))
                  ) : (
                    // Show abbreviated dots if more than 5 products
                    [0, 1, 2].map((offset) => {
                      let dotIndex: number;
                      if (currentIndex <= 1) {
                        dotIndex = offset;
                      } else if (currentIndex >= products.length - 2) {
                        dotIndex = products.length - 3 + offset;
                      } else {
                        dotIndex = currentIndex - 1 + offset;
                      }
                      
                      return (
                        <button
                          key={dotIndex}
                          onClick={() => goToIndex(dotIndex)}
                          className="group relative p-1"
                          aria-label={`Ürün ${dotIndex + 1}`}
                        >
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              dotIndex === currentIndex
                                ? 'w-6'
                                : 'w-1.5 bg-white/30 group-hover:bg-white/50'
                            }`}
                            style={dotIndex === currentIndex ? { backgroundColor: themeColor } : {}}
                          />
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* DESKTOP: Grid - 4 ürün per satır */}
            <div className="hidden md:grid grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={mapApiProductToCard(product)} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 sm:mb-6">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white/30" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Bu kategoride ürün bulunamadı</h2>
            <p className="text-white/60 mb-6 text-sm sm:text-base">Henüz bu kategoriye ürün eklenmemiş.</p>
            <Link href="/magaza" className="px-6 py-3 rounded-xl bg-primary text-white font-medium">
              Tüm Ürünleri Gör
            </Link>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* PAGINATION - Hidden on mobile (dots used instead) */}
      {/* ============================================ */}
      {pagination && pagination.totalPages > 1 && (
        <div className="relative z-10 hidden md:flex items-center justify-center gap-1 sm:gap-2 py-6 sm:py-8 px-4">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className={cn(
              "flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-colors text-sm",
              pagination.hasPrevPage ? "border-white/10 text-white hover:bg-white/5" : "border-white/5 text-white/30 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Önceki</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showDots = prev && page - prev > 1;
                return (
                  <div key={page} className="flex items-center gap-1">
                    {showDots && <span className="px-1 sm:px-2 text-white/30 text-sm">...</span>}
                    <button
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-medium transition-colors text-sm",
                        page === currentPage ? "text-white" : "text-white/60 hover:bg-white/5"
                      )}
                      style={page === currentPage ? { backgroundColor: themeColor } : {}}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className={cn(
              "flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-colors text-sm",
              pagination.hasNextPage ? "border-white/10 text-white hover:bg-white/5" : "border-white/5 text-white/30 cursor-not-allowed"
            )}
          >
            <span className="hidden sm:inline">Sonraki</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* BACK BUTTON */}
      {/* ============================================ */}
      <div className="relative z-10 flex justify-center pb-12 sm:pb-16 px-4">
        <Link
          href="/magaza"
          className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-white/10 text-white/80 hover:bg-white/5 transition-colors text-sm sm:text-base"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Mağazaya Dön
        </Link>
      </div>
    </div>
  );
}
