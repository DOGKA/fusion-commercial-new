"use client";

/**
 * Favoriler — çift kaynaklı.
 *
 * Misafir kullanıcı `localStorage` kullanmaya devam eder (favori eklemek için
 * giriş zorunlu DEĞİL, mevcut davranış korunuyor). Oturum açıldığında liste
 * veritabanına taşınır ve o andan sonra tek doğruluk kaynağı `Wishlist`
 * tablosudur: cihaz değişince favoriler kaybolmaz, fiyat ve stok her istekte
 * üründen taze okunur.
 *
 * ⚠️ Göç tek yönlü. Sıra kritik: `localStorage` yalnızca sunucu BAŞARILI yanıt
 * verdikten sonra siliniyor. Ters sırada bir ağ hatası tüm favorileri
 * silerdi. Ayrıntılı akış: HESABIM-REVIZE-PLAN/04 §4.1.
 */

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";

const STORAGE_KEY = "fusionmarkt-favorites";
const MIGRATED_KEY = "fusionmarkt-favorites-migrated";

// Helper to get stored favorites
function getStoredFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FAVORITES TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface FavoriteItem {
  id: string;
  productId: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  image?: string;
  variant?: {
    id: string;
    name: string;
    type: string;
    value: string;
  };
  addedAt: number; // timestamp

  // ── Yalnızca oturumlu (veritabanı) modda dolu olan alanlar ──
  // Misafirde undefined kalırlar; onlara dayanan filtreler arayüzde gizlenir.
  /** Varyantlı favoride varyantın stoğu */
  stock?: number;
  isActive?: boolean;
  categoryId?: string;
  categoryName?: string;
  ratingAverage?: number | null;
  ratingCount?: number;
  /** Favoriye eklendiği andaki fiyat — "fiyatı düşenler" filtresi bunu kullanır */
  priceAtAdd?: number | null;
}

interface WishlistItemResponse {
  id: string;
  productId: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  stock: number;
  isActive: boolean;
  categoryId: string;
  categoryName: string;
  ratingAverage: number | null;
  ratingCount: number;
  variant: { id: string; name: string; type: string; value: string } | null;
  addedAt: string;
  priceAtAdd: number | null;
}

function fromResponse(item: WishlistItemResponse): FavoriteItem {
  return {
    id: item.id,
    productId: item.productId,
    slug: item.slug,
    title: item.title,
    brand: item.brand,
    price: item.price,
    originalPrice: item.originalPrice,
    image: item.image ?? undefined,
    variant: item.variant ?? undefined,
    addedAt: new Date(item.addedAt).getTime(),
    stock: item.stock,
    isActive: item.isActive,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    ratingAverage: item.ratingAverage,
    ratingCount: item.ratingCount,
    priceAtAdd: item.priceAtAdd,
  };
}

interface FavoritesContextType {
  // State
  items: FavoriteItem[];
  itemCount: number;
  isAnimating: boolean;
  /** İlk yükleme (veya göç) sürüyor */
  isLoading: boolean;
  /** true → liste veritabanından geliyor (stok/puan/kategori alanları dolu) */
  isSynced: boolean;
  error: string | null;

  // Actions
  addItem: (item: Omit<FavoriteItem, "id" | "addedAt">) => void;
  removeItem: (productId: string, variantId?: string) => void;
  toggleItem: (item: Omit<FavoriteItem, "id" | "addedAt">) => void;
  isFavorite: (productId: string, variantId?: string) => boolean;
  clearFavorites: () => void;
  /**
   * Favorideki ürünü sepete ekler; ürün favorilerde KALIR.
   *
   * Eski `moveToCart` yerine geldi: o fonksiyon yalnızca `console.log` basıyordu
   * ve hiçbir arayüz onu çağırmıyordu. "Taşı" yerine "ekle" seçilmesi bilinçli —
   * sepete eklenen ürünü sessizce favorilerden düşürmek beklenmedik olurdu.
   */
  addToCart: (productId: string, variantId?: string) => Promise<void>;
  reload: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// FAVORITES PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addItem: addToCartItem, openCart } = useCart();

  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hydrationRef = useRef(false);
  const syncedRef = useRef(false);

  // Yazma işlemleri hangi kaynağa gideceğini bu bayrakla seçiyor. State değil
  // ref: `addItem` gibi geri çağrılar arasında güncel değeri okumak gerekiyor.
  const isSynced = isAuthenticated && syncedRef.current;

  const fetchFromServer = useCallback(async () => {
    const res = await fetch("/api/user/wishlist");
    if (!res.ok) throw new Error("wishlist fetch failed");
    const data = await res.json();
    const list: WishlistItemResponse[] = Array.isArray(data.items) ? data.items : [];
    return list.map(fromResponse);
  }, []);

  /**
   * Oturum durumu netleştiğinde listeyi doğru kaynaktan doldurur.
   * Oturum varsa ve tarayıcıda taşınmamış favori duruyorsa önce göç eder.
   */
  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const run = async () => {
      setError(null);

      if (!isAuthenticated) {
        syncedRef.current = false;
        const stored = getStoredFavorites();
        if (!cancelled) {
          setItems(stored);
          setIsLoading(false);
          hydrationRef.current = true;
        }
        return;
      }

      setIsLoading(true);
      try {
        const stored = getStoredFavorites();
        const alreadyMigrated = localStorage.getItem(MIGRATED_KEY) === "1";

        if (stored.length > 0 && !alreadyMigrated) {
          const res = await fetch("/api/user/wishlist/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: stored.map((item) => ({
                productId: item.productId,
                variantId: item.variant?.id,
                addedAt: item.addedAt,
                priceAtAdd: item.priceAtAdd ?? undefined,
              })),
            }),
          });
          if (!res.ok) throw new Error("merge failed");
          const data = await res.json();
          const list: WishlistItemResponse[] = Array.isArray(data.items) ? data.items : [];

          // SIRA: önce başarılı yanıt, sonra silme.
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(MIGRATED_KEY, "1");

          if (!cancelled) {
            syncedRef.current = true;
            setItems(list.map(fromResponse));
          }
        } else {
          const list = await fetchFromServer();
          if (!cancelled) {
            syncedRef.current = true;
            setItems(list);
          }
        }
      } catch {
        // Sunucuya ulaşılamadıysa tarayıcıdaki liste gösterilmeye devam eder;
        // veri kaybı olmaz, yalnızca senkron olmayan bir liste görünür.
        if (!cancelled) {
          syncedRef.current = false;
          setItems(getStoredFavorites());
          setError("Beğendikleriniz şu anda güncellenemedi.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          hydrationRef.current = true;
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, fetchFromServer]);

  // Yalnızca misafir modda tarayıcıya yaz. Oturumlu modda yazmak, göçten sonra
  // silinen anahtarı hemen geri doldurup göçü anlamsız kılardı.
  useEffect(() => {
    if (!hydrationRef.current || isSynced) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isSynced]);

  // Calculate derived values
  const itemCount = items.length;

  // Check if item is favorite
  const isFavorite = useCallback((productId: string, variantId?: string) => {
    return items.some(
      (item) => item.productId === productId && 
        (variantId ? item.variant?.id === variantId : !item.variant)
    );
  }, [items]);

  const reload = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setItems(await fetchFromServer());
      setError(null);
    } catch {
      setError("Beğendikleriniz şu anda güncellenemedi.");
    }
  }, [isAuthenticated, fetchFromServer]);

  // Add item to favorites
  const addItem = useCallback((newItem: Omit<FavoriteItem, "id" | "addedAt">) => {
    // Check if already exists
    const exists = items.some(
      (item) => item.productId === newItem.productId && 
        item.variant?.id === newItem.variant?.id
    );

    if (exists) return;

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    const favoriteItem: FavoriteItem = {
      ...newItem,
      id: `${newItem.productId}-${newItem.variant?.id || "default"}-${Date.now()}`,
      addedAt: Date.now(),
    };

    // İyimser ekleme: kalp anında dolsun. Sunucu yanıtı listeyi tazeliyor.
    setItems((prev) => [...prev, favoriteItem]);

    if (!isSynced) return;

    void (async () => {
      try {
        const res = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: newItem.productId,
            variantId: newItem.variant?.id,
          }),
        });
        if (!res.ok) throw new Error("add failed");
        const data = await res.json();
        const list: WishlistItemResponse[] = Array.isArray(data.items) ? data.items : [];
        setItems(list.map(fromResponse));
      } catch {
        // İyimser eklemeyi geri al.
        void reload();
      }
    })();
  }, [items, isSynced, reload]);

  // Remove item from favorites
  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems((prev) => prev.filter(
      (item) => !(item.productId === productId && 
        (variantId ? item.variant?.id === variantId : !item.variant))
    ));

    if (!isSynced) return;

    void (async () => {
      try {
        const query = new URLSearchParams({ productId });
        if (variantId) query.set("variantId", variantId);
        const res = await fetch(`/api/user/wishlist?${query.toString()}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("remove failed");
        const data = await res.json();
        const list: WishlistItemResponse[] = Array.isArray(data.items) ? data.items : [];
        setItems(list.map(fromResponse));
      } catch {
        void reload();
      }
    })();
  }, [isSynced, reload]);

  // Toggle item in favorites
  const toggleItem = useCallback((item: Omit<FavoriteItem, "id" | "addedAt">) => {
    const exists = isFavorite(item.productId, item.variant?.id);
    if (exists) {
      removeItem(item.productId, item.variant?.id);
    } else {
      addItem(item);
    }
  }, [isFavorite, addItem, removeItem]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setItems([]);
    if (!isSynced) return;
    void (async () => {
      try {
        const res = await fetch("/api/user/wishlist?all=1", { method: "DELETE" });
        if (!res.ok) throw new Error("clear failed");
      } catch {
        void reload();
      }
    })();
  }, [isSynced, reload]);

  /** Favorideki ürünü sepete ekler; favori listede kalır. */
  const addToCart = useCallback(
    async (productId: string, variantId?: string) => {
      const item = items.find(
        (candidate) =>
          candidate.productId === productId &&
          (variantId ? candidate.variant?.id === variantId : !candidate.variant)
      );
      if (!item) return;

      await addToCartItem({
        productId: item.productId,
        slug: item.slug,
        title: item.title,
        brand: item.brand,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        variant: item.variant,
      });

      openCart();
    },
    [items, addToCartItem, openCart]
  );

  return (
    <FavoritesContext.Provider
      value={{
        items,
        itemCount,
        isAnimating,
        isLoading,
        isSynced,
        error,
        addItem,
        removeItem,
        toggleItem,
        isFavorite,
        clearFavorites,
        addToCart,
        reload,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SSG-SAFE DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const SSG_SAFE_FAVORITES_DEFAULTS: FavoritesContextType = {
  items: [],
  itemCount: 0,
  isAnimating: false,
  isLoading: false,
  isSynced: false,
  error: null,
  addItem: () => {},
  removeItem: () => {},
  toggleItem: () => {},
  isFavorite: () => false,
  clearFavorites: () => {},
  addToCart: async () => {},
  reload: async () => {},
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK (SSG-SAFE)
// ═══════════════════════════════════════════════════════════════════════════

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  // SSG-safe: Return defaults during static generation instead of throwing
  if (context === undefined) {
    return SSG_SAFE_FAVORITES_DEFAULTS;
  }
  return context;
}
