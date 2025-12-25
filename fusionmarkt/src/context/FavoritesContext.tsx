"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

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

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("fusionmarkt-favorites");
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        setItems(parsed);
      } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
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
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
