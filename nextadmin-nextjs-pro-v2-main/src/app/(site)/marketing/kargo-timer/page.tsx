"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────
// Tipler
// ─────────────────────────────────────────────────────────────────────────

interface Settings {
  timerEnabled: boolean;
  weekdayCutoffHour: number;
  weekdayCutoffMinute: number;
  saturdayEnabled: boolean;
  saturdayCutoffHour: number;
  saturdayCutoffMinute: number;
}

interface Holiday {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isRecurring: boolean;
}

interface Payload {
  settings: Settings;
  holidays: Holiday[];
}

interface Message {
  type: "success" | "error";
  text: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Yardımcılar (admin UI için yerel preview hesaplaması)
// ─────────────────────────────────────────────────────────────────────────

const WEEKDAY_NAMES_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatTime(h: number, m: number): string {
  return `${pad(h)}:${pad(m)}`;
}

function formatDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  // Hafta günü
  const date = new Date(Date.UTC(y, mo - 1, d));
  const weekday = WEEKDAY_NAMES_TR[date.getUTCDay()];
  return `${d} ${months[mo - 1]} ${y} • ${weekday}`;
}

function expandRange(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  const s = startIso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const e = endIso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!s || !e) return out;
  const cur = new Date(Date.UTC(+s[1], +s[2] - 1, +s[3]));
  const stop = new Date(Date.UTC(+e[1], +e[2] - 1, +e[3]));
  while (cur.getTime() <= stop.getTime()) {
    out.push(`${cur.getUTCFullYear()}-${pad(cur.getUTCMonth() + 1)}-${pad(cur.getUTCDate())}`);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/**
 * Preview için frontend KargoTimer ile aynı algoritma — admin canlı önizleme.
 * Verilen "şu an" tarihinin hangi günü kargo edileceğini hesaplar.
 */
function findShipDayPreview(
  nowIso: string,
  hourMin: { hour: number; minute: number },
  settings: Settings,
  holidaySet: Set<string>,
): { shipIso: string; dayDiff: number; label: string } {
  const m = nowIso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return { shipIso: nowIso, dayDiff: 0, label: "Bugün" };
  const today = { y: +m[1], mo: +m[2], d: +m[3] };
  const todayIsoStr = `${today.y}-${pad(today.mo)}-${pad(today.d)}`;

  const cursor = new Date(Date.UTC(today.y, today.mo - 1, today.d));

  for (let i = 0; i < 60; i++) {
    const y = cursor.getUTCFullYear();
    const mo = cursor.getUTCMonth() + 1;
    const d = cursor.getUTCDate();
    const iso = `${y}-${pad(mo)}-${pad(d)}`;
    const weekday = cursor.getUTCDay();
    const isHoliday = holidaySet.has(iso);
    const isSunday = weekday === 0;
    const isSaturday = weekday === 6;
    const isOpen = !isHoliday && !isSunday && !(isSaturday && !settings.saturdayEnabled);

    if (isOpen) {
      if (iso === todayIsoStr) {
        const cutoff = isSaturday
          ? { h: settings.saturdayCutoffHour, m: settings.saturdayCutoffMinute }
          : { h: settings.weekdayCutoffHour, m: settings.weekdayCutoffMinute };
        const nowMin = hourMin.hour * 60 + hourMin.minute;
        const cutoffMin = cutoff.h * 60 + cutoff.m;
        if (nowMin < cutoffMin) {
          return { shipIso: iso, dayDiff: 0, label: "Bugün" };
        }
      } else {
        const diff = i;
        const label = diff === 1 ? "Yarın" : WEEKDAY_NAMES_TR[weekday] ?? "";
        return { shipIso: iso, dayDiff: diff, label };
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { shipIso: todayIsoStr, dayDiff: 0, label: "Bugün" };
}

// ─────────────────────────────────────────────────────────────────────────
// Sayfa
// ─────────────────────────────────────────────────────────────────────────

const todayIso = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
})();

export default function KargoTimerAdminPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // Form state (settings)
  const [settings, setSettings] = useState<Settings | null>(null);

  // Holiday form
  const [holidayMode, setHolidayMode] = useState<"single" | "range">("single");
  const [hStart, setHStart] = useState("");
  const [hEnd, setHEnd] = useState("");
  const [hName, setHName] = useState("");
  const [hDesc, setHDesc] = useState("");
  const [savingHoliday, setSavingHoliday] = useState(false);

  // Tab filter
  const [filterTab, setFilterTab] = useState<"future" | "past" | "all">("future");

  // Preview controls
  const [previewDate, setPreviewDate] = useState(todayIso);
  const [previewTime, setPreviewTime] = useState("14:30");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/marketing/kargo-timer", { cache: "no-store" });
      if (!res.ok) throw new Error("Veriler alınamadı");
      const payload: Payload = await res.json();
      setData(payload);
      setSettings(payload.settings);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Hata" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/marketing/kargo-timer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Kaydedilemedi");
      setMessage({ type: "success", text: "Ayarlar kaydedildi" });
      fetchData();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Hata" });
    } finally {
      setSavingSettings(false);
    }
  };

  const addHoliday = async () => {
    if (!hStart || !hName.trim()) {
      setMessage({ type: "error", text: "Tarih ve isim gerekli" });
      return;
    }
    setSavingHoliday(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/marketing/kargo-timer/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: hStart,
          endDate: holidayMode === "range" && hEnd ? hEnd : hStart,
          name: hName.trim(),
          description: hDesc.trim() || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Eklenemedi");
      setMessage({ type: "success", text: "Tatil eklendi" });
      setHStart("");
      setHEnd("");
      setHName("");
      setHDesc("");
      fetchData();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Hata" });
    } finally {
      setSavingHoliday(false);
    }
  };

  const toggleHolidayActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/marketing/kargo-timer/holidays/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Güncellenemedi");
      }
      fetchData();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Hata" });
    }
  };

  const deleteHoliday = async (id: string) => {
    if (!confirm("Bu tatil günü silinsin mi?")) return;
    try {
      const res = await fetch(`/api/admin/marketing/kargo-timer/holidays/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Silinemedi");
      }
      setMessage({ type: "success", text: "Tatil silindi" });
      fetchData();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Hata" });
    }
  };

  // Tatil listesini filtrele
  const filteredHolidays = useMemo(() => {
    if (!data) return [];
    const today = todayIso;
    return data.holidays.filter((h) => {
      if (filterTab === "all") return true;
      if (filterTab === "future") return h.endDate >= today;
      return h.endDate < today;
    });
  }, [data, filterTab]);

  // Preview hesaplaması (sadece aktif tatiller ile)
  const previewResult = useMemo(() => {
    if (!settings || !data) return null;
    const set = new Set<string>();
    for (const h of data.holidays) {
      if (!h.isActive) continue;
      for (const iso of expandRange(h.startDate, h.endDate)) set.add(iso);
    }
    const [hStr, mStr] = previewTime.split(":");
    const hour = parseInt(hStr || "0", 10);
    const minute = parseInt(mStr || "0", 10);
    return findShipDayPreview(previewDate, { hour, minute }, settings, set);
  }, [settings, data, previewDate, previewTime]);

  if (loading || !settings || !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Kargo Timer</h1>
        <p className="text-gray-500">
          Ürün sayfalarındaki kargo geri sayım banner&apos;ı için cut-off saatleri ve kapalı günleri yönetin
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* KART 1 — Genel Ayarlar */}
      <section className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-white">Genel Ayarlar</h2>
            <p className="text-sm text-gray-500">Cut-off saatleri ve timer&apos;ın aktiflik durumu</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-3">
            <span className="text-sm font-medium text-dark dark:text-white">Timer aktif</span>
            <input
              type="checkbox"
              className="peer sr-only"
              checked={settings.timerEnabled}
              onChange={(e) => setSettings({ ...settings, timerEnabled: e.target.checked })}
            />
            <span className="relative h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-primary">
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">
              Hafta içi cut-off saati
            </label>
            <div className="flex items-center gap-2">
              <select
                value={settings.weekdayCutoffHour}
                onChange={(e) =>
                  setSettings({ ...settings, weekdayCutoffHour: parseInt(e.target.value, 10) })
                }
                className="rounded-md border border-stroke bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{pad(i)}</option>
                ))}
              </select>
              <span className="text-gray-500">:</span>
              <select
                value={settings.weekdayCutoffMinute}
                onChange={(e) =>
                  setSettings({ ...settings, weekdayCutoffMinute: parseInt(e.target.value, 10) })
                }
                className="rounded-md border border-stroke bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>{pad(m)}</option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Bu saatten önce sipariş veren müşteriye &quot;Bugün Kargoda&quot; gösterilir.
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-dark dark:text-white">
                Cumartesi cut-off saati
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={settings.saturdayEnabled}
                  onChange={(e) => setSettings({ ...settings, saturdayEnabled: e.target.checked })}
                />
                <span className="relative h-5 w-9 rounded-full bg-gray-300 transition peer-checked:bg-primary">
                  <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
                </span>
                <span className="text-xs text-gray-500">Cumartesi aktif</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={settings.saturdayCutoffHour}
                disabled={!settings.saturdayEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, saturdayCutoffHour: parseInt(e.target.value, 10) })
                }
                className="rounded-md border border-stroke bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{pad(i)}</option>
                ))}
              </select>
              <span className="text-gray-500">:</span>
              <select
                value={settings.saturdayCutoffMinute}
                disabled={!settings.saturdayEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, saturdayCutoffMinute: parseInt(e.target.value, 10) })
                }
                className="rounded-md border border-stroke bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>{pad(m)}</option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {settings.saturdayEnabled
                ? "Cumartesi günü kargo gönderiliyor."
                : "Cumartesi kapalı — kargo Pazartesi&apos;ye atlanır."}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-stroke pt-4 dark:border-dark-3">
          <div className="text-xs text-gray-500">
            <strong>Çalışma günleri:</strong> Pazartesi-Cuma her zaman açık • Pazar her zaman kapalı
          </div>
          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {savingSettings ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </button>
        </div>
      </section>

      {/* KART 2 — Canlı Önizleme */}
      <section className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-dark dark:text-white">Canlı Önizleme</h2>
          <p className="text-sm text-gray-500">
            Seçtiğiniz tarih/saat için müşterinin göreceği yazıyı simüle edin
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">Tarih</label>
            <input
              type="date"
              value={previewDate}
              onChange={(e) => setPreviewDate(e.target.value)}
              className="w-full rounded-md border border-stroke bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">Saat</label>
            <input
              type="time"
              value={previewTime}
              onChange={(e) => setPreviewTime(e.target.value)}
              className="w-full rounded-md border border-stroke bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <div className="w-full rounded-lg border border-dashed border-stroke bg-gray-50 p-3 text-center dark:border-dark-3 dark:bg-dark-2">
              <div className="text-xs uppercase tracking-wider text-gray-500">Müşteri görür</div>
              {previewResult ? (
                <div className="mt-1 text-base font-bold text-emerald-600">
                  {previewResult.label === "Bugün"
                    ? "Bugün Kargoda"
                    : `${previewResult.label} Sabah Kargoda`}
                </div>
              ) : (
                <div className="mt-1 text-base font-bold text-gray-400">—</div>
              )}
              {previewResult && (
                <div className="mt-0.5 text-xs text-gray-500">
                  Sevkiyat: {formatDate(previewResult.shipIso)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* KART 3 — Tatiller / Kapalı Günler */}
      <section className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-dark dark:text-white">Kapalı Günler / Tatiller</h2>
          <p className="text-sm text-gray-500">
            Bu tarihlerde kargo çıkmaz — timer otomatik olarak bir sonraki açık güne atlar
          </p>
        </div>

        {/* Yeni tatil ekleme formu */}
        <div className="mb-6 rounded-lg border border-stroke bg-gray-50 p-4 dark:border-dark-3 dark:bg-dark-2">
          <div className="mb-3 flex gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-dark dark:text-white">
              <input
                type="radio"
                name="holidayMode"
                checked={holidayMode === "single"}
                onChange={() => setHolidayMode("single")}
              />
              Tek gün
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-dark dark:text-white">
              <input
                type="radio"
                name="holidayMode"
                checked={holidayMode === "range"}
                onChange={() => setHolidayMode("range")}
              />
              Tarih aralığı
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-dark dark:text-white">
                {holidayMode === "range" ? "Başlangıç" : "Tarih"}
              </label>
              <input
                type="date"
                value={hStart}
                onChange={(e) => setHStart(e.target.value)}
                className="w-full rounded-md border border-stroke bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark dark:text-white"
              />
            </div>
            {holidayMode === "range" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-dark dark:text-white">Bitiş</label>
                <input
                  type="date"
                  value={hEnd}
                  onChange={(e) => setHEnd(e.target.value)}
                  className="w-full rounded-md border border-stroke bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark dark:text-white"
                />
              </div>
            )}
            <div className={holidayMode === "range" ? "" : "sm:col-span-2"}>
              <label className="mb-1 block text-xs font-medium text-dark dark:text-white">İsim *</label>
              <input
                type="text"
                value={hName}
                onChange={(e) => setHName(e.target.value)}
                placeholder="Gençlik ve Spor Bayramı"
                className="w-full rounded-md border border-stroke bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-dark dark:text-white">Açıklama</label>
              <input
                type="text"
                value={hDesc}
                onChange={(e) => setHDesc(e.target.value)}
                placeholder="Opsiyonel"
                className="w-full rounded-md border border-stroke bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark dark:text-white"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={addHoliday}
              disabled={savingHoliday}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {savingHoliday ? "Ekleniyor..." : "Tatil Ekle"}
            </button>
          </div>
        </div>

        {/* Filtre tabs */}
        <div className="mb-4 flex gap-2 border-b border-stroke dark:border-dark-3">
          {([
            { id: "future", label: "Gelecek" },
            { id: "past", label: "Geçmiş" },
            { id: "all", label: "Tümü" },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterTab(t.id)}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                filterTab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {filteredHolidays.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stroke p-8 text-center text-sm text-gray-500 dark:border-dark-3">
            Bu filtrede tatil yok
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stroke text-left text-xs uppercase tracking-wider text-gray-500 dark:border-dark-3">
                <tr>
                  <th className="py-2 pr-3 font-medium">Tarih(ler)</th>
                  <th className="py-2 pr-3 font-medium">İsim</th>
                  <th className="py-2 pr-3 font-medium">Açıklama</th>
                  <th className="py-2 pr-3 font-medium">Aktif</th>
                  <th className="py-2 pr-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredHolidays.map((h) => (
                  <tr key={h.id} className="border-b border-stroke last:border-0 dark:border-dark-3">
                    <td className="py-3 pr-3 text-dark dark:text-white">
                      <div className="font-medium">{formatDate(h.startDate)}</div>
                      {h.startDate !== h.endDate && (
                        <div className="text-xs text-gray-500">→ {formatDate(h.endDate)}</div>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-dark dark:text-white">{h.name}</td>
                    <td className="py-3 pr-3 text-gray-500">{h.description || "—"}</td>
                    <td className="py-3 pr-3">
                      <label className="inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={h.isActive}
                          onChange={(e) => toggleHolidayActive(h.id, e.target.checked)}
                        />
                        <span className="relative h-5 w-9 rounded-full bg-gray-300 transition peer-checked:bg-primary">
                          <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
                        </span>
                      </label>
                    </td>
                    <td className="py-3 pr-3">
                      <button
                        onClick={() => deleteHoliday(h.id)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Info card */}
      <section className="rounded-xl border border-stroke bg-blue-50 p-4 text-sm text-blue-900 dark:border-dark-3 dark:bg-blue-900/10 dark:text-blue-200">
        <strong>Nasıl çalışıyor?</strong> Müşteri ürün sayfasındaki banner&apos;da
        <em> &quot;X saat içinde kargoda&quot; </em>
        geri sayımını ve <em>kargo günü</em> bilgisini görür. Cut-off saatinden önce sipariş veren aynı gün
        kargolanır, sonrasında ilk açık gün gösterilir. Kapalı günler (tatiller, Pazar, opsiyonel olarak
        Cumartesi) atlanarak bir sonraki çalışan güne otomatik olarak geçilir. Şu an için zaman dilimi
        Europe/Istanbul olarak sabittir. Tatil eklendikten sonra frontend cache&apos;i en fazla
        <strong> 5 dakika</strong> içinde yansır.
      </section>
    </div>
  );
}
