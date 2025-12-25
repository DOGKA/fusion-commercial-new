"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock,
  RefreshCw, User, MapPin, FileText, Save, Upload, Trash2,
  Copy, Check, AlertCircle, ChevronDown, ExternalLink
} from "lucide-react";

// Frontend URL for avatar images (cross-app)
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3003";

// Helper to get full avatar URL
const getAvatarUrl = (image: string | null | undefined): string | null => {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  // Müşteri avatarları - frontend'de kayıtlı (/storage/users/)
  if (image.startsWith("/storage/users/")) {
    return `${FRONTEND_URL}${image}`;
  }
  // Admin avatarları - admin panelde (/storage/avatars/) - lokal kal
  return image;
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  subtotal: number;
  variantInfo: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    images: string[];
    sku: string | null;
  };
}

interface Address {
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

interface Order {
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
  customerNote: string | null;
  adminNote: string | null;
  createdAt: string;
  paidAt: string | null;
  confirmedAt: string | null;
  preparingAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  statusHistory: any[];
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
  } | null;
  items: OrderItem[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  coupon: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  } | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING: { label: "Beklemede", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-500/10", icon: Clock },
  PROCESSING: { label: "Hazırlanıyor", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-500/10", icon: Package },
  SHIPPED: { label: "Kargoda", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-500/10", icon: Truck },
  DELIVERED: { label: "Teslim Edildi", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-500/10", icon: CheckCircle },
  CANCELLED: { label: "İptal", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-500/10", icon: XCircle },
  REFUNDED: { label: "İade", color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-500/10", icon: RefreshCw },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: "Beklemede", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-500/10" },
  PAID: { label: "Ödendi", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-500/10" },
  FAILED: { label: "Başarısız", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-500/10" },
  REFUNDED: { label: "İade Edildi", color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-500/10" },
};

const CARRIERS = [
  "Aras Kargo",
  "Yurtiçi Kargo",
  "MNG Kargo",
  "PTT Kargo",
  "Sürat Kargo",
  "Trendyol Express",
  "HepsiJET",
  "Getir",
  "Diğer",
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  // State
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [status, setStatus] = useState<OrderStatus>("PENDING");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // Invoice upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropdowns
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);

  // Copy state
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Fetch order
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`);
        if (!res.ok) throw new Error("Sipariş bulunamadı");
        const data = await res.json();
        setOrder(data);
        setStatus(data.status);
        setPaymentStatus(data.paymentStatus);
        setTrackingNumber(data.trackingNumber || "");
        setCarrierName(data.carrierName || "");
        setAdminNote(data.adminNote || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Save changes
  const handleSave = async () => {
    if (!order) return;
    setSaving(true);

    // Auto-update status to SHIPPED if tracking number is added and status is not already shipped/delivered
    let finalStatus = status;
    if (trackingNumber && carrierName && 
        (order.status === "PENDING" || order.status === "PROCESSING") &&
        status !== "SHIPPED" && status !== "DELIVERED") {
      finalStatus = "SHIPPED";
      setStatus("SHIPPED");
    }

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: finalStatus,
          paymentStatus,
          trackingNumber: trackingNumber || null,
          carrierName: carrierName || null,
          adminNote: adminNote || null,
        }),
      });

      if (!res.ok) throw new Error("Kaydetme başarısız");

      const data = await res.json();
      setOrder(data.order);
      
      // Show appropriate message
      if (finalStatus === "SHIPPED" && order.status !== "SHIPPED") {
        alert("Sipariş güncellendi! Kargo bilgisi eklendiği için durum 'Kargoda' olarak değiştirildi.");
      } else {
        alert("Sipariş güncellendi!");
      }
    } catch (err: any) {
      alert(err.message || "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  // Upload invoice
  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("invoice", file);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/invoice`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Yükleme başarısız");

      const data = await res.json();
      setOrder({ ...order, invoiceUrl: data.invoiceUrl, invoiceUploadedAt: data.invoiceUploadedAt });
      alert("Fatura yüklendi!");
    } catch (err: any) {
      alert(err.message || "Yükleme hatası");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async () => {
    if (!order || !order.invoiceUrl) return;
    if (!confirm("Faturayı silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/invoice`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Silme başarısız");

      setOrder({ ...order, invoiceUrl: null, invoiceUploadedAt: null });
      alert("Fatura silindi!");
    } catch (err: any) {
      alert(err.message || "Silme hatası");
    }
  };

  // Copy tracking number
  const copyTrackingNumber = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
     const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside a dropdown
      if (target.closest('[data-dropdown]')) return;
      
      setStatusDropdownOpen(false);
      setPaymentDropdownOpen(false);
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  // Error
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <p className="text-gray-500 mb-4">{error || "Sipariş bulunamadı"}</p>
        <Link
          href="/orders"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white"
        >
          <ArrowLeft size={16} />
          Siparişlere Dön
        </Link>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status];
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/orders"
            className="flex items-center gap-2 text-gray-500 hover:text-dark dark:hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">
              #{order.orderNumber}
            </h1>
            <p className="text-gray-500">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          Kaydet
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Status & Shipping */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">Sipariş Durumu</h2>
            
            {/* Status Dropdown */}
            <div className="mb-4">
              <label className="mb-2 block text-sm text-gray-500">Durum</label>
              <div className="relative" data-dropdown>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setStatusDropdownOpen(!statusDropdownOpen);
                    setPaymentDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border border-stroke px-4 py-3 ${STATUS_CONFIG[status].bgColor} ${STATUS_CONFIG[status].color} dark:border-dark-3 cursor-pointer`}
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = STATUS_CONFIG[status].icon;
                      return <Icon size={18} />;
                    })()}
                    {STATUS_CONFIG[status].label}
                  </div>
                  <ChevronDown size={16} />
                </button>

                {statusDropdownOpen && (
                  <div
                    data-dropdown
                    className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-stroke bg-white py-1 shadow-lg dark:border-dark-3 dark:bg-gray-dark"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setStatus(key as OrderStatus);
                          setStatusDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-2 ${
                          status === key ? "bg-gray-50 dark:bg-dark-2" : ""
                        }`}
                      >
                        <config.icon size={16} className={config.color} />
                        <span className={config.color}>{config.label}</span>
                        {status === key && <Check size={14} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Status Dropdown */}
            <div>
              <label className="mb-2 block text-sm text-gray-500">Ödeme Durumu</label>
              <div className="relative" data-dropdown>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPaymentDropdownOpen(!paymentDropdownOpen);
                    setStatusDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border border-stroke px-4 py-3 ${PAYMENT_STATUS_CONFIG[paymentStatus].bgColor} ${PAYMENT_STATUS_CONFIG[paymentStatus].color} dark:border-dark-3 cursor-pointer`}
                >
                  {PAYMENT_STATUS_CONFIG[paymentStatus].label}
                  <ChevronDown size={16} />
                </button>

                {paymentDropdownOpen && (
                  <div
                    data-dropdown
                    className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-stroke bg-white py-1 shadow-lg dark:border-dark-3 dark:bg-gray-dark"
                  >
                    {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPaymentStatus(key as PaymentStatus);
                          setPaymentDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-2 ${
                          paymentStatus === key ? "bg-gray-50 dark:bg-dark-2" : ""
                        } ${config.color}`}
                      >
                        {config.label}
                        {paymentStatus === key && <Check size={14} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Card */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">Kargo Bilgileri</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-500">Kargo Firması</label>
                <select
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white"
                >
                  <option value="">Seçiniz</option>
                  {CARRIERS.map((carrier) => (
                    <option key={carrier} value={carrier}>{carrier}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-500">Takip Numarası</label>
                <div className="relative">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Kargo takip numarası"
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 pr-12 outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                  />
                  {trackingNumber && (
                    <button
                      onClick={copyTrackingNumber}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {copiedTracking ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Card */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">Fatura</h2>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleInvoiceUpload}
              className="hidden"
            />

            {order.invoiceUrl ? (
              <div className="space-y-3">
                <a
                  href={order.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-stroke p-3 hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
                >
                  <FileText size={24} className="text-red-500" />
                  <div className="flex-1">
                    <p className="font-medium text-dark dark:text-white">{order.orderNumber}.pdf</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.invoiceUploadedAt)}
                    </p>
                  </div>
                  <ExternalLink size={16} className="text-gray-400" />
                </a>
                <button
                  onClick={handleDeleteInvoice}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10"
                >
                  <Trash2 size={14} />
                  Faturayı Sil
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stroke py-6 text-gray-500 hover:border-primary hover:text-primary dark:border-dark-3"
              >
                {uploading ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <Upload size={20} />
                )}
                {uploading ? "Yükleniyor..." : "PDF Fatura Yükle"}
              </button>
            )}
          </div>

          {/* Admin Note */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">Admin Notu</h2>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="Sipariş hakkında not ekleyin..."
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-dark-3 dark:text-white"
            />
          </div>
        </div>

        {/* Center Column - Order Items */}
        <div className="space-y-6">
          {/* Order Items */}
          <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
            <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
              <h2 className="text-lg font-semibold text-dark dark:text-white">
                Sipariş Kalemleri ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-stroke dark:divide-dark-3">
              {order.items.map((item) => {
                const variantInfo = item.variantInfo ? JSON.parse(item.variantInfo) : null;
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-dark-2">
                      {item.product.thumbnail || item.product.images?.[0] ? (
                        <Image
                          src={item.product.thumbnail || item.product.images[0]}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark dark:text-white line-clamp-1">
                        {item.product.name}
                      </p>
                      {variantInfo && (
                        <p className="text-sm text-gray-500">
                          {variantInfo.name}: {variantInfo.value}
                        </p>
                      )}
                      {item.product.sku && (
                        <p className="text-xs text-gray-400">SKU: {item.product.sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatPrice(Number(item.price))} × {item.quantity}
                      </p>
                      <p className="font-medium text-dark dark:text-white">
                        {formatPrice(Number(item.subtotal))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="border-t border-stroke p-6 dark:border-dark-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ara Toplam</span>
                  <span className="text-dark dark:text-white">{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Kargo</span>
                  <span className={Number(order.shippingCost) === 0 ? "text-green-500" : "text-dark dark:text-white"}>
                    {Number(order.shippingCost) === 0 ? "Ücretsiz" : formatPrice(Number(order.shippingCost))}
                  </span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      İndirim {order.coupon && `(${order.coupon.code})`}
                    </span>
                    <span className="text-green-500">-{formatPrice(Number(order.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-stroke pt-2 dark:border-dark-3">
                  <span className="font-semibold text-dark dark:text-white">Toplam</span>
                  <span className="text-lg font-bold text-dark dark:text-white">
                    {formatPrice(Number(order.total))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Note */}
          {order.customerNote && (
            <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
              <h2 className="mb-2 text-lg font-semibold text-dark dark:text-white">Müşteri Notu</h2>
              <p className="text-gray-600 italic dark:text-gray-400">"{order.customerNote}"</p>
            </div>
          )}
        </div>

        {/* Right Column - Customer & Address */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">Müşteri</h2>
            
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                {getAvatarUrl(order.user?.image) ? (
                  <img
                    src={getAvatarUrl(order.user?.image)!}
                    alt={order.user?.name || ""}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User size={24} className="text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-dark dark:text-white">
                  {order.user?.name || "-"}
                </p>
                <p className="text-sm text-gray-500">{order.user?.email}</p>
                {order.user?.phone && (
                  <p className="text-sm text-gray-500">{order.user.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-dark dark:text-white">
                <MapPin size={18} />
                Teslimat Adresi
              </h2>
              
              <div className="space-y-1 text-sm">
                <p className="font-medium text-dark dark:text-white">
                  {order.shippingAddress.fullName || 
                    `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim() ||
                    order.shippingAddress.title}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.address || order.shippingAddress.addressLine1}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.district && `${order.shippingAddress.district}, `}
                  {order.shippingAddress.city}
                  {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
                </p>
                <p className="text-gray-500">{order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Billing Address (if different) */}
          {order.billingAddress && order.billingAddress.id !== order.shippingAddress?.id && (
            <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-dark dark:text-white">
                <FileText size={18} />
                Fatura Adresi
              </h2>
              
              <div className="space-y-1 text-sm">
                <p className="font-medium text-dark dark:text-white">
                  {order.billingAddress.fullName || 
                    `${order.billingAddress.firstName || ''} ${order.billingAddress.lastName || ''}`.trim() ||
                    order.billingAddress.title}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.billingAddress.address || order.billingAddress.addressLine1}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.billingAddress.district && `${order.billingAddress.district}, `}
                  {order.billingAddress.city}
                  {order.billingAddress.postalCode && ` ${order.billingAddress.postalCode}`}
                </p>
                <p className="text-gray-500">{order.billingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">Zaman Çizelgesi</h2>
            
            <div className="space-y-4">
              {[
                { label: "Sipariş Oluşturuldu", date: order.createdAt, done: true },
                { label: "Ödeme Alındı", date: order.paidAt, done: !!order.paidAt },
                { label: "Hazırlanıyor", date: order.preparingAt, done: !!order.preparingAt },
                { label: "Kargoya Verildi", date: order.shippedAt, done: !!order.shippedAt },
                { label: "Teslim Edildi", date: order.deliveredAt, done: !!order.deliveredAt },
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`mt-0.5 h-3 w-3 flex-shrink-0 rounded-full ${
                    step.done ? "bg-green-500" : "bg-gray-300 dark:bg-dark-3"
                  }`} />
                  <div>
                    <p className={`text-sm ${step.done ? "text-dark dark:text-white" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-gray-500">{formatDate(step.date)}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Cancelled/Refunded */}
              {(order.cancelledAt || order.refundedAt) && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-red-500" />
                  <div>
                    <p className="text-sm text-red-600">
                      {order.refundedAt ? "İade Edildi" : "İptal Edildi"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.refundedAt || order.cancelledAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
