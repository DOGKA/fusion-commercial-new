"use client";

import { useEffect, useState, useCallback } from "react";

// Tip tanımları
type EmailStatus = "SENT" | "DELIVERED" | "OPENED" | "CLICKED" | "BOUNCED" | "COMPLAINED" | "FAILED";
type EmailType = 
  | "ORDER_CONFIRMATION"
  | "ORDER_STATUS"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "ORDER_REFUNDED"
  | "INVOICE"
  | "PAYMENT_CONFIRMED"
  | "WELCOME"
  | "PASSWORD_RESET"
  | "ABANDONED_CART"
  | "MARKETING"
  | "OTHER";

interface EmailLog {
  id: string;
  resendId: string;
  to: string;
  subject: string;
  type: EmailType;
  status: EmailStatus;
  sentAt: string;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  bouncedAt: string | null;
  errorMessage: string | null;
}

interface Stats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  failed: number;
  openRate: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const typeConfig: Record<EmailType, { label: string; color: string }> = {
  ORDER_CONFIRMATION: { label: "Sipariş Onayı", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/10" },
  ORDER_STATUS: { label: "Sipariş Durumu", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/10" },
  ORDER_SHIPPED: { label: "Kargoya Verildi", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10" },
  ORDER_DELIVERED: { label: "Teslim Edildi", color: "bg-green-100 text-green-600 dark:bg-green-500/10" },
  ORDER_CANCELLED: { label: "İptal", color: "bg-red-100 text-red-600 dark:bg-red-500/10" },
  ORDER_REFUNDED: { label: "İade", color: "bg-orange-100 text-orange-600 dark:bg-orange-500/10" },
  INVOICE: { label: "Fatura", color: "bg-slate-100 text-slate-600 dark:bg-slate-500/10" },
  PAYMENT_CONFIRMED: { label: "Ödeme Onayı", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10" },
  WELCOME: { label: "Hoş Geldin", color: "bg-green-100 text-green-600 dark:bg-green-500/10" },
  PASSWORD_RESET: { label: "Şifre Sıfırlama", color: "bg-amber-100 text-amber-600 dark:bg-amber-500/10" },
  ABANDONED_CART: { label: "Terk Edilmiş Sepet", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10" },
  MARKETING: { label: "Pazarlama", color: "bg-purple-100 text-purple-600 dark:bg-purple-500/10" },
  OTHER: { label: "Diğer", color: "bg-gray-100 text-gray-600 dark:bg-gray-500/10" },
};

const statusConfig: Record<EmailStatus, { label: string; color: string; icon: string }> = {
  SENT: { label: "Gönderildi", color: "text-gray-500", icon: "📤" },
  DELIVERED: { label: "Teslim Edildi", color: "text-green-500", icon: "✅" },
  OPENED: { label: "Açıldı", color: "text-blue-500", icon: "👁️" },
  CLICKED: { label: "Tıklandı", color: "text-indigo-500", icon: "🔗" },
  BOUNCED: { label: "Geri Döndü", color: "text-red-500", icon: "↩️" },
  COMPLAINED: { label: "Spam", color: "text-orange-500", icon: "⚠️" },
  FAILED: { label: "Başarısız", color: "text-red-600", icon: "❌" },
};

export default function MailTrackPage() {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    complained: 0,
    failed: 0,
    openRate: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtreler
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEmails = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (searchQuery) params.set("search", searchQuery);
      
      const response = await fetch(`/api/admin/mail-track?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }
      
      const data = await response.json();
      setEmails(data.emails);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleSearch = () => {
    fetchEmails(1);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Mail Takip</h1>
        <p className="text-gray-500">Gönderilen e-postaları takip edin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500">Toplam</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{stats.delivered}</p>
          <p className="text-sm text-gray-500">Teslim</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-blue-500">{stats.opened + stats.clicked}</p>
          <p className="text-sm text-gray-500">Açıldı</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-red-500">{stats.bounced}</p>
          <p className="text-sm text-gray-500">Geri Döndü</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-orange-500">{stats.failed}</p>
          <p className="text-sm text-gray-500">Başarısız</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-primary">%{stats.openRate}</p>
          <p className="text-sm text-gray-500">Açılma Oranı</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="E-posta veya konu ara..."
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
          <option value="SENT">Gönderildi</option>
          <option value="DELIVERED">Teslim Edildi</option>
          <option value="OPENED">Açıldı</option>
          <option value="CLICKED">Tıklandı</option>
          <option value="BOUNCED">Geri Döndü</option>
          <option value="FAILED">Başarısız</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-stroke bg-white px-4 py-2.5 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-gray-dark dark:text-white"
        >
          <option value="">Tüm Tipler</option>
          <option value="ORDER_CONFIRMATION">Sipariş Onayı</option>
          <option value="ORDER_STATUS">Sipariş Durumu</option>
          <option value="ORDER_SHIPPED">Kargoya Verildi</option>
          <option value="INVOICE">Fatura</option>
          <option value="WELCOME">Hoş Geldin</option>
          <option value="PASSWORD_RESET">Şifre Sıfırlama</option>
          <option value="ABANDONED_CART">Terk Edilmiş Sepet</option>
          <option value="MARKETING">Pazarlama</option>
        </select>
        <button
          onClick={handleSearch}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary/90"
        >
          Ara
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Email Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">
            Gönderilen E-postalar
            {pagination.total > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({pagination.total} kayıt)
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : emails.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-lg">Henüz e-posta kaydı yok</p>
            <p className="mt-1 text-sm">E-postalar gönderildikçe burada görünecek</p>
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-dark-3">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Alıcı</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Konu</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tip</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Durum</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Gönderim</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Açılma</th>
              </tr>
            </thead>
            <tbody>
                  {emails.map((email) => (
                    <tr key={email.id} className="border-b border-stroke last:border-0 dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-2">
                  <td className="px-6 py-4">
                    <span className="text-dark dark:text-white">{email.to}</span>
                  </td>
                  <td className="px-6 py-4">
                        <span className="text-gray-600 dark:text-gray-400 line-clamp-1 max-w-xs" title={email.subject}>
                          {email.subject}
                        </span>
                  </td>
                  <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${typeConfig[email.type]?.color || typeConfig.OTHER.color}`}>
                          {typeConfig[email.type]?.label || email.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                        <span className={`font-medium ${statusConfig[email.status]?.color || "text-gray-500"}`}>
                          <span className="mr-1">{statusConfig[email.status]?.icon || ""}</span>
                          {statusConfig[email.status]?.label || email.status}
                    </span>
                        {email.errorMessage && (
                          <p className="mt-1 text-xs text-red-500 line-clamp-1" title={email.errorMessage}>
                            {email.errorMessage}
                          </p>
                        )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                          {formatDate(email.sentAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                          {formatDate(email.openedAt || email.clickedAt)}
                      </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-stroke px-6 py-4 dark:border-dark-3">
                <p className="text-sm text-gray-500">
                  Sayfa {pagination.page} / {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchEmails(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => fetchEmails(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
        <h3 className="font-medium text-blue-800 dark:text-blue-300">📧 E-posta Takip Nasıl Çalışır?</h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
          <li>• E-postalar Resend API üzerinden gönderilir ve otomatik olarak loglanır</li>
          <li>• Resend webhook&apos;ları ile teslim, açılma ve tıklama durumları güncellenir</li>
          <li>• Geri dönen e-postalar (bounce) ve spam şikayetleri takip edilir</li>
          <li>• Açılma oranı = (Açılan + Tıklanan) / (Teslim Edilen + Açılan + Tıklanan) * 100</li>
        </ul>
      </div>
    </div>
  );
}
