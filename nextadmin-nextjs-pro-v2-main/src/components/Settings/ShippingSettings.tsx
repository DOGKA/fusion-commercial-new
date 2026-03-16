"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical, MapPin, Package, Settings, Check, X } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface ShippingClass {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cost: number;
  alwaysFree: boolean;
  priority: number;
  isActive: boolean;
  productCount: number;
}

interface ShippingMethod {
  id: string;
  name: string;
  type: "FREE_SHIPPING" | "FLAT_RATE" | "LOCAL_PICKUP";
  description: string | null;
  cost: number;
  freeShippingRequirement: string;
  minOrderAmount: number | null;
  isEnabled: boolean;
}

interface ShippingZoneMethod {
  id: string;
  methodId: string;
  method: ShippingMethod;
  costOverride: number | null;
  isEnabled: boolean;
}

interface ShippingZone {
  id: string;
  name: string;
  regions: string[] | null;
  isActive: boolean;
  methods: ShippingZoneMethod[];
}

interface ShippingSettingsData {
  freeShippingLimit: number;
  heavyClassFreeLimit: number;
  taxRate: number;
  enableShippingCalc: boolean;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ShippingSettings() {
  // Data states
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [classes, setClasses] = useState<ShippingClass[]>([]);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [settings, setSettings] = useState<ShippingSettingsData>({
    freeShippingLimit: 2000,
    heavyClassFreeLimit: 0,
    taxRate: 20,
    enableShippingCalc: true,
  });
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [editingClass, setEditingClass] = useState<ShippingClass | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [zonesRes, classesRes, methodsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/shipping/zones"),
        fetch("/api/admin/shipping/classes"),
        fetch("/api/admin/shipping/methods"),
        fetch("/api/admin/shipping/settings"),
      ]);

      if (zonesRes.ok) setZones(await zonesRes.json());
      if (classesRes.ok) setClasses(await classesRes.json());
      if (methodsRes.ok) setMethods(await methodsRes.json());
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings({
          freeShippingLimit: Number(data.freeShippingLimit) || 2000,
          heavyClassFreeLimit: Number(data.heavyClassFreeLimit) || 0,
          taxRate: Number(data.taxRate) || 20,
          enableShippingCalc: data.enableShippingCalc ?? true,
        });
      }
    } catch (error) {
      console.error("Error fetching shipping data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/shipping/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("Ayarlar kaydedildi!");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Hata oluştu!");
    } finally {
      setSaving(false);
    }
  };

  // Delete zone
  const handleDeleteZone = async (id: string) => {
    if (!confirm("Bu bölgeyi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/shipping/zones/${id}`, { method: "DELETE" });
      if (res.ok) {
        setZones(zones.filter(z => z.id !== id));
      }
    } catch (error) {
      console.error("Error deleting zone:", error);
    }
  };

  // Delete class
  const handleDeleteClass = async (id: string) => {
    if (!confirm("Bu sınıfı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/shipping/classes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setClasses(classes.filter(c => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Silinemedi");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════════
          KARGO BÖLGELERİ
      ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MapPin size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Kargo Bölgeleri</h3>
              <p className="text-sm text-gray-500">Kargo bölgelerini ve yöntemlerini yönetin</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingZone(null); setShowZoneModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Bölge Ekle
          </button>
        </div>

        {/* Zones Table */}
        <div className="rounded-xl border border-stroke dark:border-dark-3 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-2">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Bölge Adı</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Bölge(ler)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Kargo Yöntemleri</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-dark-3">
              {zones.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Henüz kargo bölgesi eklenmemiş
                  </td>
                </tr>
              ) : (
                zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-dark-2">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-gray-400 cursor-move" />
                        <span className="font-medium">{zone.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {zone.regions?.join(", ") || "Tüm Bölgeler"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {zone.methods?.map((zm) => (
                          <span
                            key={zm.id}
                            className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-dark-2"
                          >
                            {zm.method?.name}
                          </span>
                        ))}
                        {(!zone.methods || zone.methods.length === 0) && (
                          <span className="text-sm text-gray-400">Yöntem yok</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingZone(zone); setShowZoneModal(true); }}
                          className="p-2 text-gray-500 hover:text-primary transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteZone(zone.id)}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          KARGO SINIFLARI
      ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <Package size={20} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Kargo Sınıfları</h3>
              <p className="text-sm text-gray-500">Ürün grupları için özel kargo kuralları tanımlayın</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingClass(null); setShowClassModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Sınıf Ekle
          </button>
        </div>

        {/* Classes Table */}
        <div className="rounded-xl border border-stroke dark:border-dark-3 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-2">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sınıf Adı</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Açıklama</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Kargo Ücreti</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Ürün Sayısı</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Her Zaman Ücretsiz</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-dark-3">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Henüz kargo sınıfı eklenmemiş
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-dark-2">
                    <td className="px-4 py-3 font-medium">{cls.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cls.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cls.description || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      {cls.alwaysFree ? (
                        <span className="text-green-600 font-medium">Ücretsiz</span>
                      ) : (
                        <span className="font-medium">₺{Number(cls.cost || 0).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-dark-2">
                        {cls.productCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cls.alwaysFree ? (
                        <Check size={18} className="mx-auto text-green-500" />
                      ) : (
                        <X size={18} className="mx-auto text-gray-300" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingClass(cls); setShowClassModal(true); }}
                          className="p-2 text-gray-500 hover:text-primary transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          KARGO AYARLARI
      ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
            <Settings size={20} className="text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Kargo Ayarları</h3>
            <p className="text-sm text-gray-500">Genel kargo ayarlarını yapılandırın</p>
          </div>
        </div>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="mb-2 block text-sm font-medium">Ücretsiz Kargo Limiti (₺)</label>
            <input
              type="number"
              value={settings.freeShippingLimit}
              onChange={(e) => setSettings({ ...settings, freeShippingLimit: Number(e.target.value) })}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
            <p className="mt-1 text-xs text-gray-500">Bu tutarın üzerindeki siparişlerde kargo ücretsiz</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">KDV Oranı (%)</label>
            <input
              type="number"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableShippingCalc}
                onChange={(e) => setSettings({ ...settings, enableShippingCalc: e.target.checked })}
                className="h-5 w-5 rounded accent-primary"
              />
              <span className="text-sm font-medium">Kargo Hesaplamayı Aktif Et</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      {/* ZONE MODAL */}
      {showZoneModal && (
        <ZoneModal
          zone={editingZone}
          methods={methods}
          onClose={() => setShowZoneModal(false)}
          onSave={() => { fetchData(); setShowZoneModal(false); }}
        />
      )}

      {/* CLASS MODAL */}
      {showClassModal && (
        <ClassModal
          shippingClass={editingClass}
          onClose={() => setShowClassModal(false)}
          onSave={() => { fetchData(); setShowClassModal(false); }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ZONE MODAL
// ═══════════════════════════════════════════════════════════════

function ZoneModal({
  zone,
  methods,
  onClose,
  onSave,
}: {
  zone: ShippingZone | null;
  methods: ShippingMethod[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(zone?.name || "");
  const [regions, setRegions] = useState<string[]>(zone?.regions || []);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    zone?.methods?.map(m => m.methodId) || []
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Bölge adı zorunludur");
      return;
    }

    setSaving(true);
    try {
      const url = zone
        ? `/api/admin/shipping/zones/${zone.id}`
        : "/api/admin/shipping/zones";
      
      const res = await fetch(url, {
        method: zone ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          regions: regions.length > 0 ? regions : null,
          methods: selectedMethods.map((methodId, index) => ({
            methodId,
            order: index,
            isEnabled: true,
          })),
        }),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        alert(data.error || "Hata oluştu");
      }
    } catch (error) {
      console.error("Error saving zone:", error);
      alert("Hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = (methodId: string) => {
    setSelectedMethods(prev =>
      prev.includes(methodId)
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-dark rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-stroke dark:border-dark-3">
          <h3 className="text-lg font-semibold">
            {zone ? "Bölge Düzenle" : "Yeni Bölge Ekle"}
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Bölge Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="örn: Yurtiçi"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Bölgeler</label>
            <input
              type="text"
              value={regions.join(", ")}
              onChange={(e) => setRegions(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
              placeholder="örn: Türkiye, Kıbrıs"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
            <p className="mt-1 text-xs text-gray-500">Virgülle ayırarak birden fazla bölge ekleyebilirsiniz</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Kargo Yöntemleri</label>
            <div className="space-y-2">
              {methods.map((method) => (
                <label
                  key={method.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-stroke dark:border-dark-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes(method.id)}
                    onChange={() => toggleMethod(method.id)}
                    className="h-5 w-5 rounded accent-primary"
                  />
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-xs text-gray-500">
                      {method.type === "FREE_SHIPPING" && "Ücretsiz Gönderim"}
                      {method.type === "FLAT_RATE" && `Sabit Ücret: ₺${method.cost}`}
                      {method.type === "LOCAL_PICKUP" && "Mağazadan Teslim"}
                    </p>
                  </div>
                </label>
              ))}
              {methods.length === 0 && (
                <p className="text-sm text-gray-500 p-3">Henüz kargo yöntemi tanımlanmamış</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-stroke dark:border-dark-3 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-2"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CLASS MODAL
// ═══════════════════════════════════════════════════════════════

function ClassModal({
  shippingClass,
  onClose,
  onSave,
}: {
  shippingClass: ShippingClass | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(shippingClass?.name || "");
  const [description, setDescription] = useState(shippingClass?.description || "");
  const [cost, setCost] = useState(shippingClass?.cost?.toString() || "0");
  const [alwaysFree, setAlwaysFree] = useState(shippingClass?.alwaysFree || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Sınıf adı zorunludur");
      return;
    }

    setSaving(true);
    try {
      const url = shippingClass
        ? `/api/admin/shipping/classes/${shippingClass.id}`
        : "/api/admin/shipping/classes";
      
      const res = await fetch(url, {
        method: shippingClass ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, cost: parseFloat(cost) || 0, alwaysFree }),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        alert(data.error || "Hata oluştu");
      }
    } catch (error) {
      console.error("Error saving class:", error);
      alert("Hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-dark rounded-xl w-full max-w-md">
        <div className="p-6 border-b border-stroke dark:border-dark-3">
          <h3 className="text-lg font-semibold">
            {shippingClass ? "Sınıf Düzenle" : "Yeni Kargo Sınıfı"}
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Sınıf Adı *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="örn: Ağır Sınıf Kargo"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Açıklama</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="örn: Ağır ürünler için özel kargo"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Kargo Ücreti (₺)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              disabled={alwaysFree}
              placeholder="0.00"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 disabled:opacity-50 disabled:bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">Ücretsiz kargo limiti altındaki siparişlere uygulanır</p>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-stroke dark:border-dark-3 cursor-pointer">
            <input
              type="checkbox"
              checked={alwaysFree}
              onChange={(e) => setAlwaysFree(e.target.checked)}
              className="h-5 w-5 rounded accent-primary"
            />
            <div>
              <p className="font-medium">Her Zaman Ücretsiz Kargo</p>
              <p className="text-xs text-gray-500">Bu sınıftaki ürünler için kargo her zaman ücretsiz</p>
            </div>
          </label>
        </div>

        <div className="p-6 border-t border-stroke dark:border-dark-3 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-2"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
