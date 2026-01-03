"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from "react";

// Helper to get initial cart from localStorage (client-side only)
function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem("fusionmarkt-cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// CART TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CartItem {
  id: string;
  productId: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  quantity: number;
  image?: string;
  variant?: {
    id: string;
    name: string;
    type: string;
    value: string;
  };
  // Bundle/Paket ürün desteği
  isBundle?: boolean;
  bundleId?: string;
}

interface CartContextType {
  // State
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;           // Discounted total (what user pays)
  originalSubtotal: number;   // Original total (before product discounts)
  totalSavings: number;       // Total savings from product discounts
  isAnimating: boolean;
  isHydrated: boolean;        // True when cart is loaded from localStorage
  
  // Actions
  addItem: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => Promise<void>;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// CART PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  // Initialize from localStorage if available (runs once on mount)
  const [items, setItems] = useState<CartItem[]>(() => {
    // This will be [] on server, then hydrated on client
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrationRef = useRef(false);

  // Load cart from localStorage once on client mount
  useEffect(() => {
    if (!hydrationRef.current) {
      hydrationRef.current = true;
      const stored = getStoredCart();
      // Use queueMicrotask to avoid the setState in effect warning
      queueMicrotask(() => {
        if (stored.length > 0) {
          setItems(stored);
        }
        setIsHydrated(true);
      });
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("fusionmarkt-cart", JSON.stringify(items));
  }, [items]);

  // Calculate derived values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Original subtotal uses originalPrice if available, otherwise falls back to price
  const originalSubtotal = items.reduce((sum, item) => {
    const originalPrice = item.originalPrice ?? item.price;
    return sum + originalPrice * item.quantity;
  }, 0);
  const totalSavings = originalSubtotal - subtotal;

  // Add item with animation trigger (supports both products and bundles)
  const addItem = useCallback(async (newItem: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => {
    // Trigger animation
    setIsAnimating(true);
    
    // Simulate async operation (API call in real scenario)
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setItems((prevItems) => {
      // Check if item already exists
      // For bundles: check bundleId
      // For products: check productId + variant
      const existingIndex = prevItems.findIndex((item) => {
        if (newItem.isBundle && newItem.bundleId) {
          // Bundle: sadece bundleId'ye bak
          return item.isBundle && item.bundleId === newItem.bundleId;
        } else {
          // Normal ürün: productId + variant
          return (
            !item.isBundle &&
            item.productId === newItem.productId &&
            item.variant?.id === newItem.variant?.id
          );
        }
      });

      if (existingIndex > -1) {
        // Update quantity
        const updated = [...prevItems];
        updated[existingIndex].quantity += newItem.quantity || 1;
        return updated;
      }

      // Add new item
      const cartItem: CartItem = {
        ...newItem,
        id: newItem.isBundle 
          ? `bundle-${newItem.bundleId}-${Date.now()}`
          : `${newItem.productId}-${newItem.variant?.id || "default"}-${Date.now()}`,
        quantity: newItem.quantity || 1,
      };

      return [...prevItems, cartItem];
    });

    // Don't auto-open mini cart - only animate header badge
    // User can click header cart icon to open mini cart
    
    // Reset animation after delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  }, []);

  // Remove item
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Update quantity
  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, [removeItem]);

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Cart open/close
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        itemCount,
        subtotal,
        originalSubtotal,
        totalSavings,
        isAnimating,
        isHydrated,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SSG-SAFE DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const SSG_SAFE_CART_DEFAULTS: CartContextType = {
  items: [],
  isOpen: false,
  itemCount: 0,
  subtotal: 0,
  originalSubtotal: 0,
  totalSavings: 0,
  isAnimating: false,
  isHydrated: false,
  addItem: async () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK (SSG-SAFE)
// ═══════════════════════════════════════════════════════════════════════════

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  // SSG-safe: Return defaults during static generation instead of throwing
  if (context === undefined) {
    return SSG_SAFE_CART_DEFAULTS;
  }
  return context;
}
