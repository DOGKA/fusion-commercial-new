"use client";

import { useState, useEffect, useCallback } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { cn } from "@/lib/utils";

interface DeliveredOrder {
  id: string;
  orderNumber: string;
  deliveredAt: string;
  reviewReminderSent: boolean;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      thumbnail: string | null;
      slug: string;
    };
    hasReview: boolean;
  }>;
}

export default function ReviewReminderPage() {
  const [orders, setOrders] = useState<DeliveredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "sent" | "ready">("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    reviewed: 0,
    ready: 0,
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing/review-reminder?filter=${filter}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setStats(data.stats || { total: 0, pending: 0, sent: 0, reviewed: 0, ready: 0 });
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const sendReminder = async (orderId: string) => {
    setSending(orderId);
    try {
      const res = await fetch("/api/marketing/review-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.error || "Hata oluştu");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Hata oluştu");
    } finally {
      setSending(null);
    }
  };

  const sendAllReminders = async () => {
    if (!confirm("7+ gün önce teslim edilen tüm siparişlere yorum hatırlatma e-postası gönderilecek. Devam etmek istiyor musunuz?")) {
      return;
    }
    setSendingAll(true);
    try {
      const res = await fetch("/api/marketing/review-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendAll: true }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${data.sent} e-posta gönderildi, ${data.failed} başarısız, ${data.skipped} atlandı.`);
        fetchOrders();
      } else {
        alert(data.error || "Hata oluştu");
      }
    } catch (error) {
      console.error("Error sending all reminders:", error);
      alert("Hata oluştu");
    } finally {
      setSendingAll(false);
    }
  };

  const daysSinceDelivery = (deliveredAt: string) => {
    const delivered = new Date(deliveredAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - delivered.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isReady = (deliveredAt: string) => daysSinceDelivery(deliveredAt) >= 7;

  return (
    <>
      <Breadcrumb pageName="Yorum Hatırlatıcı" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mb-6">
        <div className="rounded-xl border border-stroke bg-white p-4 shadow-default dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Teslim</p>
              <p className="text-xl font-bold text-dark dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-4 shadow-default dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hazır (7+ gün)</p>
              <p className="text-xl font-bold text-green-600">{stats.ready}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-4 shadow-default dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bekleyen</p>
              <p className="text-xl font-bold text-dark dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-4 shadow-default dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gönderildi</p>
              <p className="text-xl font-bold text-dark dark:text-white">{stats.sent}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-4 shadow-default dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Yorum Yapıldı</p>
              <p className="text-xl font-bold text-dark dark:text-white">{stats.reviewed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filter === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-2 dark:text-gray-300"
            )}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter("ready")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filter === "ready"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-2 dark:text-gray-300"
            )}
          >
            Hazır (7+ gün)
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filter === "pending"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-2 dark:text-gray-300"
            )}
          >
            Bekleyen
          </button>
          <button
            onClick={() => setFilter("sent")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filter === "sent"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-2 dark:text-gray-300"
            )}
          >
            Gönderildi
          </button>
        </div>

        <button
          onClick={sendAllReminders}
          disabled={sendingAll || stats.ready === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingAll ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Gönderiliyor...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Toplu Hatırlatma Gönder ({stats.ready})
            </>
          )}
        </button>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-dark-3 dark:bg-gray-dark">
        <div className="p-4 border-b border-stroke dark:border-dark-3">
          <h3 className="text-lg font-semibold text-dark dark:text-white">
            Teslim Edilen Siparişler
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Yorum hatırlatma e-postası gönderilebilecek siparişler
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <svg className="w-8 h-8 animate-spin mx-auto text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-500">Yükleniyor...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-2 text-gray-500">Gösterilecek sipariş yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-2">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Sipariş
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Müşteri
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Ürünler
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Teslim Tarihi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Yorum Durumu
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Hatırlatma
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-dark-3">
                {orders.map((order) => {
                  const reviewedCount = order.items.filter((i) => i.hasReview).length;
                  const totalItems = order.items.length;
                  const allReviewed = reviewedCount === totalItems;
                  const days = daysSinceDelivery(order.deliveredAt);
                  const ready = isReady(order.deliveredAt);

                  return (
                    <tr 
                      key={order.id} 
                      className={cn(
                        "hover:bg-gray-50 dark:hover:bg-dark-2",
                        ready && !order.reviewReminderSent && !allReviewed && "bg-green-50 dark:bg-green-900/10"
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-medium text-dark dark:text-white">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-dark dark:text-white">
                            {order.user.name || "İsimsiz"}
                          </p>
                          <p className="text-xs text-gray-500">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-xs font-bold",
                                  item.hasReview ? "text-green-500" : "text-gray-400"
                                )}
                              >
                                {item.hasReview ? "✓" : "○"}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                                {item.product.name}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{order.items.length - 2} ürün daha
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-dark dark:text-white">
                            {new Date(order.deliveredAt).toLocaleDateString("tr-TR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                          <p className={cn(
                            "text-xs font-medium",
                            ready ? "text-green-600" : "text-gray-500"
                          )}>
                            {days} gün önce {ready && "(Hazır)"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {allReviewed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium dark:bg-green-900/20 dark:text-green-400">
                            Tamamlandı
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium dark:bg-yellow-900/20 dark:text-yellow-400">
                            {reviewedCount}/{totalItems} Yorum
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {order.reviewReminderSent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium dark:bg-blue-900/20 dark:text-blue-400">
                            Gönderildi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium dark:bg-gray-800 dark:text-gray-400">
                            Bekliyor
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!order.reviewReminderSent && !allReviewed && (
                          <button
                            onClick={() => sendReminder(order.id)}
                            disabled={sending === order.id}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50",
                              ready 
                                ? "bg-green-500 text-white hover:bg-green-600" 
                                : "bg-primary text-white hover:bg-primary/90"
                            )}
                          >
                            {sending === order.id ? "..." : "Gönder"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
