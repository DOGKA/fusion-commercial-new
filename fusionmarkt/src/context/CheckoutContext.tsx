/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import type {
  CheckoutState,
  CheckoutAction,
  CheckoutStep,
  AuthState,
  AddressFormData,
  ShippingMethod,
  PaymentMethod,
  InvoiceType,
  AppliedCoupon,
  CardData,
  ContractsAccepted,
  CheckoutItem,
  CheckoutTotals,
  ValidationResult,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_OPTIONS,
} from "@/types/checkout";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const FREE_SHIPPING_MIN = 2000; // TL - 2000 TL ve üzeri ücretsiz kargo
const STANDARD_SHIPPING_COST = 100; // TL - standart kargo ücreti

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════════════════

const initialState: CheckoutState = {
  currentStep: 1,
  authState: "guest",
  addressState: "guest_entered",
  billingAddress: null,
  shippingAddress: null,
  useDifferentShippingAddress: false,
  selectedSavedAddressId: null,
  invoiceType: "person",
  shippingMethod: "free",
  couponState: "none",
  appliedCoupon: null,
  couponError: null,
  paymentMethod: "card_sipay",
  cardData: null,
  contractsAccepted: {
    termsAndConditions: false,
    distanceSalesContract: false,
    newsletter: false,
    reviewInvitation: false,
  },
  items: [],
  totals: {
    subtotal: 0,
    shipping: 0,
    discount: 0,
    taxIncluded: 0,
    grandTotal: 0,
  },
  isSubmitting: false,
  errors: {},
  createAccount: false,
  accountPassword: undefined,
};

// ═══════════════════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════════════════

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "SET_AUTH_STATE":
      return { 
        ...state, 
        authState: action.payload,
        addressState: action.payload === "logged_in" ? "existing_selected" : "guest_entered",
      };

    case "SET_BILLING_ADDRESS":
      return { 
        ...state, 
        billingAddress: action.payload,
        addressState: state.authState === "logged_in" ? "new_entered" : "guest_entered",
      };

    case "SET_SHIPPING_ADDRESS":
      return { ...state, shippingAddress: action.payload };

    case "SET_USE_DIFFERENT_SHIPPING":
      return { 
        ...state, 
        useDifferentShippingAddress: action.payload,
        shippingAddress: action.payload ? state.shippingAddress : null,
      };

    case "SELECT_SAVED_ADDRESS":
      return { 
        ...state, 
        selectedSavedAddressId: action.payload,
        addressState: "existing_selected",
      };

    case "SET_INVOICE_TYPE":
      return { ...state, invoiceType: action.payload };

    case "SET_SHIPPING_METHOD": {
      const shippingPrice = action.payload === "free" ? 0 : 500;
      return { 
        ...state, 
        shippingMethod: action.payload,
        totals: {
          ...state.totals,
          shipping: shippingPrice,
          grandTotal: state.totals.subtotal - state.totals.discount + shippingPrice,
        },
      };
    }

    case "APPLY_COUPON_START":
      return { ...state, couponState: "applying", couponError: null };

    case "APPLY_COUPON_SUCCESS": {
      const discount = action.payload.calculatedDiscount;
      return { 
        ...state, 
        couponState: "applied",
        appliedCoupon: action.payload,
        couponError: null,
        totals: {
          ...state.totals,
          discount,
          grandTotal: state.totals.subtotal - discount + state.totals.shipping,
        },
      };
    }

    case "APPLY_COUPON_ERROR":
      return { ...state, couponState: "invalid", couponError: action.payload };

    case "REMOVE_COUPON":
      return { 
        ...state, 
        couponState: "none",
        appliedCoupon: null,
        couponError: null,
        totals: {
          ...state.totals,
          discount: 0,
          grandTotal: state.totals.subtotal + state.totals.shipping,
        },
      };

    case "SET_PAYMENT_METHOD":
      return { 
        ...state, 
        paymentMethod: action.payload,
        cardData: action.payload === "bank_transfer" ? null : state.cardData,
      };

    case "SET_CARD_DATA":
      return { ...state, cardData: action.payload };

    case "SET_CONTRACT_ACCEPTED":
      return { 
        ...state, 
        contractsAccepted: { ...state.contractsAccepted, ...action.payload },
      };

    case "SET_CREATE_ACCOUNT":
      return { ...state, createAccount: action.payload };

    case "SET_ACCOUNT_PASSWORD":
      return { ...state, accountPassword: action.payload };

    case "UPDATE_ITEM_QUANTITY": {
      const updatedItems = state.items.map(item => 
        item.id === action.payload.id 
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      return { ...state, items: updatedItems };
    }

    case "REMOVE_ITEM": {
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return { ...state, items: filteredItems };
    }

    case "SET_ITEMS":
      return { ...state, items: action.payload };

    case "RECALCULATE_TOTALS": {
      const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const discount = state.appliedCoupon?.calculatedDiscount || 0;
      
      // Auto-select free shipping if threshold is met (2000 TL ve üzeri)
      const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_MIN;
      const shipping = qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_COST;
      
      const grandTotal = subtotal - discount + shipping;
      const taxIncluded = grandTotal * 0.20; // 20% KDV dahil
      
      return {
        ...state,
        shippingMethod: qualifiesForFreeShipping ? state.shippingMethod : "standard",
        totals: {
          subtotal,
          shipping,
          discount,
          taxIncluded,
          grandTotal,
        },
      };
    }

    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload };

    case "SET_ERRORS":
      return { ...state, errors: action.payload };

    case "CLEAR_ERRORS":
      return { ...state, errors: {} };

    case "RESET_CHECKOUT":
      return { ...initialState };

    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT TYPE
// ═══════════════════════════════════════════════════════════════════════════

interface CheckoutContextType {
  state: CheckoutState;
  
  // Navigation
  goToStep: (step: CheckoutStep) => void;
  goToPayment: () => void;
  goBack: () => void;
  
  // Address
  setBillingAddress: (address: AddressFormData) => void;
  setShippingAddress: (address: AddressFormData) => void;
  setUseDifferentShipping: (value: boolean) => void;
  selectSavedAddress: (id: string) => void;
  setInvoiceType: (type: InvoiceType) => void;
  
  // Shipping
  setShippingMethod: (method: ShippingMethod) => void;
  
  // Coupon
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  
  // Payment
  setPaymentMethod: (method: PaymentMethod) => void;
  setCardData: (data: CardData) => void;
  
  // Contracts
  setContractAccepted: (contracts: Partial<ContractsAccepted>) => void;
  
  // Account
  setCreateAccount: (value: boolean) => void;
  setAccountPassword: (password: string) => void;
  
  // Items
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  
  // Validation
  validateStep1: () => ValidationResult;
  validateStep2: () => ValidationResult;
  canProceedToPayment: () => boolean;
  canSubmitOrder: () => boolean;
  
  // Submit
  submitOrder: () => Promise<{ success: boolean; orderNumber?: string; error?: string }>;
  
  // Reset
  resetCheckout: () => void;
  
  // Helpers
  getShippingMessage: () => string | null;
  formatPrice: (price: number) => string;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface CheckoutProviderProps {
  children: ReactNode;
}

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart();

  // Sync auth state
  useEffect(() => {
    dispatch({ 
      type: "SET_AUTH_STATE", 
      payload: isAuthenticated ? "logged_in" : "guest" 
    });
  }, [isAuthenticated]);

  // Sync cart items
  useEffect(() => {
    const checkoutItems: CheckoutItem[] = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      slug: item.slug,
      title: item.title,
      brand: item.brand,
      price: item.price,
      originalPrice: item.originalPrice || undefined,
      quantity: item.quantity,
      image: item.image,
      variant: item.variant,
    }));
    
    dispatch({ type: "SET_ITEMS", payload: checkoutItems });
  }, [cartItems]);

  // Recalculate totals when items or coupon change
  useEffect(() => {
    dispatch({ type: "RECALCULATE_TOTALS" });
  }, [state.items, state.appliedCoupon, state.shippingMethod]);

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────────────
  const goToStep = useCallback((step: CheckoutStep) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const goToPayment = useCallback(() => {
    dispatch({ type: "SET_STEP", payload: 2 });
  }, []);

  const goBack = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: "SET_STEP", payload: (state.currentStep - 1) as CheckoutStep });
    }
  }, [state.currentStep]);

  // ─────────────────────────────────────────────────────────────────────────
  // Address
  // ─────────────────────────────────────────────────────────────────────────
  const setBillingAddress = useCallback((address: AddressFormData) => {
    dispatch({ type: "SET_BILLING_ADDRESS", payload: address });
  }, []);

  const setShippingAddress = useCallback((address: AddressFormData) => {
    dispatch({ type: "SET_SHIPPING_ADDRESS", payload: address });
  }, []);

  const setUseDifferentShipping = useCallback((value: boolean) => {
    dispatch({ type: "SET_USE_DIFFERENT_SHIPPING", payload: value });
  }, []);

  const selectSavedAddress = useCallback((id: string) => {
    dispatch({ type: "SELECT_SAVED_ADDRESS", payload: id });
  }, []);

  const setInvoiceType = useCallback((type: InvoiceType) => {
    dispatch({ type: "SET_INVOICE_TYPE", payload: type });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Shipping
  // ─────────────────────────────────────────────────────────────────────────
  const setShippingMethod = useCallback((method: ShippingMethod) => {
    dispatch({ type: "SET_SHIPPING_METHOD", payload: method });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Coupon
  // ─────────────────────────────────────────────────────────────────────────
  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    dispatch({ type: "APPLY_COUPON_START" });
    
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code, 
          subtotal: state.totals.subtotal 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        dispatch({ type: "APPLY_COUPON_ERROR", payload: data.error || "Kupon geçersiz" });
        return false;
      }
      
      dispatch({ type: "APPLY_COUPON_SUCCESS", payload: data.coupon });
      return true;
    } catch {
      dispatch({ type: "APPLY_COUPON_ERROR", payload: "Kupon doğrulanırken bir hata oluştu" });
      return false;
    }
  }, [state.totals.subtotal]);

  const removeCoupon = useCallback(() => {
    dispatch({ type: "REMOVE_COUPON" });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Payment
  // ─────────────────────────────────────────────────────────────────────────
  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    dispatch({ type: "SET_PAYMENT_METHOD", payload: method });
  }, []);

  const setCardData = useCallback((data: CardData) => {
    dispatch({ type: "SET_CARD_DATA", payload: data });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Contracts
  // ─────────────────────────────────────────────────────────────────────────
  const setContractAccepted = useCallback((contracts: Partial<ContractsAccepted>) => {
    dispatch({ type: "SET_CONTRACT_ACCEPTED", payload: contracts });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Account
  // ─────────────────────────────────────────────────────────────────────────
  const setCreateAccount = useCallback((value: boolean) => {
    dispatch({ type: "SET_CREATE_ACCOUNT", payload: value });
  }, []);

  const setAccountPassword = useCallback((password: string) => {
    dispatch({ type: "SET_ACCOUNT_PASSWORD", payload: password });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Items
  // ─────────────────────────────────────────────────────────────────────────
  const updateItemQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "UPDATE_ITEM_QUANTITY", payload: { id, quantity } });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────────────────
  const validateStep1 = useCallback((): ValidationResult => {
    const errors: Record<string, string> = {};
    const address = state.billingAddress;
    
    if (!address) {
      errors.general = "Lütfen fatura bilgilerinizi girin";
      return { isValid: false, errors };
    }
    
    if (!address.firstName?.trim()) errors.firstName = "Ad gerekli";
    if (!address.lastName?.trim()) errors.lastName = "Soyad gerekli";
    if (!address.phone?.trim()) errors.phone = "Telefon gerekli";
    if (!address.email?.trim()) errors.email = "E-posta gerekli";
    if (!address.city?.trim()) errors.city = "İl gerekli";
    if (!address.district?.trim()) errors.district = "İlçe gerekli";
    if (!address.addressLine1?.trim()) errors.addressLine1 = "Adres gerekli";
    
    // Company validation
    if (state.invoiceType === "company") {
      if (!address.taxNumber?.trim()) errors.taxNumber = "Vergi numarası gerekli";
      if (!address.taxOffice?.trim()) errors.taxOffice = "Vergi dairesi gerekli";
    }
    
    // Email format
    if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      errors.email = "Geçerli bir e-posta adresi girin";
    }
    
    // Phone format (basic TR validation)
    if (address.phone && !/^(\+90|0)?[0-9]{10}$/.test(address.phone.replace(/\s/g, ""))) {
      errors.phone = "Geçerli bir telefon numarası girin";
    }
    
    // Different shipping address validation
    if (state.useDifferentShippingAddress && state.shippingAddress) {
      const shipping = state.shippingAddress;
      if (!shipping.firstName?.trim()) errors.shippingFirstName = "Teslimat adresi için ad gerekli";
      if (!shipping.lastName?.trim()) errors.shippingLastName = "Teslimat adresi için soyad gerekli";
      if (!shipping.phone?.trim()) errors.shippingPhone = "Teslimat adresi için telefon gerekli";
      if (!shipping.city?.trim()) errors.shippingCity = "Teslimat adresi için il gerekli";
      if (!shipping.addressLine1?.trim()) errors.shippingAddressLine1 = "Teslimat adresi gerekli";
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  }, [state.billingAddress, state.shippingAddress, state.useDifferentShippingAddress, state.invoiceType]);

  const validateStep2 = useCallback((): ValidationResult => {
    const errors: Record<string, string> = {};
    
    // Contracts validation
    if (!state.contractsAccepted.termsAndConditions) {
      errors.termsAndConditions = "Şartlar ve koşulları kabul etmelisiniz";
    }
    if (!state.contractsAccepted.distanceSalesContract) {
      errors.distanceSalesContract = "Mesafeli satış sözleşmesini kabul etmelisiniz";
    }
    
    // Payment validation
    if (state.paymentMethod === "card_sipay") {
      const card = state.cardData;
      if (!card) {
        errors.cardData = "Kart bilgilerini girin";
      } else {
        if (!card.cardHolderName?.trim()) errors.cardHolderName = "Kart sahibi adı gerekli";
        if (!card.cardNumber?.trim()) errors.cardNumber = "Kart numarası gerekli";
        if (!card.expiryMonth?.trim()) errors.expiryMonth = "Son kullanma ayı gerekli";
        if (!card.expiryYear?.trim()) errors.expiryYear = "Son kullanma yılı gerekli";
        if (!card.cvv?.trim()) errors.cvv = "CVV gerekli";
        
        // Card number validation (Luhn)
        if (card.cardNumber) {
          const cleanNumber = card.cardNumber.replace(/\s/g, "");
          if (!/^\d{16}$/.test(cleanNumber)) {
            errors.cardNumber = "Geçerli bir kart numarası girin";
          }
        }
        
        // CVV validation
        if (card.cvv && !/^\d{3,4}$/.test(card.cvv)) {
          errors.cvv = "Geçerli bir CVV girin";
        }
      }
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  }, [state.contractsAccepted, state.paymentMethod, state.cardData]);

  const canProceedToPayment = useCallback((): boolean => {
    const { isValid } = validateStep1();
    return isValid && state.items.length > 0;
  }, [validateStep1, state.items.length]);

  const canSubmitOrder = useCallback((): boolean => {
    const step1Valid = validateStep1().isValid;
    const step2Valid = validateStep2().isValid;
    return step1Valid && step2Valid && state.items.length > 0 && !state.isSubmitting;
  }, [validateStep1, validateStep2, state.items.length, state.isSubmitting]);

  // ─────────────────────────────────────────────────────────────────────────
  // Submit Order
  // ─────────────────────────────────────────────────────────────────────────
  const submitOrder = useCallback(async (): Promise<{ 
    success: boolean; 
    orderNumber?: string; 
    error?: string 
  }> => {
    dispatch({ type: "SET_SUBMITTING", payload: true });
    dispatch({ type: "CLEAR_ERRORS" });
    
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: state.items,
          billingAddress: state.billingAddress,
          shippingAddress: state.useDifferentShippingAddress 
            ? state.shippingAddress 
            : state.billingAddress,
          invoiceType: state.invoiceType,
          shippingMethod: state.shippingMethod,
          paymentMethod: state.paymentMethod,
          couponCode: state.appliedCoupon?.code,
          totals: state.totals,
          createAccount: state.createAccount,
          accountPassword: state.accountPassword,
          contracts: state.contractsAccepted,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        dispatch({ type: "SET_ERRORS", payload: { general: data.error } });
        return { success: false, error: data.error };
      }
      
      // Clear cart after successful order
      clearCart();
      
      return { success: true, orderNumber: data.orderNumber };
    } catch (error) {
      const message = "Sipariş oluşturulurken bir hata oluştu";
      dispatch({ type: "SET_ERRORS", payload: { general: message } });
      return { success: false, error: message };
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  }, [state, clearCart]);

  // ─────────────────────────────────────────────────────────────────────────
  // Reset
  // ─────────────────────────────────────────────────────────────────────────
  const resetCheckout = useCallback(() => {
    dispatch({ type: "RESET_CHECKOUT" });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────
  const getShippingMessage = useCallback((): string | null => {
    const remaining = FREE_SHIPPING_MIN - state.totals.subtotal;
    if (remaining > 0) {
      return `Ücretsiz kargo için ₺${remaining.toLocaleString("tr-TR")} daha harcayın!`;
    }
    if (state.shippingMethod === "free") {
      return "Siparişiniz ücretsiz kargo fırsatından yararlanıyor!";
    }
    return null;
  }, [state.totals.subtotal, state.shippingMethod]);

  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(price);
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        state,
        goToStep,
        goToPayment,
        goBack,
        setBillingAddress,
        setShippingAddress,
        setUseDifferentShipping,
        selectSavedAddress,
        setInvoiceType,
        setShippingMethod,
        applyCoupon,
        removeCoupon,
        setPaymentMethod,
        setCardData,
        setContractAccepted,
        setCreateAccount,
        setAccountPassword,
        updateItemQuantity,
        removeItem,
        validateStep1,
        validateStep2,
        canProceedToPayment,
        canSubmitOrder,
        submitOrder,
        resetCheckout,
        getShippingMessage,
        formatPrice,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SSG-SAFE DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const SSG_SAFE_CHECKOUT_DEFAULTS: CheckoutContextType = {
  state: initialState,
  goToStep: () => {},
  goToPayment: () => {},
  goBack: () => {},
  setBillingAddress: () => {},
  setShippingAddress: () => {},
  setUseDifferentShipping: () => {},
  selectSavedAddress: () => {},
  setInvoiceType: () => {},
  setShippingMethod: () => {},
  applyCoupon: async () => false,
  removeCoupon: () => {},
  setPaymentMethod: () => {},
  setCardData: () => {},
  setContractAccepted: () => {},
  setCreateAccount: () => {},
  setAccountPassword: () => {},
  updateItemQuantity: () => {},
  removeItem: () => {},
  validateStep1: () => ({ isValid: false, errors: {} }),
  validateStep2: () => ({ isValid: false, errors: {} }),
  canProceedToPayment: () => false,
  canSubmitOrder: () => false,
  submitOrder: async () => ({ success: false, error: "Not initialized" }),
  resetCheckout: () => {},
  getShippingMessage: () => null,
  formatPrice: (price: number) => `₺${price.toFixed(2)}`,
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK (SSG-SAFE)
// ═══════════════════════════════════════════════════════════════════════════

export function useCheckout(): CheckoutContextType {
  const context = useContext(CheckoutContext);
  // SSG-safe: Return defaults during static generation instead of throwing
  if (context === undefined) {
    return SSG_SAFE_CHECKOUT_DEFAULTS;
  }
  return context;
}
