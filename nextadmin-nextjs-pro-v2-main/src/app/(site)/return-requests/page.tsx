"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, RefreshCw, ChevronLeft, ChevronRight,
  Eye, Check, X, Clock, User, CreditCard, Banknote, 
  XCircle, Package, AlertTriangle, HelpCircle, 
  ThumbsDown, RefreshCcw, RotateCcw, Truck, PackageCheck
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * İki ayrı onay var: `APPROVED` "gönderebilirsin + kodun bu", `COMPLETED` ise
 * "inceleme olumlu, paran iade edildi". Para yalnızca son adımda hareket eder.
 */
type RequestStatus =
  | "PENDING_ADMIN_APPROVAL"
  | "APPROVED"
  | "RECEIVED"
  | "COMPLETED"
  | "REJECTED";
type ReturnReason =
  | "DAMAGED"
  | "WRONG_PRODUCT"
  | "SPECS_MISMATCH"
  | "CHANGED_MIND"
  | "MISSING_ITEM"
  | "NOT_RECEIVED";
type RequestType = "RETURN" | "INVOICE_REQUEST" | "WRONG_INVOICE" | "EXTRA_ITEM" | "OTHER";

interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  status: RequestStatus;
  statusLabel: string;
  requestType: RequestType;
  /** İade dışı taleplerde neden yoktur (fatura talebinin nedeni olmaz). */
  reason: ReturnReason | null;
  reasonLabel: string | null;
  description: string | null;
  images: string[];
  adminNote: string | null;
  returnAddress: string | null;
  returnInstructions: string | null;
  /** Onay anında üretilir; bekleyen/reddedilen taleplerde null. */
  returnCode: string | null;
  requestIp: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  /** Kolinin depoya ulaştığı an; 14 günlük ödeme süresinin sayacı. */
  receivedAt: string | null;
  refundedAt: string | null;
  /** İnceleme olumsuz çıkıp ürün müşteriye geri gönderildiğinde dolar. */
  sendBackCarrier: string | null;
  sendBackTrackingNumber: string | null;
  sendBackAt: string | null;
  /** Talep siparişin yalnızca bir kısmını kapsıyor mu (F2-67). */
  isPartial?: boolean;
  selectedItems?: { orderItemId: string; quantity: number; name: string }[];
  /**
   * Kısmi iadede geri ödenecek tutar; tam taleplerde `null` (orada iyzico'daki
   * tüm işlemler iade edildiği için tek bir rakam yok).
   *
   * Sunucuda, iadeyi fiilen yapan kodun aynısıyla hesaplanıyor — panelde ikinci
   * bir hesap yazmak, onaylanan tutardan başkasının gitmesine yol açardı.
   */
  estimatedRefund?: number | null;
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
  received: number;
  completed: number;
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
    label: "Kargo bekleniyor", 
    color: "text-blue-600 dark:text-blue-400", 
    bgColor: "bg-blue-100 dark:bg-blue-500/10", 
    icon: Truck 
  },
  RECEIVED: {
    label: "İnceleniyor",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-500/10",
    icon: PackageCheck,
  },
  COMPLETED: {
    label: "İade edildi",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-500/10",
    icon: Check,
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
  CHANGED_MIND: { label: "Fikrini Değiştirdi (Cayma)", icon: RotateCcw, color: "text-blue-500" },
  MISSING_ITEM: { label: "Eksik Ürün", icon: HelpCircle, color: "text-amber-500" },
  NOT_RECEIVED: { label: "Kargo Ulaşmadı", icon: ThumbsDown, color: "text-rose-500" },
};

const REQUEST_TYPE_CONFIG: Record<RequestType, { label: string; color: string; bgColor: string }> = {
  RETURN: { label: "İade", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-500/10" },
  INVOICE_REQUEST: { label: "Fatura Talebi", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-500/10" },
  WRONG_INVOICE: { label: "Hatalı Fatura", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-500/10" },
  EXTRA_ITEM: { label: "Fazla Ürün", color: "text-teal-600 dark:text-teal-400", bgColor: "bg-teal-100 dark:bg-teal-500/10" },
  OTHER: { label: "Diğer", color: "text-gray-600 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-500/10" },
};

/**
 * Sözlükte olmayan bir değer gelirse ÇÖKMEK yerine ham anahtarı göster.
 *
 * Bu koruma şart: `ReturnReason` enum'ı büyüdüğünde (ki bu dilimde üç değer
 * eklendi) korumasız `REASON_CONFIG[req.reason].icon` erişimi `undefined.icon`
 * olur ve tüm sayfa çalışma zamanında patlar. Talep listesi, admin'in iade
 * onayladığı tek ekran — çökmesi operasyonu durdurur.
 */
function reasonConfigOf(reason: ReturnReason | null) {
  if (reason && REASON_CONFIG[reason]) return REASON_CONFIG[reason];
  return { label: reason ?? "—", icon: HelpCircle, color: "text-gray-400" };
}

const STAT_CARDS: {
  status: RequestStatus;
  countKey: keyof Counts;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
}[] = [
  {
    status: "PENDING_ADMIN_APPROVAL",
    countKey: "pending",
    label: "Onay bekliyor",
    icon: Clock,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-500/20",
  },
  {
    status: "APPROVED",
    countKey: "approved",
    label: "Kargo bekleniyor",
    icon: Truck,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-500/20",
  },
  {
    status: "RECEIVED",
    countKey: "received",
    label: "İnceleniyor",
    icon: PackageCheck,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-500/20",
  },
  {
    status: "COMPLETED",
    countKey: "completed",
    label: "İade edildi",
    icon: Check,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-500/20",
  },
  {
    status: "REJECTED",
    countKey: "rejected",
    label: "Reddedildi",
    icon: X,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-500/20",
  },
];

function requestTypeConfigOf(requestType: RequestType | undefined) {
  if (requestType && REQUEST_TYPE_CONFIG[requestType]) return REQUEST_TYPE_CONFIG[requestType];
  return REQUEST_TYPE_CONFIG.RETURN;
}

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 400;

type ReturnAction = "approve" | "receive" | "refund" | "reject" | "send-back";

/**
 * Ürün depomuza gelmiş ama inceleme olumsuz çıkmış: müşterinin malı bizde ve
 * ona geri gitmesi gerekiyor. İlk aşamada reddedilen taleplerde ürün bize hiç
 * ulaşmadığı için `receivedAt` kontrolü şart.
 */
function needsSendBack(req: ReturnRequest): boolean {
  return req.status === "REJECTED" && !!req.receivedAt && !req.sendBackAt;
}

/** Cayma hakkında ödeme en geç bu kadar gün içinde yapılmak zorunda. */
const REFUND_DEADLINE_DAYS = 14;

/**
 * Modal başlıkları ve buton metinleri. "Onayla" tek başına artık belirsiz:
 * iki ayrı onay var ve biri parayı hareket ettirmiyor, diğeri ettiriyor.
 */
const ACTION_CONFIG: Record<
  ReturnAction,
  { title: string; button: string; tone: "positive" | "neutral" | "danger" }
> = {
  approve: {
    title: "İade İnceleme Talebini Onayla",
    button: "Onayla ve kod ver",
    tone: "positive",
  },
  receive: {
    title: "Ürünü Teslim Aldım",
    button: "Teslim alındı olarak işaretle",
    tone: "neutral",
  },
  refund: {
    title: "İadeyi Onayla ve Parayı İade Et",
    button: "Parayı iade et",
    tone: "positive",
  },
  reject: { title: "İade Talebini Reddet", button: "Reddet", tone: "danger" },
  "send-back": {
    title: "Ürünü Müşteriye Geri Gönder",
    button: "Geri gönderim bilgisini kaydet",
    tone: "neutral",
  },
};

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

function daysSince(date: string | null): number | null {
  if (!date) return null;
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return null;
  return Math.floor((Date.now() - time) / (24 * 60 * 60 * 1000));
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");
  const [reasonFilter, setReasonFilter] = useState<ReturnReason | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<RequestType | "ALL">("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Action states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionModalRequest, setActionModalRequest] = useState<ReturnRequest | null>(null);
  const [actionType, setActionType] = useState<ReturnAction | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [returnAddress, setReturnAddress] = useState("");
  const [returnInstructions, setReturnInstructions] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastReturnCode, setLastReturnCode] = useState<string | null>(null);
  const [sendBackCarrier, setSendBackCarrier] = useState("");
  const [sendBackTrackingNumber, setSendBackTrackingNumber] = useState("");
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const deepLinkId = new URLSearchParams(window.location.search).get("id");
      if (deepLinkId) params.set("id", deepLinkId);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (reasonFilter !== "ALL") params.set("reason", reasonFilter);
      if (typeFilter !== "ALL") params.set("requestType", typeFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);

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
  }, [statusFilter, reasonFilter, typeFilter, debouncedSearch]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id && requests.some((request) => request.id === id)) {
      document.getElementById(`return-${id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [requests]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id || deepLinkHandled) return;
    const target = requests.find((request) => request.id === id);
    if (!target) return;

    if (target.status === "PENDING_ADMIN_APPROVAL") {
      setActionModalRequest(target);
      setActionType("approve");
      setAdminNote(target.adminNote || "");
      setReturnAddress(target.returnAddress || "");
      setReturnInstructions(target.returnInstructions || "");
      setDeepLinkHandled(true);
    } else if (target.status === "RECEIVED") {
      setActionModalRequest(target);
      setActionType("refund");
      setAdminNote(target.adminNote || "");
      setDeepLinkHandled(true);
    }
  }, [requests, deepLinkHandled]);

  // Arama sunucuda yapıldığı için gelen liste zaten filtreli; her tuş vuruşunda
  // istek atmamak adına gecikme veriyoruz.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pagination
  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle action (approve/receive/refund/reject)
  const handleAction = async () => {
    if (!actionModalRequest || !actionType) return;
    
    // Validation for approval
    if (actionType === "approve" && !returnAddress.trim()) {
      setActionError("İade adresi zorunludur");
      return;
    }

    // İnceleme sonrası ret: müşterinin ürünü depoda kaldığı için gerekçe şart.
    if (
      actionType === "reject" &&
      actionModalRequest.status === "RECEIVED" &&
      !adminNote.trim()
    ) {
      setActionError(
        "İnceleme sonrası ret için gerekçe zorunludur — müşteri ürününün neden iade edilmediğini bilmeli."
      );
      return;
    }

    if (actionType === "send-back" && !sendBackTrackingNumber.trim()) {
      setActionError("Kargo takip numarası zorunludur");
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
          sendBackCarrier:
            actionType === "send-back" ? sendBackCarrier.trim() || undefined : undefined,
          sendBackTrackingNumber:
            actionType === "send-back" ? sendBackTrackingNumber.trim() : undefined,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setActionError(data.error || "İşlem başarısız");
        return;
      }
      
      // Onayda üretilen kod müşteriye e-postayla gidiyor; telefonda soran
      // müşteriye okuyabilmek için ekranda da bir kez gösteriyoruz.
      if (data.returnCode) {
        setLastReturnCode(data.returnCode);
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

  const openActionModal = async (request: ReturnRequest, type: ReturnAction) => {
    setActionModalRequest(request);
    setActionType(type);
    setAdminNote("");
    setReturnAddress("");
    setReturnInstructions("");
    setSendBackCarrier("");
    setSendBackTrackingNumber("");
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
    setSendBackCarrier("");
    setSendBackTrackingNumber("");
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

      {/* Stats Cards — akışın her adımı ayrı kart: işin nerede biriktiği
          (kargo bekleyen mi, incelenmeyi bekleyen mi) tek bakışta görünsün. */}
      {counts && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {STAT_CARDS.map((card) => {
            const CardIcon = card.icon;
            const active = statusFilter === card.status;
            return (
              <div
                key={card.status}
                onClick={() => setStatusFilter(active ? "ALL" : card.status)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 dark:border-gray-700 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <CardIcon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {counts[card.countKey]}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
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
            placeholder="İade kodu, sipariş no, müşteri adı veya email ara..."
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
          <option value="PENDING_ADMIN_APPROVAL">Onay bekliyor</option>
          <option value="APPROVED">Kargo bekleniyor</option>
          <option value="RECEIVED">İnceleniyor</option>
          <option value="COMPLETED">İade edildi</option>
          <option value="REJECTED">Reddedildi</option>
        </select>

        {/* Reason Filter */}
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value as ReturnReason | "ALL")}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="ALL">Tüm Sebepler</option>
          {(Object.keys(REASON_CONFIG) as ReturnReason[]).map((key) => (
            <option key={key} value={key}>
              {REASON_CONFIG[key].label}
            </option>
          ))}
        </select>

        {/* Talep Tipi Filtresi */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as RequestType | "ALL")}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="ALL">Tüm Talep Tipleri</option>
          {(Object.keys(REQUEST_TYPE_CONFIG) as RequestType[]).map((key) => (
            <option key={key} value={key}>
              {REQUEST_TYPE_CONFIG[key].label}
            </option>
          ))}
        </select>
      </div>

      {/* Yeni üretilen iade kodu */}
      {lastReturnCode && (
        <div className="flex items-center justify-between gap-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            İade onaylandı. Müşteriye iletilen iade kodu:{" "}
            <span className="font-mono font-semibold">{lastReturnCode}</span>
          </p>
          <button
            type="button"
            onClick={() => setLastReturnCode(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:opacity-70"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                  const reasonConfig = reasonConfigOf(req.reason);
                  const typeConfig = requestTypeConfigOf(req.requestType);
                  const StatusIcon = statusConfig.icon;
                  const ReasonIcon = reasonConfig.icon;
                  const isCard = req.order.paymentMethod === "CREDIT_CARD" || req.order.paymentMethod === "iyzico";
                  const waitingDays = daysSince(req.receivedAt);
                  const sendBackWaitingDays = daysSince(req.reviewedAt);
                  
                  return (
                    <tr id={`return-${req.id}`} key={req.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
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
                        {/* Kısmi talepte hangi kalemlerin geldiğini depo bilmek
                            zorunda; koli tüm siparişi içermeyecek. */}
                        {req.isPartial && req.selectedItems && (
                          <div className="mt-1">
                            <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                              Kısmi · {req.selectedItems.length} kalem
                            </span>
                            <ul className="mt-1 space-y-0.5">
                              {req.selectedItems.map((item) => (
                                <li
                                  key={item.orderItemId}
                                  className="text-[11px] text-gray-600 dark:text-gray-300"
                                >
                                  {item.name}
                                  {item.quantity > 1 && ` × ${item.quantity}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* Depoya gelen kolinin üzerindeki kod bu; aramada da
                            eşleşiyor, o yüzden listede görünür olması gerekiyor. */}
                        {req.returnCode && (
                          <p className="mt-1 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {req.returnCode}
                          </p>
                        )}
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
                        {/* İade dışı talepler bu ekranda da listelendiği için tip
                            etiketi şart: admin "İade" sanıp para iadesi başlatmasın. */}
                        {req.requestType && req.requestType !== "RETURN" && (
                          <span
                            className={`inline-block mb-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${typeConfig.bgColor} ${typeConfig.color}`}
                          >
                            {typeConfig.label}
                          </span>
                        )}
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
                        {/* İki aşamalı akışın riski incelemenin sahipsiz kalması:
                            cayma hakkında ödeme en geç 14 gün içinde yapılmalı. */}
                        {req.status === "RECEIVED" && waitingDays !== null && (
                          <p
                            className={`mt-1 text-xs ${
                              waitingDays >= REFUND_DEADLINE_DAYS
                                ? "font-semibold text-red-600 dark:text-red-400"
                                : waitingDays >= REFUND_DEADLINE_DAYS - 4
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {waitingDays >= REFUND_DEADLINE_DAYS
                              ? `${waitingDays} gündür incelemede — yasal ödeme süresi aşıldı`
                              : `${waitingDays} gündür incelemede`}
                          </p>
                        )}

                        {/* Müşterinin malı bizde ve parasını almadı: bu satır
                            gözden kaçarsa ürün depoda süresiz kalır. */}
                        {needsSendBack(req) && (
                          <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                            Ürün depoda — müşteriye geri gönderilmeli
                            {sendBackWaitingDays !== null && sendBackWaitingDays > 0
                              ? ` (${sendBackWaitingDays} gün)`
                              : ""}
                          </p>
                        )}

                        {req.sendBackTrackingNumber && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Geri gönderildi:{" "}
                            <span className="font-mono">{req.sendBackTrackingNumber}</span>
                            {req.sendBackCarrier ? ` · ${req.sendBackCarrier}` : ""}
                          </p>
                        )}
                      </td>
                      
                      {/* Actions — sıradaki adım duruma göre değişiyor:
                          bekliyor → onayla/reddet, onaylandı → teslim aldım,
                          teslim alındı → parayı iade et / incelemede reddet. */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === "PENDING_ADMIN_APPROVAL" && (
                            <>
                              <button
                                onClick={() => openActionModal(req, "approve")}
                                disabled={processingId === req.id}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                                title="İnceleme talebini onayla (para çıkmaz)"
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
                            </>
                          )}

                          {req.status === "APPROVED" && (
                            <button
                              onClick={() => openActionModal(req, "receive")}
                              disabled={processingId === req.id}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Ürünü teslim aldım"
                            >
                              <PackageCheck className="w-4 h-4" />
                            </button>
                          )}

                          {needsSendBack(req) && (
                            <button
                              onClick={() => openActionModal(req, "send-back")}
                              disabled={processingId === req.id}
                              className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Ürünü müşteriye geri gönder"
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                          )}

                          {req.status === "RECEIVED" && (
                            <>
                              <button
                                onClick={() => openActionModal(req, "refund")}
                                disabled={processingId === req.id}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                                title={
                                  req.isPartial
                                    ? "Kısmi iadeyi onayla — yalnızca seçilen kalemlerin parası iade edilir"
                                    : "İadeyi onayla ve parayı iade et"
                                }
                              >
                                <Banknote className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openActionModal(req, "reject")}
                                disabled={processingId === req.id}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                title="İnceleme olumsuz — reddet"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <Link
                            href={`/orders/${req.order.id}`}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Detay"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
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
              {requests.length} talepten {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, requests.length)} gösteriliyor
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
            <div
              className={`px-6 py-4 ${
                ACTION_CONFIG[actionType].tone === "danger"
                  ? "bg-red-50 dark:bg-red-500/10"
                  : ACTION_CONFIG[actionType].tone === "neutral"
                    ? "bg-indigo-50 dark:bg-indigo-500/10"
                    : "bg-green-50 dark:bg-green-500/10"
              }`}
            >
              <h3
                className={`text-lg font-semibold ${
                  ACTION_CONFIG[actionType].tone === "danger"
                    ? "text-red-700 dark:text-red-400"
                    : ACTION_CONFIG[actionType].tone === "neutral"
                      ? "text-indigo-700 dark:text-indigo-400"
                      : "text-green-700 dark:text-green-400"
                }`}
              >
                {ACTION_CONFIG[actionType].title}
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
                  <span className="text-sm text-gray-500 dark:text-gray-400">Talep Tipi</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {requestTypeConfigOf(actionModalRequest.requestType).label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">İade Sebebi</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {reasonConfigOf(actionModalRequest.reason).label}
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
                  <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Bu adım müşteriye <strong>&ldquo;gönderebilirsin&rdquo;</strong> der ve iade
                      kodunu verir. <strong>Para çıkmaz, stok geri eklenmez</strong> — ikisi de
                      ürün depoya ulaşıp incelendikten sonra, &ldquo;Parayı iade et&rdquo; adımında.
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
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Onayladığınızda tekil bir iade kodu üretilir ve müşteriye
                      e-postayla iletilir. Depoya gelen koliyi bu kodla
                      eşleştirebilirsiniz.
                    </p>
                  </div>
                </>
              )}

              {actionType === "receive" && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg space-y-2">
                  <p className="text-sm text-indigo-700 dark:text-indigo-400">
                    Koliyi <strong>iade kodundan</strong> doğruladığınızdan emin olun:{" "}
                    {actionModalRequest.returnCode ? (
                      <span className="font-mono font-semibold">
                        {actionModalRequest.returnCode}
                      </span>
                    ) : (
                      <span className="italic">bu talebe kod verilmemiş</span>
                    )}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-300">
                    Para bu adımda da çıkmaz. İncelemeyi bitirdiğinizde
                    &ldquo;Parayı iade et&rdquo; adımına geçin — cayma hakkı gereği ödemenin
                    en geç {REFUND_DEADLINE_DAYS} gün içinde yapılması gerekiyor.
                  </p>
                </div>
              )}

              {actionType === "refund" && (
                <div className="space-y-3">
                  {/*
                    Tutar önizlemesi. Yönetici parayı göndermeden önce ne kadar
                    olduğunu görmeli; rakam sunucuda, iadeyi fiilen yapan kodun
                    aynısıyla hesaplanıyor.
                  */}
                  {actionModalRequest.isPartial && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg space-y-2">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        Kısmi iade — yalnızca seçilen kalemler
                      </p>
                      <ul className="space-y-0.5">
                        {actionModalRequest.selectedItems?.map((item) => (
                          <li
                            key={item.orderItemId}
                            className="text-xs text-blue-700 dark:text-blue-300"
                          >
                            {item.name}
                            {item.quantity > 1 && ` × ${item.quantity}`}
                          </li>
                        ))}
                      </ul>
                      {actionModalRequest.estimatedRefund != null && (
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          İade edilecek tutar:{" "}
                          <strong>
                            ₺
                            {actionModalRequest.estimatedRefund.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </strong>{" "}
                          <span className="text-xs">
                            (sipariş toplamı ₺
                            {actionModalRequest.order.total.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                            )
                          </span>
                        </p>
                      )}
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        Kargo bedeli iade edilmez; kalan kalemler için gönderi zaten
                        yapıldı. Varsa kupon indirimi tutardan orantılı düşülmüştür.
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      <strong>Dikkat, bu adım geri alınamaz:</strong>{" "}
                      {actionModalRequest.isPartial
                        ? "seçilen kalemlerin stoğu geri eklenecek ve"
                        : "stok geri eklenecek, sipariş iade edilmiş sayılacak ve"}
                      {actionModalRequest.order.paymentMethod === "CREDIT_CARD" ||
                      actionModalRequest.order.paymentMethod === "iyzico"
                        ? " iyzico üzerinden ödeme iadesi yapılacak."
                        : " havale iadesini elle yapmanız gerekecek."}
                    </p>
                  </div>
                </div>
              )}

              {actionType === "send-back" && (
                <>
                  <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Ürün <strong>karşı ödemeli</strong> gönderilecek: kargo ücreti müşteriye
                      ait. Müşteri teslim almazsa kargo koliyi aynı takip numarasıyla bize
                      döndürür — o yüzden numarayı doğru girmek önemli, depoda geleni bu
                      numaradan arayacaksınız.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kargo Takip Numarası <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sendBackTrackingNumber}
                      onChange={(e) => setSendBackTrackingNumber(e.target.value)}
                      placeholder="Örn: 1234567890123"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kargo Firması (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={sendBackCarrier}
                      onChange={(e) => setSendBackCarrier(e.target.value)}
                      placeholder="Örn: Yurtiçi Kargo"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </>
              )}

              {actionType === "reject" && actionModalRequest.status === "RECEIVED" && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Ürün depoda ve müşteriye para iade edilmeyecek. Gerekçe <strong>zorunlu</strong>:
                    müşteri ürününün neden kabul edilmediğini bilmeli. Stok geri eklenmez.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {actionType === "reject" && actionModalRequest.status === "RECEIVED" ? (
                    <>
                      Ret Gerekçesi <span className="text-red-500">*</span>
                    </>
                  ) : (
                    "Admin Notu (Opsiyonel)"
                  )}
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
                  ACTION_CONFIG[actionType].tone === "danger"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : ACTION_CONFIG[actionType].tone === "neutral"
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {processingId === actionModalRequest.id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  ACTION_CONFIG[actionType].button
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
