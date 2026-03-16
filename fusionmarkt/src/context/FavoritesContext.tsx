"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from "react";

// Helper to get stored favorites
function getStoredFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem("fusionmarkt-favorites");
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
}

interface FavoritesContextType {
  // State
  items: FavoriteItem[];
  itemCount: number;
  isAnimating: boolean;
  
  // Actions
  addItem: (item: Omit<FavoriteItem, "id" | "addedAt">) => void;
  removeItem: (productId: string, variantId?: string) => void;
  toggleItem: (item: Omit<FavoriteItem, "id" | "addedAt">) => void;
  isFavorite: (productId: string, variantId?: string) => boolean;
  clearFavorites: () => void;
  moveToCart: (productId: string, variantId?: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// FAVORITES PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const hydrationRef = useRef(false);

  // Load favorites from localStorage on mount (using queueMicrotask to avoid setState in effect)
  useEffect(() => {
    if (!hydrationRef.current) {
      hydrationRef.current = true;
      const stored = getStoredFavorites();
      if (stored.length > 0) {
        queueMicrotask(() => setItems(stored));
      }
    }
  }, []);

  // Save favorites to localStorage on change
  useEffect(() => {
    localStorage.setItem("fusionmarkt-favorites", JSON.stringify(items));
  }, [items]);

  // Calculate derived values
  const itemCount = items.length;

  // Check if item is favorite
  const isFavorite = useCallback((productId: string, variantId?: string) => {
    return items.some(
      (item) => item.productId === productId && 
        (variantId ? item.variant?.id === variantId : !item.variant)
    );
  }, [items]);

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

    setItems((prev) => [...prev, favoriteItem]);
  }, [items]);

  // Remove item from favorites
  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems((prev) => prev.filter(
      (item) => !(item.productId === productId && 
        (variantId ? item.variant?.id === variantId : !item.variant))
    ));
  }, []);

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
  }, []);

  // Move item to cart (placeholder - needs cart context integration)
  const moveToCart = useCallback((productId: string, variantId?: string) => {
    // This will be implemented when integrating with CartContext
    console.log("Move to cart:", productId, variantId);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        items,
        itemCount,
        isAnimating,
        addItem,
        removeItem,
        toggleItem,
        isFavorite,
        clearFavorites,
        moveToCart,
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
  addItem: () => {},
  removeItem: () => {},
  toggleItem: () => {},
  isFavorite: () => false,
  clearFavorites: () => {},
  moveToCart: () => {},
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
