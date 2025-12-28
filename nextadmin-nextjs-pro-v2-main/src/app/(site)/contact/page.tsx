"use client";

import { useEffect, useState } from "react";
import { 
  Trash2, 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Send,
  Eye,
  X,
  MessageSquare,
  Phone,
  Clock,
  ChevronDown
} from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "UNREAD" | "READ" | "REPLIED" | "SPAM" | "ARCHIVED";
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  spam: number;
}

const statusConfig = {
  UNREAD: { label: "Okunmadı", color: "bg-red-100 text-red-600 dark:bg-red-500/10" },
  READ: { label: "Okundu", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10" },
  REPLIED: { label: "Yanıtlandı", color: "bg-green-100 text-green-600 dark:bg-green-500/10" },
  SPAM: { label: "Spam", color: "bg-gray-100 text-gray-600 dark:bg-gray-500/10" },
  ARCHIVED: { label: "Arşiv", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/10" },
};

export default function ContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, read: 0, replied: 0, spam: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);
      
      const res = await fetch(`/api/admin/contact?${params}`);
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
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const handleSearch = () => {
    fetchMessages();
  };

  const handleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map(m => m.id));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      const res = await fetch("/api/admin/contact", {
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
      const res = await fetch("/api/admin/contact", {
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

  const handleViewMessage = async (msg: ContactMessage) => {
    setViewMessage(msg);
    setReplyText("");
    
    // Okunmadıysa okundu olarak işaretle
    if (msg.status === "UNREAD") {
      await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, status: "READ" }),
      });
      fetchMessages();
    }
  };

  const handleSendReply = async () => {
    if (!viewMessage || !replyText.trim()) return;
    
    setSending(true);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: viewMessage.id, reply: replyText }),
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
          <h1 className="text-2xl font-bold text-dark dark:text-white">İletişim Formları</h1>
          <p className="text-gray-500">Müşteri mesajlarını yönetin ve yanıtlayın</p>
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500">Toplam</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-red-500">{stats.unread}</p>
          <p className="text-sm text-gray-500">Okunmamış</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-yellow-500">{stats.read}</p>
          <p className="text-sm text-gray-500">Okundu</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{stats.replied}</p>
          <p className="text-sm text-gray-500">Yanıtlandı</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-gray-500">{stats.spam}</p>
          <p className="text-sm text-gray-500">Spam</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="İsim, e-posta veya mesaj ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white"
        >
          <option value="">Tüm Durumlar</option>
          <option value="UNREAD">Okunmadı</option>
          <option value="READ">Okundu</option>
          <option value="REPLIED">Yanıtlandı</option>
          <option value="SPAM">Spam</option>
        </select>
        <button
          onClick={handleSearch}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary/90"
        >
          Ara
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">{selectedIds.length} mesaj seçildi</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatus("READ")}
              className="px-3 py-1.5 text-sm rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            >
              Okundu
            </button>
            <button
              onClick={() => handleBulkStatus("SPAM")}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Spam
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Sil
            </button>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Mesajlar</h2>
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
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-dark dark:text-white mb-2">Henüz mesaj yok</p>
            <p className="text-sm text-gray-500 max-w-md">
              Müşterilerinizden gelen iletişim formu mesajları burada görünecektir.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-dark-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-2 cursor-pointer transition-colors ${
                  msg.status === "UNREAD" ? "bg-primary/5" : ""
                }`}
                onClick={() => handleViewMessage(msg)}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(msg.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelect(msg.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-4 h-4 rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium text-primary">{msg.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-dark dark:text-white">{msg.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {msg.email}
                            {msg.phone && (
                              <>
                                <span className="text-gray-300">|</span>
                                <Phone className="w-3 h-3" />
                                {msg.phone}
                              </>
                            )}
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
                    {msg.subject && (
                      <p className="font-medium text-dark dark:text-white mb-1">{msg.subject}</p>
                    )}
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
          <div className="w-full max-w-2xl bg-white dark:bg-gray-dark rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-dark border-b border-stroke dark:border-dark-3 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark dark:text-white">Mesaj Detayı</h3>
              <button
                onClick={() => setViewMessage(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Sender Info */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{viewMessage.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-dark dark:text-white">{viewMessage.name}</p>
                  <p className="text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {viewMessage.email}
                  </p>
                  {viewMessage.phone && (
                    <p className="text-gray-500 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {viewMessage.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-2">
                {viewMessage.subject && (
                  <p className="font-bold text-dark dark:text-white mb-2">{viewMessage.subject}</p>
                )}
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{viewMessage.message}</p>
                <p className="text-xs text-gray-400 mt-4">{formatDate(viewMessage.createdAt)}</p>
              </div>

              {/* Previous Reply */}
              {viewMessage.adminReply && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Yanıtlandı</span>
                    <span className="text-xs text-green-600">
                      {viewMessage.repliedAt && formatDate(viewMessage.repliedAt)}
                    </span>
                  </div>
                  <p className="text-green-800 dark:text-green-300 whitespace-pre-wrap">{viewMessage.adminReply}</p>
                </div>
              )}

              {/* Reply Form */}
              {viewMessage.status !== "REPLIED" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-dark dark:text-white">
                    E-posta ile Yanıtla
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={5}
                    placeholder="Yanıtınızı buraya yazın..."
                    className="w-full rounded-xl border border-stroke bg-white px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white resize-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sending}
                    className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        E-posta Gönder
                      </>
                    )}
                  </button>
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
                <h3 className="text-lg font-bold text-dark dark:text-white">Mesajları Sil</h3>
                <p className="text-gray-500">{selectedIds.length} mesaj silinecek</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bu işlem geri alınamaz. Seçili mesajlar kalıcı olarak silinecektir.
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
