/**
 * Hesabım — paylaşılan tipler
 *
 * page.tsx'ten taşındı (plan 01 §7.2). Alan adları ve tipler birebir korunmuştur;
 * `/api/orders` ve `/api/user/*` yanıtlarının şeklini yansıtır.
 */

export interface UserType {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: string | null;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  id: string;
  /** Ürün katalogdan silinmişse `null` — şemada `productId String?`. */
  productId: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  variantInfo: { id?: string; name?: string; value?: string } | null;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    images: string[];
    brand?: string | null;
    isActive?: boolean;
  } | null;
}

export interface OrderAddress {
  id: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone: string;
  city: string;
  district?: string;
  address?: string;
  addressLine1?: string;
  postalCode?: string;
}

export interface StatusHistoryItem {
  type?: string;
  status?: string;
  date?: string;
  note?: string;
  contracts?: {
    termsAndConditions?: boolean;
    distanceSalesContract?: boolean;
    newsletter?: boolean;
    acceptedAt?: string;
    termsAndConditionsHTML?: string;
    distanceSalesContractHTML?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  trackingNumber: string | null;
  carrierName: string | null;
  invoiceUrl: string | null;
  invoiceUploadedAt: string | null;
  createdAt: string;
  paidAt: string | null;
  confirmedAt: string | null;
  preparingAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  couponCode?: string | null;
  items: OrderItem[];
  shippingAddress: OrderAddress | null;
  billingAddress: OrderAddress | null;
  customerNote: string | null;
  /**
   * Talep özetleri — `GET /api/orders` tek sorguda döndürüyor. Eskiden liste
   * ekranı her sipariş için iki ekstra istek atıyordu (N+1).
   */
  hasCancellationRequest?: boolean;
  cancellationStatus?: string | null;
  returnRequestCount?: number;
  hasPendingReturnRequest?: boolean;
  /**
   * Bu sipariş için reddedilmiş bir iade talebi var mı. Ret kesin olduğundan
   * açık talep kadar bağlayıcı — "İade talebi oluştur" butonunu kapatıyor.
   */
  hasRejectedReturnRequest?: boolean;
  /**
   * ⚠️ `GET /api/orders` bu alanı ARTIK DÖNDÜRMÜYOR (sipariş başına ~25 KB
   * sözleşme HTML'i taşıyordu). Yalnızca sözleşme uçları için tipte duruyor.
   */
  statusHistory?: StatusHistoryItem[];
}

export interface OrdersPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: OrdersPagination;
}

/** Pano sunucu verisi — favori/sepet context'ten geldiği için bunlara girmiyor. */
export interface AccountSummaryFetched {
  orders: number;
  addresses: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    total?: number;
    grandTotal?: number;
    items?: Array<{
      id?: string;
      product?: {
        thumbnail?: string | null;
        images?: string[];
      } | null;
    }>;
  }>;
}

export interface AddressData {
  id: string;
  title: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
}
