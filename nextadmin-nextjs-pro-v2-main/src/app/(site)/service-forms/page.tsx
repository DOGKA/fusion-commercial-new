"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Eye,
  X,
  Phone,
  Clock,
  ChevronDown,
  FileText,
  Download,
  Image as ImageIcon,
  Wrench,
  Mail,
  MapPin,
  StickyNote,
} from "lucide-react";

interface ServiceFormMessage {
  id: string;
  name: string;
  title: string | null;
  invoiceNo: string;
  platform: string;
  phone: string;
  purchaseDate: string;
  invoiceType: string;
  orderNumber: string | null;
  email: string;
  invoicePdfUrl: string;
  message: string;
  mediaUrls: string[];
  returnAddress: string;
  packagingConfirm: boolean;
  faultFeeConfirm: boolean;
  status: "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "REPLIED";
  adminReply: string | null;
  adminNote: string | null;
  repliedAt: string | null;
  repliedBy: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  replied: number;
}

const statusConfig = {
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400" },
  IN_REVIEW: { label: "İncelemede", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
  APPROVED: { label: "Onaylandı", color: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400" },
  REJECTED: { label: "Reddedildi", color: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
  REPLIED: { label: "Yanıtlandı", color: "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" },
};

export default function ServiceFormsPage() {
  const [messages, setMessages] = useState<ServiceFormMessage[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inReview: 0, approved: 0, rejected: 0, replied: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [viewMessage, setViewMessage] = useState<ServiceFormMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [actionMode, setActionMode] = useState<"approve" | "reject" | null>(null);
  const [sending, setSending] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/service-forms?${params}`);
      const data = await res.json();

      if (res.ok) {
        setMessages(data.messages);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSelectAll = () => {
    setSelectedIds(selectedIds.length === messages.length ? [] : messages.map((m) => m.id));
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/admin/service-forms", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        setSelectedIds([]);
        setDeleteConfirm(false);
        fetchMessages();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleBulkStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/admin/service-forms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status }),
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchMessages();
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const handleViewMessage = (msg: ServiceFormMessage) => {
    setViewMessage(msg);
    setReplyText("");
    setNoteText(msg.adminNote || "");
  };

  const handleStatusChange = async (status: string, reason?: string) => {
    if (!viewMessage) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/service-forms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: viewMessage.id,
          status,
          reason: reason || undefined,
          adminNote: noteText || undefined,
        }),
      });
      if (res.ok) {
        setViewMessage(null);
        setActionMode(null);
        setReasonText("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Status change error:", error);
    } finally {
      setSending(false);
    }
  };

  const handleSaveNote = async () => {
    if (!viewMessage) return;
    try {
      await fetch("/api/admin/service-forms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: viewMessage.id, adminNote: noteText }),
      });
      fetchMessages();
    } catch (error) {
      console.error("Note save error:", error);
    }
  };

  const handleSendReply = async () => {
    if (!viewMessage || !replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/service-forms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: viewMessage.id, reply: replyText, adminNote: noteText || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setViewMessage(null);
        setReplyText("");
        fetchMessages();
      } else {
        alert(data.error || "E-posta gönderilemedi");
      }
    } catch (error) {
      console.error("Reply error:", error);
      alert("E-posta gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
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
          <h1 className="text-2xl font-bold text-dark dark:text-white">Servis Formları</h1>
          <p className="text-gray-500">Servis taleplerini yönetin ve yanıtlayın</p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke bg-white hover:bg-gray-50 dark:border-dark-3 dark:bg-gray-dark dark:hover:bg-dark-2"
        >
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500">Toplam</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
          <p className="text-sm text-gray-500">Bekliyor</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-blue-500">{stats.inReview}</p>
          <p className="text-sm text-gray-500">İncelemede</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
          <p className="text-sm text-gray-500">Onaylandı</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
          <p className="text-sm text-gray-500">Reddedildi</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-purple-500">{stats.replied}</p>
          <p className="text-sm text-gray-500">Yanıtlandı</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="İsim, e-posta, telefon veya fatura no ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchMessages()}
            className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white"
        >
          <option value="">Tüm Durumlar</option>
          <option value="PENDING">Bekliyor</option>
          <option value="IN_REVIEW">İncelemede</option>
          <option value="APPROVED">Onaylandı</option>
          <option value="REJECTED">Reddedildi</option>
          <option value="REPLIED">Yanıtlandı</option>
        </select>
        <button
          onClick={fetchMessages}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary/90"
        >
          Ara
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">{selectedIds.length} form seçildi</span>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => handleBulkStatus("IN_REVIEW")} className="px-3 py-1.5 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400">İncelemeye Al</button>
            <button onClick={() => handleBulkStatus("APPROVED")} className="px-3 py-1.5 text-sm rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/10 dark:text-green-400">Onayla</button>
            <button onClick={() => handleBulkStatus("REJECTED")} className="px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400">Reddet</button>
            <button onClick={() => setDeleteConfirm(true)} className="px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Sil
            </button>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Servis Talepleri
          </h2>
          {messages.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.length === messages.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-500">Tümünü Seç</span>
            </label>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-dark-2 flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-dark dark:text-white mb-2">Henüz servis talebi yok</p>
            <p className="text-sm text-gray-500 max-w-md">
              Müşterilerden gelen servis formu talepleri burada görünecektir.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-dark-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-2 cursor-pointer transition-colors ${
                  msg.status === "PENDING" ? "bg-yellow-50/50 dark:bg-yellow-900/5" : ""
                }`}
                onClick={() => handleViewMessage(msg)}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(msg.id)}
                    onChange={(e) => { e.stopPropagation(); handleSelect(msg.id); }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-4 h-4 rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <span className="font-medium text-amber-600 dark:text-amber-400">{msg.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-dark dark:text-white">{msg.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{msg.email}</span>
                            <span className="text-gray-300 hidden sm:inline">|</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{msg.phone}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusConfig[msg.status].color}`}>
                          {statusConfig[msg.status].label}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-1 flex-wrap">
                      <span>Platform: <strong>{msg.platform}</strong></span>
                      <span>Fatura: <strong>{msg.invoiceNo}</strong></span>
                      <span>Tip: <strong>{msg.invoiceType}</strong></span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Message Modal */}
      {viewMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-gray-dark rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-dark border-b border-stroke dark:border-dark-3 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Servis Talebi Detayı
              </h3>
              <button onClick={() => setViewMessage(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium ${statusConfig[viewMessage.status].color}`}>
                  {statusConfig[viewMessage.status].label}
                </span>
                <span className="text-sm text-gray-500">{formatDate(viewMessage.createdAt)}</span>
              </div>

              {/* Sender Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-2">
                  <p className="text-xs text-gray-500 mb-1">İsim Soyisim</p>
                  <p className="font-medium text-dark dark:text-white">{viewMessage.name}</p>
                  {viewMessage.title && <p className="text-sm text-gray-500">{viewMessage.title}</p>}
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-2">
                  <p className="text-xs text-gray-500 mb-1">İletişim</p>
                  <p className="text-sm text-dark dark:text-white flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{viewMessage.email}</p>
                  <p className="text-sm text-dark dark:text-white flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{viewMessage.phone}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-2">
                  <p className="text-xs text-gray-500">Fatura No</p>
                  <p className="font-medium text-dark dark:text-white text-sm">{viewMessage.invoiceNo}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-2">
                  <p className="text-xs text-gray-500">Platform</p>
                  <p className="font-medium text-dark dark:text-white text-sm">{viewMessage.platform}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-2">
                  <p className="text-xs text-gray-500">Fatura Tipi</p>
                  <p className="font-medium text-dark dark:text-white text-sm">{viewMessage.invoiceType}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-2">
                  <p className="text-xs text-gray-500">Satın Alım Tarihi</p>
                  <p className="font-medium text-dark dark:text-white text-sm">{formatDate(viewMessage.purchaseDate)}</p>
                </div>
              </div>

              {viewMessage.orderNumber && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-2">
                  <p className="text-xs text-gray-500">Sipariş Numarası</p>
                  <p className="font-medium text-dark dark:text-white text-sm">{viewMessage.orderNumber}</p>
                </div>
              )}

              {/* Message */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-2">
                <p className="text-xs text-gray-500 mb-2 font-medium">Mesaj / Arıza Açıklaması</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{viewMessage.message}</p>
              </div>

              {/* Return Address */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-2">
                <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Geri Gönderim Adresi</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{viewMessage.returnAddress}</p>
              </div>

              {/* Files */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-dark dark:text-white">Dosyalar</p>
                {viewMessage.invoicePdfUrl && viewMessage.invoicePdfUrl !== "s3-not-configured" && (
                  <a
                    href={viewMessage.invoicePdfUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Fatura PDF</span>
                    <Download className="w-4 h-4 ml-auto text-blue-500" />
                  </a>
                )}
                {viewMessage.mediaUrls && viewMessage.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {viewMessage.mediaUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-stroke dark:border-dark-3 hover:opacity-80 transition-opacity">
                        {url.match(/\.(mp4|mov|webm)$/i) ? (
                          <div className="aspect-video bg-gray-100 dark:bg-dark-2 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                            <span className="text-xs text-gray-500 ml-1">Video</span>
                          </div>
                        ) : (
                          <img src={url} alt={`Dosya ${i + 1}`} className="aspect-video object-cover w-full" />
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmations */}
              <div className="flex gap-4 flex-wrap text-xs">
                <span className={`px-2 py-1 rounded ${viewMessage.packagingConfirm ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-100 text-red-700"}`}>
                  Paketleme Onayı: {viewMessage.packagingConfirm ? "Evet" : "Hayır"}
                </span>
                <span className={`px-2 py-1 rounded ${viewMessage.faultFeeConfirm ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-red-100 text-red-700"}`}>
                  Arıza Tespit Onayı: {viewMessage.faultFeeConfirm ? "Evet" : "Hayır"}
                </span>
              </div>

              {/* Previous Reply */}
              {viewMessage.adminReply && (
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Yanıtlandı</span>
                    {viewMessage.repliedAt && <span className="text-xs">{formatDate(viewMessage.repliedAt)}</span>}
                  </div>
                  <p className="text-purple-800 dark:text-purple-300 whitespace-pre-wrap">{viewMessage.adminReply}</p>
                </div>
              )}

              {/* Admin Note */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-dark dark:text-white flex items-center gap-1">
                  <StickyNote className="w-4 h-4" />
                  Admin Notu (iç kullanım)
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  placeholder="İç not yazın (müşteriye gönderilmez)..."
                  className="w-full rounded-xl border border-stroke bg-white px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white resize-none text-sm"
                />
                <button
                  onClick={handleSaveNote}
                  className="text-sm text-primary hover:underline"
                >
                  Notu Kaydet
                </button>
              </div>

              {/* Action Buttons */}
              {viewMessage.status !== "REPLIED" && (
                <div className="space-y-4">
                  {/* Status Actions */}
                  {!actionMode && (
                    <div className="flex gap-3 flex-wrap">
                      {viewMessage.status !== "IN_REVIEW" && (
                        <button
                          onClick={() => handleStatusChange("IN_REVIEW")}
                          disabled={sending}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Eye className="w-4 h-4" /> İncelemeye Al
                        </button>
                      )}
                      {viewMessage.status !== "APPROVED" && (
                        <button
                          onClick={() => { setActionMode("approve"); setReasonText(""); }}
                          disabled={sending}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" /> Onayla
                        </button>
                      )}
                      {viewMessage.status !== "REJECTED" && (
                        <button
                          onClick={() => { setActionMode("reject"); setReasonText(""); }}
                          disabled={sending}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Reddet
                        </button>
                      )}
                    </div>
                  )}

                  {/* Approve/Reject Reason Form */}
                  {actionMode && (
                    <div className={`p-4 rounded-xl border ${actionMode === "approve" ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800" : "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800"}`}>
                      <p className={`text-sm font-medium mb-3 ${actionMode === "approve" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                        {actionMode === "approve" ? "Onay Açıklaması (opsiyonel)" : "Ret Sebebi (opsiyonel)"}
                      </p>
                      <textarea
                        value={reasonText}
                        onChange={(e) => setReasonText(e.target.value)}
                        rows={3}
                        placeholder={actionMode === "approve" ? "Onay ile ilgili açıklama yazın..." : "Ret sebebini yazın..."}
                        className="w-full rounded-xl border border-stroke bg-white px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white resize-none text-sm mb-3"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setActionMode(null)}
                          className="flex-1 py-2.5 rounded-xl border border-stroke hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2 text-sm"
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => handleStatusChange(actionMode === "approve" ? "APPROVED" : "REJECTED", reasonText)}
                          disabled={sending}
                          className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 ${actionMode === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                        >
                          {sending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : actionMode === "approve" ? (
                            <><CheckCircle className="w-4 h-4" /> Onayla ve Mail Gönder</>
                          ) : (
                            <><XCircle className="w-4 h-4" /> Reddet ve Mail Gönder</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-dark rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark dark:text-white">Formları Sil</h3>
                <p className="text-gray-500">{selectedIds.length} form silinecek</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bu işlem geri alınamaz. Seçili formlar kalıcı olarak silinecektir.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-stroke hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
              >
                İptal
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
