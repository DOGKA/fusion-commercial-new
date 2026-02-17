"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, RefreshCw, ChevronLeft, ChevronRight,
  Eye, Check, X, Clock, User, CreditCard, Banknote, 
  XCircle, Package, AlertTriangle, HelpCircle, 
  ThumbsDown, RefreshCcw, RotateCcw
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type RequestStatus = "PENDING_ADMIN_APPROVAL" | "APPROVED" | "REJECTED";
type ReturnReason = "DAMAGED" | "WRONG_PRODUCT" | "SPECS_MISMATCH";

interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  status: RequestStatus;
  statusLabel: string;
  reason: ReturnReason;
  reasonLabel: string;
  description: string | null;
  images: string[];
  adminNote: string | null;
  returnAddress: string | null;
  returnInstructions: string | null;
  requestIp: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string | null;
    total: number;
    createdAt: string;
    deliveredAt: string | null;
    items: {
      id: string;
      quantity: number;
      price: number;
      product: {
        name: string;
        thumbnail: string | null;
      };
    }[];
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
}

interface Counts {
  pending: number;
  approved: number;
  rejected: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING_ADMIN_APPROVAL: { 
    label: "Beklemede", 
    color: "text-yellow-600 dark:text-yellow-400", 
    bgColor: "bg-yellow-100 dark:bg-yellow-500/10", 
    icon: Clock 
  },
  APPROVED: { 
    label: "Onaylandı", 
    color: "text-green-600 dark:text-green-400", 
    bgColor: "bg-green-100 dark:bg-green-500/10", 
    icon: Check 
  },
  REJECTED: { 
    label: "Reddedildi", 
    color: "text-red-600 dark:text-red-400", 
    bgColor: "bg-red-100 dark:bg-red-500/10", 
    icon: X 
  },
};

const REASON_CONFIG: Record<ReturnReason, { label: string; icon: any; color: string }> = {
  DAMAGED: { label: "Ürün Hasarlı Geldi", icon: AlertTriangle, color: "text-orange-500" },
  WRONG_PRODUCT: { label: "Ürün Yanlış Gönderildi", icon: Package, color: "text-red-500" },
  SPECS_MISMATCH: { label: "Teknik Özellikler Uyuşmadı", icon: XCircle, color: "text-purple-500" },
};

const ITEMS_PER_PAGE = 20;

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ReturnRequestsPage() {
  // State
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [reasonFilter, setReasonFilter] = useState<ReturnReason | "ALL">("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Action states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionModalRequest, setActionModalRequest] = useState<ReturnRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [returnAddress, setReturnAddress] = useState("");
  const [returnInstructions, setReturnInstructions] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (reasonFilter !== "ALL") params.set("reason", reasonFilter);
      
      const res = await fetch(`/api/admin/return-requests?${params}`);
      if (!res.ok) throw new Error("İade talepleri alınamadı");
      const data = await res.json();
      setRequests(data.requests || []);
      setCounts(data.counts || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, reasonFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        req.order.orderNumber.toLowerCase().includes(query) ||
        req.user?.name?.toLowerCase().includes(query) ||
        req.user?.email?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle action (approve/reject)
  const handleAction = async () => {
    if (!actionModalRequest || !actionType) return;
    
    // Validation for approval
    if (actionType === "approve" && !returnAddress.trim()) {
      setActionError("İade adresi zorunludur");
      return;
    }
    
    setProcessingId(actionModalRequest.id);
    setActionError(null);
    
    try {
      const res = await fetch(`/api/admin/return-requests/${actionModalRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          adminNote: adminNote.trim() || undefined,
          returnAddress: actionType === "approve" ? returnAddress.trim() : undefined,
          returnInstructions: actionType === "approve" ? returnInstructions.trim() || undefined : undefined,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setActionError(data.error || "İşlem başarısız");
        return;
      }
      
      // Refresh list
      fetchRequests();
      closeModal();
    } catch (err) {
      setActionError("Bir hata oluştu");
    } finally {
      setProcessingId(null);
    }
  };

  const openActionModal = async (request: ReturnRequest, type: "approve" | "reject") => {
    setActionModalRequest(request);
    setActionType(type);
    setAdminNote("");
    setReturnAddress("");
    setReturnInstructions("");
    setActionError(null);
    
    // Fetch default return settings if approving
    if (type === "approve") {
      try {
        const res = await fetch("/api/admin/settings/return");
        if (res.ok) {
          const data = await res.json();
          if (data.defaultReturnAddress) {
            setReturnAddress(data.defaultReturnAddress);
          }
          if (data.returnShippingInfo) {
            setReturnInstructions(data.returnShippingInfo);
          }
        }
      } catch (e) {
        // Ignore - will use empty fields
      }
    }
  };

  const closeModal = () => {
    setActionModalRequest(null);
    setActionType(null);
    setAdminNote("");
    setReturnAddress("");
    setReturnInstructions("");
    setActionError(null);
  };

  // Loading state
  if (loading && requests.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            İade Talepleri
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Müşteri iade taleplerini yönetin
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {/* Stats Cards */}
      {counts && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => setStatusFilter("PENDING_ADMIN_APPROVAL")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              statusFilter === "PENDING_ADMIN_APPROVAL" 
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" 
                : "border-gray-200 dark:border-gray-700 hover:border-yellow-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-500/20">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts.pending}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Beklemede</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setStatusFilter("APPROVED")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              statusFilter === "APPROVED" 
                ? "border-green-500 bg-green-50 dark:bg-green-500/10" 
                : "border-gray-200 dark:border-gray-700 hover:border-green-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts.approved}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Onaylandı</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => setStatusFilter("REJECTED")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              statusFilter === "REJECTED" 
                ? "border-red-500 bg-red-50 dark:bg-red-500/10" 
                : "border-gray-200 dark:border-gray-700 hover:border-red-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-500/20">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts.rejected}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reddedildi</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sipariş no, müşteri adı veya email ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "ALL")}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="ALL">Tüm Durumlar</option>
          <option value="PENDING_ADMIN_APPROVAL">Beklemede</option>
          <option value="APPROVED">Onaylandı</option>
          <option value="REJECTED">Reddedildi</option>
        </select>

        {/* Reason Filter */}
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value as ReturnReason | "ALL")}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="ALL">Tüm Sebepler</option>
          <option value="DAMAGED">Ürün Hasarlı Geldi</option>
          <option value="WRONG_PRODUCT">Ürün Yanlış Gönderildi</option>
          <option value="SPECS_MISMATCH">Teknik Özellikler Uyuşmadı</option>
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sipariş
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İade Sebebi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Talep Tarihi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <RotateCcw className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery ? "Sonuç bulunamadı" : "Henüz iade talebi yok"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req) => {
                  const statusConfig = STATUS_CONFIG[req.status];
                  const reasonConfig = REASON_CONFIG[req.reason];
                  const StatusIcon = statusConfig.icon;
                  const ReasonIcon = reasonConfig.icon;
                  const isCard = req.order.paymentMethod === "CREDIT_CARD" || req.order.paymentMethod === "iyzico";
                  
                  return (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {/* Order */}
                      <td className="px-4 py-4">
                        <Link
                          href={`/orders/${req.order.id}`}
                          className="text-sm font-mono font-medium text-primary hover:underline"
                        >
                          #{req.order.orderNumber}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {req.order.items.length} ürün
                        </p>
                      </td>
                      
                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {req.user?.name || "İsimsiz"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {req.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Amount */}
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(req.order.total)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isCard ? "Kart" : "Havale"}
                        </p>
                      </td>
                      
                      {/* Reason */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <ReasonIcon className={`w-4 h-4 ${reasonConfig.color}`} />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {reasonConfig.label}
                          </span>
                        </div>
                        {req.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px]" title={req.description}>
                            {req.description}
                          </p>
                        )}
                      </td>
                      
                      {/* Request Date */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(req.createdAt)}
                        </p>
                      </td>
                      
                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        {req.status === "PENDING_ADMIN_APPROVAL" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openActionModal(req, "approve")}
                              disabled={processingId === req.id}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Onayla"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openActionModal(req, "reject")}
                              disabled={processingId === req.id}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Reddet"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/orders/${req.order.id}`}
                              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Detay"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        ) : (
                          <Link
                            href={`/orders/${req.order.id}`}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors inline-flex"
                            title="Detay"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredRequests.length} talepten {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)} gösteriliyor
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModalRequest && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 ${actionType === "approve" ? "bg-green-50 dark:bg-green-500/10" : "bg-red-50 dark:bg-red-500/10"}`}>
              <h3 className={`text-lg font-semibold ${actionType === "approve" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                {actionType === "approve" ? "İade Talebini Onayla" : "İade Talebini Reddet"}
              </h3>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sipariş No</span>
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                    #{actionModalRequest.order.orderNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Müşteri</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {actionModalRequest.user?.name || actionModalRequest.user?.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tutar</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatPrice(actionModalRequest.order.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">İade Sebebi</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {REASON_CONFIG[actionModalRequest.reason].label}
                  </span>
                </div>
                {actionModalRequest.description && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Açıklama:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{actionModalRequest.description}</p>
                  </div>
                )}
                {actionModalRequest.images && actionModalRequest.images.length > 0 && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Müşteri Görselleri ({actionModalRequest.images.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {actionModalRequest.images.map((img, index) => (
                        <a
                          key={index}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative group"
                        >
                          <Image
                            src={img}
                            alt={`Ürün görseli ${index + 1}`}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {actionType === "approve" && (
                <>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      <strong>Dikkat:</strong> Onaylandığında sipariş iade edilecek, stok geri eklenecek ve 
                      {actionModalRequest.order.paymentMethod === "CREDIT_CARD" || actionModalRequest.order.paymentMethod === "iyzico"
                        ? " iyzico üzerinden ödeme iadesi yapılacak."
                        : " havale iadesi için admin notu eklenecek."}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      İade Adresi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={returnAddress}
                      onChange={(e) => setReturnAddress(e.target.value)}
                      rows={3}
                      placeholder="Müşterinin ürünü göndereceği iade adresi..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      İade Talimatları (Opsiyonel)
                    </label>
                    <textarea
                      value={returnInstructions}
                      onChange={(e) => setReturnInstructions(e.target.value)}
                      rows={2}
                      placeholder="Ek talimatlar (örn: kargo firması, özel notlar)..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notu (Opsiyonel)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="İade sebebi veya not ekleyin..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              
              {actionError && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={handleAction}
                disabled={processingId === actionModalRequest.id}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {processingId === actionModalRequest.id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    İşleniyor...
                  </>
                ) : actionType === "approve" ? (
                  "Onayla"
                ) : (
                  "Reddet"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
