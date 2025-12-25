/**
 * Checkout Types - FusionMarkt
 * Complete type definitions for checkout flow
 */

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export type AuthState = "guest" | "logged_in";
export type AddressState = "existing_selected" | "new_entered" | "guest_entered";
export type InvoiceType = "person" | "company";
export type ShippingMethod = "free" | "standard";
export type CouponState = "none" | "applying" | "applied" | "invalid";
export type PaymentMethod = "card_sipay" | "bank_transfer";
export type CheckoutStep = 1 | 2; // 1: Address, 2: Payment

// ═══════════════════════════════════════════════════════════════════════════
// ADDRESS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AddressFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  
  // Invoice type specific
  invoiceType: InvoiceType;
  tcKimlikNo?: string;       // Person (optional)
  taxNumber?: string;         // Company (required)
  taxOffice?: string;         // Company (required)
  companyName?: string;       // Company
  
  // Address
  country: string;
  city: string;
  district: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
  
  // Optional
  birthDate?: string;         // DD.MM.YYYY format
  orderNotes?: string;
  
  // For logged-in users
  saveAddress?: boolean;
  isDefaultAddress?: boolean;
}

export interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: "SHIPPING" | "BILLING" | "BOTH";
}

// ═══════════════════════════════════════════════════════════════════════════
// SHIPPING TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ShippingOption {
  id: ShippingMethod;
  label: string;
  price: number;
  description?: string;
  estimatedDays?: string;
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  { 
    id: "free", 
    label: "Ücretsiz Kargo", 
    price: 0, 
    description: "2-4 iş günü içinde teslimat",
    estimatedDays: "2-4 gün"
  },
  { 
    id: "standard", 
    label: "Standart Kargo", 
    price: 500, 
    description: "1-2 iş günü içinde teslimat",
    estimatedDays: "1-2 gün"
  },
];

export const FREE_SHIPPING_THRESHOLD = 3000; // TL

// ═══════════════════════════════════════════════════════════════════════════
// COUPON TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CouponData {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
}

export interface AppliedCoupon extends CouponData {
  calculatedDiscount: number; // Actual discount amount
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CardData {
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface BankTransferInfo {
  bankName: string;
  accountHolder: string;
  iban: string;
  description: string; // e.g., "Sipariş No: FM-12345"
}

export const BANK_TRANSFER_INFO: BankTransferInfo = {
  bankName: "Ziraat Bankası",
  accountHolder: "FusionMarkt Enerji Çözümleri Ltd. Şti.",
  iban: "TR00 0000 0000 0000 0000 0000 00",
  description: "Açıklama kısmına sipariş numaranızı yazınız.",
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ContractsAccepted {
  termsAndConditions: boolean;     // Web sitesi şartlar ve koşullar
  distanceSalesContract: boolean;  // Mesafeli satış sözleşmesi
  newsletter?: boolean;            // Haber bülteni (optional)
  reviewInvitation?: boolean;      // CusRev review invitation (optional)
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER ITEM TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CheckoutItem {
  id: string;
  productId: string;
  slug: string;
  title: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image?: string;
  variant?: {
    id: string;
    name: string;
    type: string;
    value: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TOTALS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CheckoutTotals {
  subtotal: number;           // Ürünlerin toplamı
  shipping: number;           // Kargo ücreti
  discount: number;           // İndirim tutarı (kupon vs.)
  taxIncluded: number;        // Dahil KDV tutarı
  grandTotal: number;         // Genel toplam
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKOUT STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface CheckoutState {
  // Current step
  currentStep: CheckoutStep;
  
  // Auth
  authState: AuthState;
  
  // Address
  addressState: AddressState;
  billingAddress: AddressFormData | null;
  shippingAddress: AddressFormData | null;
  useDifferentShippingAddress: boolean;
  selectedSavedAddressId: string | null;
  
  // Invoice
  invoiceType: InvoiceType;
  
  // Shipping
  shippingMethod: ShippingMethod;
  
  // Coupon
  couponState: CouponState;
  appliedCoupon: AppliedCoupon | null;
  couponError: string | null;
  
  // Payment
  paymentMethod: PaymentMethod;
  cardData: CardData | null;
  
  // Contracts
  contractsAccepted: ContractsAccepted;
  
  // Items & Totals
  items: CheckoutItem[];
  totals: CheckoutTotals;
  
  // UI State
  isSubmitting: boolean;
  errors: Record<string, string>;
  
  // Guest account creation
  createAccount: boolean;
  accountPassword?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER TYPES (for confirmation page)
// ═══════════════════════════════════════════════════════════════════════════

export type OrderStatus = "success" | "pending" | "failed";
export type PaymentStatus = "paid" | "pending" | "failed";

export interface OrderConfirmation {
  orderNumber: string;          // e.g., "FM-2024-12345"
  orderDate: string;            // ISO date
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  
  // Summary
  items: CheckoutItem[];
  totals: CheckoutTotals;
  
  // Addresses
  billingAddress: AddressFormData;
  shippingAddress: AddressFormData;
  
  // Bank transfer specific
  bankTransferInfo?: BankTransferInfo;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKOUT CONTEXT ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export type CheckoutAction =
  | { type: "SET_STEP"; payload: CheckoutStep }
  | { type: "SET_AUTH_STATE"; payload: AuthState }
  | { type: "SET_BILLING_ADDRESS"; payload: AddressFormData }
  | { type: "SET_SHIPPING_ADDRESS"; payload: AddressFormData }
  | { type: "SET_USE_DIFFERENT_SHIPPING"; payload: boolean }
  | { type: "SELECT_SAVED_ADDRESS"; payload: string }
  | { type: "SET_INVOICE_TYPE"; payload: InvoiceType }
  | { type: "SET_SHIPPING_METHOD"; payload: ShippingMethod }
  | { type: "APPLY_COUPON_START" }
  | { type: "APPLY_COUPON_SUCCESS"; payload: AppliedCoupon }
  | { type: "APPLY_COUPON_ERROR"; payload: string }
  | { type: "REMOVE_COUPON" }
  | { type: "SET_PAYMENT_METHOD"; payload: PaymentMethod }
  | { type: "SET_CARD_DATA"; payload: CardData }
  | { type: "SET_CONTRACT_ACCEPTED"; payload: Partial<ContractsAccepted> }
  | { type: "SET_CREATE_ACCOUNT"; payload: boolean }
  | { type: "SET_ACCOUNT_PASSWORD"; payload: string }
  | { type: "UPDATE_ITEM_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "SET_ITEMS"; payload: CheckoutItem[] }
  | { type: "RECALCULATE_TOTALS" }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_ERRORS"; payload: Record<string, string> }
  | { type: "CLEAR_ERRORS" }
  | { type: "RESET_CHECKOUT" };
