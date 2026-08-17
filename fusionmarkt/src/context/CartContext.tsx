"use client";

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode, useRef } from "react";
import { useSession } from "next-auth/react";
import { trackAddToCartConversion } from "@/lib/ads-conversions";

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
  // Bundle içindeki ürünlerin seçilen varyantları
  // { productId: { variantId, variantName, variantValue } }
  bundleItemVariants?: Record<string, {
    variantId: string;
    variantName: string;
    variantValue: string;
    productName: string;
  }>;
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
  updateItemPrice: (productId: string, newPrice: number, variantId?: string) => void;
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

  // ═════════════════════════════════════════════════════════════════════════
  // SUNUCU TARAFI SEPET KOPYASI
  // ═════════════════════════════════════════════════════════════════════════
  // Sepetin kaynağı localStorage olmaya devam ediyor. Bu senkron yalnızca
  // sunucuda bir kopya bırakıyor; admin panelindeki "Terk Edilmiş Sepetler"
  // ekranı ve hatırlatma e-postaları o kopyayı okuyor. Sunucudan istemciye geri
  // yükleme (cihazlar arası sepet) YOK — o yüzden bu akış tek yönlü.
  const { status: sessionStatus } = useSession();
  const lastSyncedPayloadRef = useRef<string | null>(null);

  useEffect(() => {
    // Hidrasyon bitmeden çalışırsa items henüz [] olduğu için sunucudaki kayıt
    // silinirdi.
    if (!isHydrated) return;
    // Misafir sepeti sunucuya yazılmıyor: Cart.userId zorunlu.
    if (sessionStatus !== "authenticated") return;

    const payload = JSON.stringify({
      items: items
        .map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          isBundle: item.isBundle === true,
          variantLabel: item.variant
            ? `${item.variant.name}: ${item.variant.value}`
            : undefined,
        }))
        // Sıra sabitleniyor: yalnızca içerik değiştiğinde istek atmak için
        // yükün karşılaştırılabilir olması gerekiyor.
        .sort((a, b) => a.productId.localeCompare(b.productId)),
    });

    if (lastSyncedPayloadRef.current === payload) return;

    // Sepeti boş olan kullanıcı için her sayfa açılışında boşuna istek
    // atmıyoruz. Sepeti sonradan boşaltmak yine senkronlanıyor, çünkü o anda
    // referans dolu oluyor.
    if (items.length === 0 && lastSyncedPayloadRef.current === null) {
      lastSyncedPayloadRef.current = payload;
      return;
    }

    // Adet butonuna üst üste basmak her tıklamada istek üretmesin.
    const timer = setTimeout(() => {
      lastSyncedPayloadRef.current = payload;
      fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      })
        .then((res) => {
          // Başarısızsa işareti geri alıyoruz ki sonraki değişiklikte tekrar
          // denensin. Sepet deneyimi bu isteğe bağlı değil, sessizce geçiyoruz.
          if (!res.ok) lastSyncedPayloadRef.current = null;
        })
        .catch(() => {
          lastSyncedPayloadRef.current = null;
        });
    }, 1500);

    return () => clearTimeout(timer);
  }, [items, isHydrated, sessionStatus]);

  // Calculate derived values — tek geçişte, yalnızca `items` değişince.
  const { itemCount, subtotal, originalSubtotal, totalSavings } = useMemo(() => {
    let count = 0;
    let sub = 0;
    let original = 0;
    for (const item of items) {
      count += item.quantity;
      sub += item.price * item.quantity;
      original += (item.originalPrice ?? item.price) * item.quantity;
    }
    return {
      itemCount: count,
      subtotal: sub,
      originalSubtotal: original,
      totalSavings: original - sub,
    };
  }, [items]);

  // Add item with animation trigger (supports both products and bundles)
  const addItem = useCallback(async (newItem: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => {
    setIsAnimating(true);
    
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

    // Sepete eklemenin tek geçiş noktası burası: ürün kartı butonu, güç
    // hesaplayıcı, favorilerden sepete taşıma ve yeniden sipariş akışlarının
    // hepsi addItem'ı çağırıyor, dolayısıyla dönüşüm tek yerden ölçülüyor.
    // Konum bilinçli: sepet güncellendikten SONRA, ama setItems
    // güncelleyicisinin DIŞINDA. Güncelleyicinin içi StrictMode'da iki kez
    // çalışıyor ve dönüşüm iki kez sayılırdı.
    trackAddToCartConversion({
      productId: newItem.productId,
      title: newItem.title,
      price: newItem.price,
      quantity: newItem.quantity || 1,
      variantId: newItem.variant?.id,
      isBundle: newItem.isBundle,
      bundleId: newItem.bundleId,
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

  const updateItemPrice = useCallback((productId: string, newPrice: number, variantId?: string) => {
    setItems((prev) =>
      prev.map((item) => {
        const match = item.productId === productId && (!variantId || item.variant?.id === variantId);
        return match ? { ...item, price: newPrice } : item;
      })
    );
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Cart open/close
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  // Değer nesnesi memoize edilmezse her provider render'ı tüm `useCart()`
  // tüketicilerini (Header, MiniCart, 2200 satırlık checkout sayfası) yeniden
  // render ettiriyor — adres formunda her tuşa basışta tam sayfa render demek.
  const value = useMemo<CartContextType>(
    () => ({
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
      updateItemPrice,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    }),
    [
      items, isOpen, itemCount, subtotal, originalSubtotal, totalSavings,
      isAnimating, isHydrated, addItem, removeItem, updateQuantity,
      updateItemPrice, clearCart, openCart, closeCart, toggleCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
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
  updateItemPrice: () => {},
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
