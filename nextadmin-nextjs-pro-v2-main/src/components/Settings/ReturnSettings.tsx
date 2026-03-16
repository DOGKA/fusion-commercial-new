"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, RotateCcw, MapPin, FileText } from "lucide-react";

export default function ReturnSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultReturnAddress, setDefaultReturnAddress] = useState("");
  const [returnShippingInfo, setReturnShippingInfo] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/return");
      if (res.ok) {
        const data = await res.json();
        setDefaultReturnAddress(data.defaultReturnAddress || "");
        setReturnShippingInfo(data.returnShippingInfo || "");
      }
    } catch (error) {
      console.error("Failed to fetch return settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/settings/return", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultReturnAddress,
          returnShippingInfo,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({ type: "success", message: "Ayarlar kaydedildi" });
      } else {
        setNotification({
          type: "error",
          message: data.error || "Ayarlar kaydedilemedi",
        });
      }
    } catch (error) {
      setNotification({ type: "error", message: "Bir hata oluştu" });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Bu ayarlar, iade talebi onaylandığında müşteriye gösterilecek varsayılan bilgileri belirler. 
          Admin her iade onayında bu bilgileri değiştirebilir.
        </p>
      </div>

      {/* Return Address */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Varsayılan İade Adresi
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Müşterilerin iade ürünlerini göndereceği depo/mağaza adresi
        </p>
        <textarea
          value={defaultReturnAddress}
          onChange={(e) => setDefaultReturnAddress(e.target.value)}
          rows={4}
          placeholder="Örn: FusionMarkt Depo\nİstanbul, Türkiye\nTel: 0212 xxx xx xx"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {/* Return Shipping Info */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Varsayılan İade Talimatları
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Kargo ücreti bilgisi ve ek talimatlar
        </p>
        <textarea
          value={returnShippingInfo}
          onChange={(e) => setReturnShippingInfo(e.target.value)}
          rows={3}
          placeholder="Örn: Kargo ücreti alıcı ödemeli olarak gönderilmelidir."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg ${
            notification.type === "success"
              ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20"
              : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
          }`}
        >
          <p
            className={`text-sm ${
              notification.type === "success"
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {notification.message}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={fetchSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          Sıfırla
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Kaydet
            </>
          )}
        </button>
      </div>
    </div>
  );
}
