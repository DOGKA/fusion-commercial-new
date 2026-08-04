"use client";

/**
 * Favorilerim (hesap içi yüzey) — plan 04 §4'ün uygulanmış hali.
 *
 * Eski görünümden farkları:
 *  - Liste yerine ızgara; kartta sepete ekleme ve "fiyatı düştü" göstergesi var
 *  - Arama + sıralama + filtre çipleri
 *  - "Tekrar al" sayfası (teslim edilmiş siparişlerden tekilleştirilmiş ürünler)
 *  - "Temizle" artık onay istiyor (eskiden tek tıkla tüm liste siliniyordu)
 *  - Fiyat/stok artık favoriye eklendiği andaki değer değil, güncel değer
 *
 * Stok ve "fiyatı düşenler" filtreleri yalnızca oturumlu modda görünür: misafir
 * listesi `localStorage`'dan geldiği için o alanlar bilinmiyor ve olmayan
 * veriye dayanan bir filtre sessizce yanlış sonuç üretirdi.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, RotateCcw, Search, Trash2 } from "lucide-react";
import { useFavorites, type FavoriteItem } from "@/context/FavoritesContext";
import {
  AccountConfirmDialog,
  AccountEmptyState,
  AccountErrorState,
  AccountSkeleton,
} from "../../_components/shared";
import { useReorder } from "../../_lib/useReorder";
import { useReorderProducts, type ReorderProduct } from "../_lib/useReorderProducts";
import FavoriteCard from "./FavoriteCard";
import ReorderCard from "./ReorderCard";

type Tab = "FAVORITES" | "REORDER";
type Sort = "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "NAME";

const SORT_LABELS: Record<Sort, string> = {
  NEWEST: "Yeni eklenenler",
  PRICE_ASC: "Fiyat: artan",
  PRICE_DESC: "Fiyat: azalan",
  NAME: "İsme göre (A-Z)",
};

const GRID = "grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4";

// Arama ve sıralama kutuları aynı ölçüde kalsın diye tek yerde: mobilde 44px
// dokunma hedefi, masaüstünde 40px.
const FIELD_BOX = "min-h-[44px] lg:min-h-[40px] rounded-lg text-[13px]";
const FOCUS_RING = "focus:border-[color:var(--acc-accent-border)]";

export default function AccountFavoritesView({
  initialItems,
  view = "FAVORITES",
}: {
  /**
   * Sunucuda çekilen favoriler (F2-45). Context hâlâ yüklenirken ilk boyamada
   * gösterilir; yazma işlemleri context senkron olunca açılır. Misafir
   * localStorage akışına dokunulmuyor — o yalnızca oturumsuzda.
   */
  initialItems?: FavoriteItem[] | null;
  /** Sidebar'da ayrılan Beğendiklerim / Tekrar Al sayfasının içeriği. */
  view?: Tab;
}) {
  const {
    items: contextItems,
    removeItem,
    clearFavorites,
    addToCart,
    isLoading,
    isSynced,
    error,
    reload,
  } = useFavorites();

  // Context çözülene kadar sunucu listesi; çözülünce context öne geçer
  // (merge sonrası güncel liste orada).
  const items = isLoading && initialItems ? initialItems : contextItems;
  const showSkeleton = isLoading && !initialItems;

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("NEWEST");
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyPriceDrop, setOnlyPriceDrop] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  // Hook sırası her görünümde aynı kalır; sipariş isteği yalnız "Tekrar Al"
  // görünümünde etkinleştirilir.
  const reorderProducts = useReorderProducts(view === "REORDER");

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr");
    let list = items.filter((item) => {
      if (needle) {
        const haystack = `${item.title} ${item.brand}`.toLocaleLowerCase("tr");
        if (!haystack.includes(needle)) return false;
      }
      if (onlyDiscounted && !(item.originalPrice != null && item.originalPrice > item.price)) {
        return false;
      }
      if (onlyInStock && !(item.stock == null || item.stock > 0)) return false;
      if (onlyPriceDrop && !(item.priceAtAdd != null && item.priceAtAdd > item.price)) {
        return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "PRICE_ASC":
          return a.price - b.price;
        case "PRICE_DESC":
          return b.price - a.price;
        case "NAME":
          return a.title.localeCompare(b.title, "tr");
        case "NEWEST":
        default:
          return b.addedAt - a.addedAt;
      }
    });

    return list;
  }, [items, query, sort, onlyDiscounted, onlyInStock, onlyPriceDrop]);

  const filtersActive = onlyDiscounted || onlyInStock || onlyPriceDrop || query.trim() !== "";

  return (
    <div>
      {view === "FAVORITES" ? (
        <>
          {error && (
            <p
              role="status"
              className="acc-chip-warning mb-3 block px-3 py-2 rounded-lg text-[12px]"
            >
              {error}{" "}
              <button
                type="button"
                onClick={() => void reload()}
                className="account-inline-link underline"
              >
                Tekrar dene
              </button>
            </p>
          )}

          {showSkeleton ? (
            <div className={GRID}>
              {Array.from({ length: 8 }).map((_, i) => (
                <AccountSkeleton key={i} variant="card" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <AccountEmptyState
              icon={Heart}
              title="Henüz beğendiğiniz ürün yok"
              description="Beğendiğiniz ürünleri kalp simgesiyle buraya ekleyebilirsiniz."
              action={{ label: "Ürünleri keşfet", href: "/magaza" }}
            />
          ) : (
            <>
              {/* Mobilde iki satır: arama tek başına üstte, sıralama ile
                  "Temizle" altta yan yana. Üçü de alt alta tam genişlik
                  olduğunda araç çubuğu listeden daha uzun yer kaplıyordu.
                  Masaüstünde tek satır — `sm:flex-row` uzun süredir
                  uygulanmıyordu, `layout.css` katman dışından `flex-col`u
                  dayattığı için (KN-A). */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                <div className="relative min-w-0 flex-1">
                  <label htmlFor="favorites-search" className="sr-only">
                    Beğendiklerimde ara
                  </label>
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
                    aria-hidden="true"
                  />
                  <input
                    id="favorites-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Beğendiklerimde ara"
                    className={`w-full ${FIELD_BOX} pl-9 pr-3 bg-glass-bg border border-border text-foreground placeholder:text-foreground-disabled ${FOCUS_RING}`}
                  />
                </div>

                <div className="flex min-w-0 items-center gap-2">
                  <div className="relative min-w-0 flex-1 sm:flex-none">
                    <label htmlFor="favorites-sort" className="sr-only">
                      Sıralama
                    </label>
                    <select
                      id="favorites-sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as Sort)}
                      className={`w-full ${FIELD_BOX} appearance-none bg-background border border-border pl-3 pr-9 text-foreground ${FOCUS_RING} cursor-pointer`}
                    >
                      {(Object.keys(SORT_LABELS) as Sort[]).map((value) => (
                        <option key={value} value={value}>
                          {SORT_LABELS[value]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted"
                      aria-hidden="true"
                    />
                  </div>

                  {/* "Temizle" tüm listeyi siliyor ama arama ve sıralamayla eşit
                      görsel ağırlıktaydı; kullanıcı onu bir filtre sanabiliyordu.
                      Dinlenme hâlinde en sönük öğe, yıkıcı olduğunu hover ve
                      odakta kırmızıya dönerek söylüyor. */}
                  <button
                    type="button"
                    onClick={() => setClearOpen(true)}
                    className="account-btn inline-flex shrink-0 items-center justify-center gap-1.5 min-h-[40px] px-3 bg-transparent border border-border text-foreground-secondary rounded-full text-[12px] font-medium transition-colors hover:border-[color:var(--acc-danger-border)] hover:bg-[color:var(--acc-danger-bg)] hover:text-[color:var(--acc-danger-fg)]"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    Temizle
                  </button>
                </div>
              </div>

              <div
                role="group"
                aria-label="Beğenilen ürün filtreleri"
                className={`mb-4 grid w-full gap-2 ${
                  isSynced ? "grid-cols-3" : "grid-cols-1"
                }`}
              >
                <FilterChip
                  active={onlyDiscounted}
                  onClick={() => setOnlyDiscounted((v) => !v)}
                  label="İndirimli"
                  ariaLabel="İndirimdekiler"
                />
                {isSynced && (
                  <>
                    <FilterChip
                      active={onlyInStock}
                      onClick={() => setOnlyInStock((v) => !v)}
                      label="Stokta"
                      ariaLabel="Stokta olanlar"
                    />
                    <FilterChip
                      active={onlyPriceDrop}
                      onClick={() => setOnlyPriceDrop((v) => !v)}
                      label="Fiyatı düşen"
                      ariaLabel="Fiyatı düşenler"
                    />
                  </>
                )}
              </div>

              {visible.length === 0 ? (
                <AccountEmptyState
                  icon={Search}
                  title="Sonuç bulunamadı"
                  description="Aramanızı veya filtrelerinizi değiştirmeyi deneyin."
                  action={
                    filtersActive
                      ? {
                          label: "Filtreleri temizle",
                          onClick: () => {
                            setQuery("");
                            setOnlyDiscounted(false);
                            setOnlyInStock(false);
                            setOnlyPriceDrop(false);
                          },
                        }
                      : undefined
                  }
                />
              ) : (
                <div className={GRID}>
                  {visible.map((item) => (
                    <FavoriteCard
                      key={item.id}
                      item={item}
                      onRemove={removeItem}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <ReorderTab {...reorderProducts} />
      )}

      <AccountConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          clearFavorites();
          setClearOpen(false);
        }}
        tone="danger"
        title="Beğendiklerimi temizle"
        description={`${items.length} ürün beğendiklerinizden çıkarılacak. Bu işlem geri alınamaz.`}
        confirmLabel="Tümünü çıkar"
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  ariaLabel?: string;
}) {
  return (
    // `.account-chip` aktif görünümü `aria-pressed="true"` üzerinden çözüyor;
    // sipariş filtreleriyle aynı çip dili (plan 07 §K-3).
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className="account-chip favorites-filter-chip"
    >
      {label}
    </button>
  );
}

/** Teslim edilmiş veya iptal edilmiş siparişlerden tekrar alınabilir ürünler. */
function ReorderTab({
  products,
  loading,
  error,
  reload,
}: ReturnType<typeof useReorderProducts>) {
  const { reorder, busyItemId } = useReorder();

  const handleReorder = (product: ReorderProduct) => {
    void reorder({
      id: product.id,
      quantity: product.quantity,
      price: product.purchasedPrice,
      variantInfo: product.variantInfo,
      product: { slug: product.slug },
    });
  };

  if (loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 8 }).map((_, i) => (
          <AccountSkeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (error) return <AccountErrorState message={error} onRetry={reload} />;

  if (products.length === 0) {
    return (
      <AccountEmptyState
        icon={RotateCcw}
        title="Tekrar alınabilecek ürün yok"
        description="Teslim edilen veya iptal edilen siparişlerinizdeki ürünler burada listelenir."
        action={{ label: "Siparişlerime git", href: "/hesabim/siparisler" }}
      />
    );
  }

  return (
    <>
      <p className="mb-3 text-[12px] text-foreground-muted">
        Teslim aldığınız veya iptal ettiğiniz siparişlerdeki ürünler. Fiyatlar sepete
        eklerken güncel haliyle alınır.{" "}
        <Link
          href="/hesabim/siparisler"
          className="account-inline-link underline hover:text-foreground"
        >
          Tüm siparişlerim
        </Link>
      </p>
      <div className={GRID}>
        {products.map((product) => (
          <ReorderCard
            key={`${product.productId}-${product.variantInfo?.id ?? ""}`}
            product={product}
            busy={busyItemId === product.id}
            onReorder={handleReorder}
          />
        ))}
      </div>
    </>
  );
}
