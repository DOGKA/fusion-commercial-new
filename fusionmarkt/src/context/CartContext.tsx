"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

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
}

interface CartContextType {
  // State
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  isAnimating: boolean;
  
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
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("fusionmarkt-cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("fusionmarkt-cart", JSON.stringify(items));
  }, [items]);

  // Calculate derived values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Add item with animation trigger
  const addItem = useCallback(async (newItem: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => {
    // Trigger animation
    setIsAnimating(true);
    
    // Simulate async operation (API call in real scenario)
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setItems((prevItems) => {
      // Check if item already exists (same product + variant)
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.variant?.id === newItem.variant?.id
      );

      if (existingIndex > -1) {
        // Update quantity
        const updated = [...prevItems];
        updated[existingIndex].quantity += newItem.quantity || 1;
        return updated;
      }

      // Add new item
      const cartItem: CartItem = {
        ...newItem,
        id: `${newItem.productId}-${newItem.variant?.id || "default"}-${Date.now()}`,
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
        isAnimating,
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
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
