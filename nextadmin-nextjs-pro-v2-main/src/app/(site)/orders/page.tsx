"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Search, Filter, RefreshCw, ChevronDown, ChevronLeft, ChevronRight,
  Eye, Trash2, Check, X, Package, Truck, CheckCircle, XCircle,
  Clock, AlertCircle, FileText, MoreHorizontal
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  createdAt: string;
  trackingNumber: string | null;
  carrierName: string | null;
  invoiceUrl: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      thumbnail: string | null;
    };
  }[];
}

interface Stats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
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

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  PENDING: { label: "Beklemede", color: "text-yellow-500" },
  PAID: { label: "Ödendi", color: "text-green-500" },
  FAILED: { label: "Başarısız", color: "text-red-500" },
  REFUNDED: { label: "İade Edildi", color: "text-gray-500" },
};

const ITEMS_PER_PAGE = 20;

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function OrdersPage() {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "ALL">("ALL");

  // Selection
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dropdown states
  const [activeStatusDropdown, setActiveStatusDropdown] = useState<string | null>(null);
  const [activePaymentDropdown, setActivePaymentDropdown] = useState<string | null>(null);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);

  // Loading states for individual updates
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Siparişler alınamadı");
      const data = await res.json();
      setOrders(data.orders || []);
      setStats(data.stats || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "ALL" && order.status !== statusFilter) return false;

    // Payment filter
    if (paymentFilter !== "ALL" && order.paymentStatus !== paymentFilter) return false;

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Select all toggle
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(paginatedOrders.map((o) => o.id)));
    }
    setSelectAll(!selectAll);
  };

  // Single select toggle
  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
    setSelectAll(newSelected.size === paginatedOrders.length);
  };

  // Update single order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrders((prev) => new Set(prev).add(orderId));
    setActiveStatusDropdown(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız");

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Durum güncellenemedi");
    } finally {
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Update single order payment status
  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    setUpdatingOrders((prev) => new Set(prev).add(orderId));
    setActivePaymentDropdown(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız");

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Ödeme durumu güncellenemedi");
    } finally {
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Bulk action
  const handleBulkAction = async (action: string, value?: string) => {
    if (selectedOrders.size === 0) return;

    setBulkActionOpen(false);
    const orderIds = Array.from(selectedOrders);

    try {
      const res = await fetch("/api/admin/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds,
          action,
          status: action === "updateStatus" ? value : undefined,
          paymentStatus: action === "updatePaymentStatus" ? value : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`${data.successCount} sipariş güncellendi${data.failedCount > 0 ? `, ${data.failedCount} başarısız` : ""}`);
        setSelectedOrders(new Set());
        setSelectAll(false);
        fetchOrders();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert(err.message || "Toplu işlem başarısız");
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside a dropdown
      if (target.closest('[data-dropdown]')) return;
      
      setActiveStatusDropdown(null);
      setActivePaymentDropdown(null);
      setBulkActionOpen(false);
    };
    
    // Use mousedown for faster response
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Siparişler</h1>
          <p className="text-gray-500">Tüm siparişleri görüntüleyin ve yönetin</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-2 text-sm font-medium text-dark hover:bg-gray-50 dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:hover:bg-dark-2"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
          <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
            <p className="text-2xl font-bold text-dark dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500">Toplam</p>
          </div>
          <button
            onClick={() => setStatusFilter(statusFilter === "PENDING" ? "ALL" : "PENDING")}
            className={`rounded-xl border p-4 text-left transition-all ${statusFilter === "PENDING" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" : "border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark"}`}
          >
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-sm text-gray-500">Beklemede</p>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "PROCESSING" ? "ALL" : "PROCESSING")}
            className={`rounded-xl border p-4 text-left transition-all ${statusFilter === "PROCESSING" ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark"}`}
          >
            <p className="text-2xl font-bold text-blue-500">{stats.processing}</p>
            <p className="text-sm text-gray-500">Hazırlanıyor</p>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "SHIPPED" ? "ALL" : "SHIPPED")}
            className={`rounded-xl border p-4 text-left transition-all ${statusFilter === "SHIPPED" ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10" : "border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark"}`}
          >
            <p className="text-2xl font-bold text-purple-500">{stats.shipped}</p>
            <p className="text-sm text-gray-500">Kargoda</p>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "DELIVERED" ? "ALL" : "DELIVERED")}
            className={`rounded-xl border p-4 text-left transition-all ${statusFilter === "DELIVERED" ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark"}`}
          >
            <p className="text-2xl font-bold text-green-500">{stats.delivered}</p>
            <p className="text-sm text-gray-500">Teslim</p>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "CANCELLED" ? "ALL" : "CANCELLED")}
            className={`rounded-xl border p-4 text-left transition-all ${statusFilter === "CANCELLED" ? "border-red-500 bg-red-50 dark:bg-red-500/10" : "border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark"}`}
          >
            <p className="text-2xl font-bold text-red-500">{stats.cancelled}</p>
            <p className="text-sm text-gray-500">İptal</p>
          </button>
          <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
            <p className="text-2xl font-bold text-primary">{formatPrice(stats.revenue)}</p>
            <p className="text-sm text-gray-500">Gelir</p>
          </div>
        </div>
      )}

      {/* Filters & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Sipariş no, müşteri adı veya email ara..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-stroke bg-transparent py-2 pl-10 pr-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus | "ALL");
              setCurrentPage(1);
            }}
            className="rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white"
          >
            <option value="ALL">Tüm Durumlar</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value as PaymentStatus | "ALL");
              setCurrentPage(1);
            }}
            className="rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-gray-dark dark:text-white"
          >
            <option value="ALL">Tüm Ödemeler</option>
            {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {(statusFilter !== "ALL" || paymentFilter !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setPaymentFilter("ALL");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-2"
            >
              <X size={14} />
              Temizle
            </button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedOrders.size > 0 && (
          <div className="relative" data-dropdown>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setBulkActionOpen(!bulkActionOpen);
              }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              {selectedOrders.size} Seçili
              <ChevronDown size={16} />
            </button>

            {bulkActionOpen && (
              <div
                data-dropdown
                className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-stroke bg-white py-2 shadow-lg dark:border-dark-3 dark:bg-gray-dark"
              >
                <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">Durumu Değiştir</p>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleBulkAction("updateStatus", key);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-gray-100 dark:text-white dark:hover:bg-dark-2"
                  >
                    <config.icon size={14} className={config.color} />
                    {config.label}
                  </button>
                ))}
                <div className="my-2 border-t border-stroke dark:border-dark-3" />
                <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">Ödeme Durumu</p>
                {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleBulkAction("updatePaymentStatus", key);
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-2 ${config.color}`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark dark:text-white">
            Sipariş Listesi
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredOrders.length} sipariş)
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={32} className="animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
            >
              Tekrar Dene
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "ALL" || paymentFilter !== "ALL"
                ? "Filtreye uygun sipariş bulunamadı"
                : "Henüz sipariş yok"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stroke dark:border-dark-3">
                    <th className="px-4 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Sipariş No</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Müşteri</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Tarih</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Toplam</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Ödeme</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Durum</th>
                    <th className="px-4 py-4 text-right text-sm font-medium text-gray-500">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => {
                    const isUpdating = updatingOrders.has(order.id);
                    const statusConfig = STATUS_CONFIG[order.status];
                    const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];

                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-stroke last:border-0 dark:border-dark-3 ${
                          selectedOrders.has(order.id) ? "bg-primary/5" : ""
                        } ${isUpdating ? "opacity-50" : ""}`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>

                        {/* Order Number */}
                        <td className="px-4 py-4">
                          <Link
                            href={`/orders/${order.id}`}
                            className="font-mono font-medium text-dark hover:text-primary dark:text-white"
                          >
                            #{order.orderNumber}
                          </Link>
                          {order.items.length > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {order.items.length} ürün
                            </p>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-4">
                          <p className="font-medium text-dark dark:text-white">
                            {order.user?.name || "-"}
                          </p>
                          <p className="text-sm text-gray-500">{order.user?.email}</p>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4">
                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-4">
                          <span className="font-medium text-dark dark:text-white">
                            {formatPrice(Number(order.total))}
                          </span>
                        </td>

                        {/* Payment Status - Dropdown */}
                        <td className="px-4 py-4">
                          <div className="relative" data-dropdown>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActivePaymentDropdown(
                                  activePaymentDropdown === order.id ? null : order.id
                                );
                                setActiveStatusDropdown(null);
                              }}
                              disabled={isUpdating}
                              className={`flex items-center gap-1 font-medium text-sm ${paymentConfig.color} hover:opacity-80`}
                            >
                              {paymentConfig.label}
                              <ChevronDown size={14} />
                            </button>

                            {activePaymentDropdown === order.id && (
                              <div
                                data-dropdown
                                className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border border-stroke bg-white py-1 shadow-lg dark:border-dark-3 dark:bg-gray-dark"
                              >
                                {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
                                  <button
                                    key={key}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      updatePaymentStatus(order.id, key as PaymentStatus);
                                    }}
                                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-2 ${
                                      order.paymentStatus === key ? "bg-gray-50 dark:bg-dark-2" : ""
                                    } ${config.color}`}
                                  >
                                    {order.paymentStatus === key && <Check size={14} />}
                                    {config.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status - Dropdown */}
                        <td className="px-4 py-4">
                          <div className="relative" data-dropdown>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveStatusDropdown(
                                  activeStatusDropdown === order.id ? null : order.id
                                );
                                setActivePaymentDropdown(null);
                              }}
                              disabled={isUpdating}
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} hover:opacity-80`}
                            >
                              {statusConfig.label}
                              <ChevronDown size={12} />
                            </button>

                            {activeStatusDropdown === order.id && (
                              <div
                                data-dropdown
                                className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-stroke bg-white py-1 shadow-lg dark:border-dark-3 dark:bg-gray-dark"
                              >
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                  <button
                                    key={key}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      updateOrderStatus(order.id, key as OrderStatus);
                                    }}
                                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-2 ${
                                      order.status === key ? "bg-gray-50 dark:bg-dark-2" : ""
                                    }`}
                                  >
                                    <config.icon size={14} className={config.color} />
                                    <span className={config.color}>{config.label}</span>
                                    {order.status === key && <Check size={14} className="ml-auto" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {order.invoiceUrl && (
                              <a
                                href={order.invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded p-2 hover:bg-gray-100 dark:hover:bg-dark-2"
                                title="Fatura"
                              >
                                <FileText size={16} className="text-gray-500" />
                              </a>
                            )}
                            <Link
                              href={`/orders/${order.id}`}
                              className="rounded p-2 hover:bg-gray-100 dark:hover:bg-dark-2"
                              title="Detay"
                            >
                              <Eye size={16} className="text-gray-500" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-stroke px-6 py-4 dark:border-dark-3">
                <p className="text-sm text-gray-500">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} / {filteredOrders.length} sipariş
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 rounded-lg border border-stroke px-3 py-1.5 text-sm disabled:opacity-50 dark:border-dark-3"
                  >
                    <ChevronLeft size={16} />
                    Önceki
                  </button>
                  <span className="px-3 text-sm text-gray-500">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 rounded-lg border border-stroke px-3 py-1.5 text-sm disabled:opacity-50 dark:border-dark-3"
                  >
                    Sonraki
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
