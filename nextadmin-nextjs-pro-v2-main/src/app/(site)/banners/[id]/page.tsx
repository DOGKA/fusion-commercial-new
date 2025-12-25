"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import EditorWithPreview, { FormField, FormSection, FormDivider } from "@/components/templates/EditorWithPreview";
import { PreviewFrame } from "@/components/preview";
import GradientPicker, { GradientValue, createGradientFromPreset, getGradientCSS } from "@/components/style/GradientPicker";
import IconPicker, { IconValue, renderIcon } from "@/components/style/IconPicker";
import MediaLibrary from "@/components/MediaLibrary";

// ============================================
// TYPES
// ============================================

interface BannerCard {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  buttonText: string;
  buttonLink: string;
  icon: IconValue;
  gradient: GradientValue;
  desktopColSpan: number;
  desktopRowSpan: number;
  mobileColSpan: number;
  mobileRowSpan: number;
  order: number;
}

interface BannerFormData {
  name: string;
  bannerType: string;
  placement: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  desktopImage: string;
  mobileImage: string;
  gradient: GradientValue;
  cards: BannerCard[];
  isActive: boolean;
}

// ============================================
// HELPERS
// ============================================

const createCardFromAPI = (apiCard: any, index: number): BannerCard => ({
  id: apiCard.id,
  title: apiCard.title || "",
  subtitle: apiCard.subtitle || "",
  badge: apiCard.badge || "",
  buttonText: apiCard.buttonText || "Keşfet",
  buttonLink: apiCard.buttonLink || "/",
  icon: apiCard.icon ? { type: "preset", presetId: apiCard.icon } : { type: "none" },
  gradient: {
    type: "custom",
    colors: [apiCard.gradientFrom || "#22C55E", apiCard.gradientTo || "#06B6D4"],
    angle: 135,
  },
  desktopColSpan: apiCard.desktopColSpan || 1,
  desktopRowSpan: apiCard.desktopRowSpan || 1,
  mobileColSpan: apiCard.mobileColSpan || 1,
  mobileRowSpan: apiCard.mobileRowSpan || 1,
  order: apiCard.order ?? index,
});

const createEmptyCard = (order: number): BannerCard => ({
  id: `new-${Date.now()}-${order}`,
  title: "",
  subtitle: "",
  badge: "",
  buttonText: "Keşfet",
  buttonLink: "/",
  icon: { type: "preset", presetId: "package" },
  gradient: createGradientFromPreset("green_cyan"),
  desktopColSpan: 1,
  desktopRowSpan: 1,
  mobileColSpan: 1,
  mobileRowSpan: 1,
  order,
});

// ============================================
// MAIN COMPONENT
// ============================================

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params.id as string;
  
  // Form state
  const [formData, setFormData] = useState<BannerFormData | null>(null);
  const [originalData, setOriginalData] = useState<BannerFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  // Media library state
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"desktop" | "mobile" | "card">("desktop");

  // Fetch banner data
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`/api/admin/banners/${bannerId}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push("/banners");
            return;
          }
          throw new Error("Failed to fetch banner");
        }

        const banner = await res.json();

        const formData: BannerFormData = {
          name: banner.name || "",
          bannerType: banner.bannerType || "GRID",
          placement: banner.placement || "HOME_CATEGORY",
          title: banner.title || "",
          subtitle: banner.subtitle || "",
          description: banner.description || "",
          buttonText: banner.buttonText || "",
          buttonLink: banner.buttonLink || "",
          desktopImage: banner.desktopImage || "",
          mobileImage: banner.mobileImage || "",
          gradient: {
            type: "custom",
            colors: [banner.gradientFrom || "#22C55E", banner.gradientTo || "#06B6D4"],
            angle: 135,
          },
          cards: (banner.cards || []).map(createCardFromAPI),
          isActive: banner.isActive ?? true,
        };

        // Ensure at least one card for GRID type
        if (formData.bannerType === "GRID" && formData.cards.length === 0) {
          formData.cards = [createEmptyCard(0)];
        }

        setFormData(formData);
        setOriginalData(JSON.parse(JSON.stringify(formData)));
      } catch (error) {
        console.error("Error fetching banner:", error);
        router.push("/banners");
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [bannerId, router]);

  // Check if dirty
  const isDirty = useMemo(() => {
    if (!formData || !originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  // Update form field
  const updateField = <K extends keyof BannerFormData>(key: K, value: BannerFormData[K]) => {
    setFormData((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  // Update card field
  const updateCard = (index: number, updates: Partial<BannerCard>) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cards: prev.cards.map((card, i) => (i === index ? { ...card, ...updates } : card)),
      };
    });
  };

  // Add card
  const addCard = () => {
    if (!formData || formData.cards.length >= 6) return;
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cards: [...prev.cards, createEmptyCard(prev.cards.length)],
      };
    });
    setActiveCardIndex(formData.cards.length);
  };

  // Remove card
  const removeCard = (index: number) => {
    if (!formData || formData.cards.length <= 1) return;
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cards: prev.cards.filter((_, i) => i !== index).map((c, i) => ({ ...c, order: i })),
      };
    });
    if (activeCardIndex >= formData.cards.length - 1) {
      setActiveCardIndex(Math.max(0, formData.cards.length - 2));
    }
  };

  // Open media library
  const openMediaLibrary = (target: "desktop" | "mobile" | "card") => {
    setMediaTarget(target);
    setMediaLibraryOpen(true);
  };

  // Handle media select
  const handleMediaSelect = (media: any) => {
    if (mediaTarget === "desktop") {
      updateField("desktopImage", media.url);
    } else if (mediaTarget === "mobile") {
      updateField("mobileImage", media.url);
    }
    setMediaLibraryOpen(false);
  };

  // Save banner
  const handleSave = async () => {
    if (!formData || !formData.name.trim()) {
      alert("Banner adı gereklidir");
      return;
    }

    setIsSaving(true);
    try {
      const cards = formData.cards.map((card) => ({
        title: card.title || "Başlıksız",
        subtitle: card.subtitle || null,
        badge: card.badge || null,
        buttonText: card.buttonText || "Keşfet",
        buttonLink: card.buttonLink || "/",
        icon: card.icon.type === "preset" ? card.icon.presetId : card.icon.customUrl,
        gradientFrom: card.gradient.colors[0],
        gradientTo: card.gradient.colors[1],
        desktopColSpan: card.desktopColSpan,
        desktopRowSpan: card.desktopRowSpan,
        mobileColSpan: card.mobileColSpan,
        mobileRowSpan: card.mobileRowSpan,
        order: card.order,
        isActive: true,
      }));

      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          bannerType: formData.bannerType,
          placement: formData.placement,
          title: formData.title || null,
          subtitle: formData.subtitle || null,
          description: formData.description || null,
          buttonText: formData.buttonText || null,
          buttonLink: formData.buttonLink || null,
          desktopImage: formData.desktopImage || null,
          mobileImage: formData.mobileImage || null,
          gradientFrom: formData.gradient.colors[0],
          gradientTo: formData.gradient.colors[1],
          isActive: formData.isActive,
          cards,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update banner");
      }

      setOriginalData(JSON.parse(JSON.stringify(formData)));
      alert("Banner güncellendi!");
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "Kaydetme başarısız");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete banner
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete banner");
      }

      router.push("/banners");
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(error.message || "Silme başarısız");
    } finally {
      setIsDeleting(false);
    }
  };

  // Validation
  const canSave = useMemo(() => {
    return formData ? formData.name.trim().length > 0 : false;
  }, [formData]);

  // Loading state
  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Active card
  const activeCard = formData.cards[activeCardIndex];

  // Render content tab
  const renderContentTab = () => (
    <div className="space-y-6">
      <FormSection title="Genel Bilgiler">
        <FormField label="Banner Adı" required>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Örn: Ana Sayfa Kategori Grid"
            className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
          />
        </FormField>

        <FormField label="Yerleşim">
            <select
              value={formData.placement}
              onChange={(e) => updateField("placement", e.target.value)}
              className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
            >
              <optgroup label="Ana Sayfa">
                <option value="HOME_HERO">Ana Sayfa Hero</option>
                <option value="HOME_CATEGORY">Ana Sayfa Kategori Grid</option>
                <option value="HOME_PROMO">Ana Sayfa Promosyon</option>
                <option value="HOME_BOTTOM">Ana Sayfa Alt</option>
              </optgroup>
              <optgroup label="Mağaza">
                <option value="SHOP_HEADER">Mağaza Üst Banner</option>
                <option value="SHOP_CATEGORY_TASINABILIR_GUC_KAYNAKLARI">Mağaza - Taşınabilir Güç Kaynakları</option>
                <option value="SHOP_CATEGORY_GUNES_PANELLERI">Mağaza - Güneş Panelleri</option>
                <option value="SHOP_CATEGORY_ENDUSTRIYEL_ELDIVENLER">Mağaza - Endüstriyel Eldivenler</option>
                <option value="SHOP_CATEGORY_TELESKOPIK_MERDIVENLER">Mağaza - Teleskopik Merdivenler</option>
              </optgroup>
              <optgroup label="Diğer">
                <option value="CATEGORY_TOP">Kategori Sayfası Üst</option>
                <option value="CATEGORY_BOTTOM">Kategori Sayfası Alt</option>
                <option value="PRODUCT_RELATED">Ürün Sayfası İlgili</option>
                <option value="CHECKOUT">Ödeme Sayfası</option>
                <option value="CUSTOM">Özel Konum</option>
              </optgroup>
            </select>
          </FormField>
      </FormSection>

      {/* HOME_CATEGORY: Multi-card grid */}
      {formData.placement === "HOME_CATEGORY" && (
        <>
          <FormDivider />
          <FormSection title="Kartlar" description="Grid banner için kartları düzenleyin">
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.cards.map((card, index) => (
                <button
                  key={card.id}
                  onClick={() => setActiveCardIndex(index)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    activeCardIndex === index
                      ? "bg-primary text-white"
                      : "bg-gray-2 dark:bg-dark-2 text-gray-6 hover:bg-gray-3"
                  }`}
                >
                  Kart {index + 1}
                </button>
              ))}
              {formData.cards.length < 6 && (
                <button
                  onClick={addCard}
                  className="px-3 py-1.5 text-sm border border-dashed border-stroke dark:border-dark-3 rounded-lg text-gray-5 hover:border-primary hover:text-primary"
                >
                  + Kart Ekle
                </button>
              )}
            </div>

            {activeCard && (
              <div className="p-4 bg-gray-1 dark:bg-dark-2 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Kart {activeCardIndex + 1}</span>
                  {formData.cards.length > 1 && (
                    <button
                      onClick={() => removeCard(activeCardIndex)}
                      className="text-xs text-red hover:underline"
                    >
                      Kartı Sil
                    </button>
                  )}
                </div>

                <FormField label="Başlık" required>
                  <input
                    type="text"
                    value={activeCard.title}
                    onChange={(e) => updateCard(activeCardIndex, { title: e.target.value })}
                    placeholder="Kart başlığı"
                    className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-white dark:bg-dark-3 outline-none focus:border-primary"
                  />
                </FormField>

                <FormField label="Alt Başlık">
                  <input
                    type="text"
                    value={activeCard.subtitle}
                    onChange={(e) => updateCard(activeCardIndex, { subtitle: e.target.value })}
                    placeholder="Kart alt başlığı"
                    className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-white dark:bg-dark-3 outline-none focus:border-primary"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Rozet">
                    <input
                      type="text"
                      value={activeCard.badge}
                      onChange={(e) => updateCard(activeCardIndex, { badge: e.target.value })}
                      placeholder="Örn: 24 Ürün"
                      className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-white dark:bg-dark-3 outline-none focus:border-primary"
                    />
                  </FormField>

                  <FormField label="Buton Metni">
                    <input
                      type="text"
                      value={activeCard.buttonText}
                      onChange={(e) => updateCard(activeCardIndex, { buttonText: e.target.value })}
                      placeholder="Keşfet"
                      className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-white dark:bg-dark-3 outline-none focus:border-primary"
                    />
                  </FormField>
                </div>

                <FormField label="Buton Linki" required>
                  <input
                    type="text"
                    value={activeCard.buttonLink}
                    onChange={(e) => updateCard(activeCardIndex, { buttonLink: e.target.value })}
                    placeholder="/kategori/..."
                    className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-white dark:bg-dark-3 outline-none focus:border-primary"
                  />
                </FormField>

                <FormDivider />
                <FormSection title="Web Layout">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Genişlik (Web)">
                      <select
                        value={activeCard.desktopColSpan}
                        onChange={(e) => updateCard(activeCardIndex, { desktopColSpan: parseInt(e.target.value) })}
                        className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-white dark:bg-dark-3 outline-none focus:border-primary"
                      >
                        <option value={1}>1 Kolon</option>
                        <option value={2}>2 Kolon</option>
                        <option value={3}>3 Kolon</option>
                      </select>
                    </FormField>

                    <FormField label="Yükseklik (Web)">
                      <select
                        value={activeCard.desktopRowSpan}
                        onChange={(e) => updateCard(activeCardIndex, { desktopRowSpan: parseInt(e.target.value) })}
                        className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-white dark:bg-dark-3 outline-none focus:border-primary"
                      >
                        <option value={1}>1 Satır</option>
                        <option value={2}>2 Satır</option>
                        <option value={3}>3 Satır</option>
                      </select>
                    </FormField>
                  </div>
                </FormSection>

                <FormSection title="Mobil Layout">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Genişlik (Mobil)">
                      <select
                        value={activeCard.mobileColSpan}
                        onChange={(e) => updateCard(activeCardIndex, { mobileColSpan: parseInt(e.target.value) })}
                        className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-white dark:bg-dark-3 outline-none focus:border-primary"
                      >
                        <option value={1}>1 Kolon</option>
                      </select>
                    </FormField>

                    <FormField label="Yükseklik (Mobil)">
                      <select
                        value={activeCard.mobileRowSpan}
                        onChange={(e) => updateCard(activeCardIndex, { mobileRowSpan: parseInt(e.target.value) })}
                        className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-white dark:bg-dark-3 outline-none focus:border-primary"
                      >
                        <option value={1}>1 Satır</option>
                        <option value={2}>2 Satır</option>
                      </select>
                    </FormField>
                  </div>
                </FormSection>
              </div>
            )}
          </FormSection>
        </>
      )}

      {/* SHOP_HEADER & SHOP_CATEGORY: Single banner - no cards */}
      {(formData.placement === "SHOP_HEADER" || formData.placement.startsWith("SHOP_CATEGORY_")) && (
        <>
          <FormDivider />
          <FormSection title="Banner İçeriği" description="Mağaza kategori banner'ını düzenleyin">
            <FormField label="Başlık" required>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Banner başlığı"
                className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
              />
            </FormField>

            <FormField label="Alt Başlık">
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => updateField("subtitle", e.target.value)}
                placeholder="Banner alt başlığı"
                className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
              />
            </FormField>

            <FormField label="Buton Metni">
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => updateField("buttonText", e.target.value)}
                placeholder="Tümünü Gör"
                className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
              />
            </FormField>

            <FormField label="Buton Linki">
              <input
                type="text"
                value={formData.buttonLink}
                onChange={(e) => updateField("buttonLink", e.target.value)}
                placeholder="/kategori/..."
                className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
              />
            </FormField>
          </FormSection>
        </>
      )}
    </div>
  );

  // Render media tab
  const renderMediaTab = () => (
    <div className="space-y-6">
      <FormSection title="Görseller">
        <FormField label="Masaüstü Görsel" hint="Önerilen: 1920x1080">
          {formData.desktopImage ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-2 dark:bg-dark-2">
              <img src={formData.desktopImage} alt="" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => openMediaLibrary("desktop")} className="px-3 py-1.5 bg-white text-dark rounded text-sm">Değiştir</button>
                <button onClick={() => updateField("desktopImage", "")} className="px-3 py-1.5 bg-red text-white rounded text-sm">Kaldır</button>
              </div>
            </div>
          ) : (
            <button onClick={() => openMediaLibrary("desktop")} className="w-full aspect-video border-2 border-dashed border-stroke dark:border-dark-3 rounded-lg flex items-center justify-center text-gray-5 hover:border-primary hover:text-primary transition-colors">
              + Görsel Seç
            </button>
          )}
        </FormField>
      </FormSection>
    </div>
  );

  // Render style tab
  const renderStyleTab = () => (
    <div className="space-y-6">
      {formData.placement === "HOME_CATEGORY" && activeCard ? (
        <FormSection title={`Kart ${activeCardIndex + 1} Stili`}>
          <GradientPicker
            value={activeCard.gradient}
            onChange={(v: GradientValue) => updateCard(activeCardIndex, { gradient: v })}
            label="Kart Gradient"
          />
          <IconPicker
            value={activeCard.icon}
            onChange={(v: IconValue) => updateCard(activeCardIndex, { icon: v })}
            label="Kart İkonu"
          />
        </FormSection>
      ) : (
        <FormSection title="Banner Stili" description="Arka plan gradyanını ayarlayın">
          <GradientPicker
            value={formData.gradient}
            onChange={(v: GradientValue) => updateField("gradient", v)}
            label="Banner Gradient"
          />
        </FormSection>
      )}
    </div>
  );

  // Render settings tab
  const renderSettingsTab = () => (
    <div className="space-y-6">
      <FormSection title="Yayın Durumu">
        <div className="flex items-center justify-between p-4 bg-gray-1 dark:bg-dark-2 rounded-lg">
          <div>
            <p className="font-medium text-dark dark:text-white">Aktif</p>
            <p className="text-sm text-gray-5">Banner yayında mı?</p>
          </div>
          <button
            onClick={() => updateField("isActive", !formData.isActive)}
            className={`w-12 h-7 rounded-full relative transition-colors ${formData.isActive ? "bg-fm-success" : "bg-gray-4"}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.isActive ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </FormSection>
    </div>
  );

  // Render preview
  const renderPreview = (viewMode: "web" | "mobile" | "wide") => {
    const bg = getGradientCSS(formData.gradient);
    const isMobile = viewMode === "mobile";

    // HOME_CATEGORY: Grid preview with multiple cards - Frontend ile birebir aynı
    if (formData.placement === "HOME_CATEGORY") {
      // Web preview için satır yüksekliği - frontend oranında
      const rowHeight = isMobile ? 140 : 120;
      const gapSize = 10;
      
      return (
        <PreviewFrame mode={viewMode}>
          <div className="w-full h-full p-3 relative overflow-auto" style={{ background: "#0A0A0A" }}>
            {/* Mesh gradient overlay - Frontend ile aynı */}
            <div className="absolute inset-0 opacity-50" style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(6,182,212,0.03) 100%)",
            }} />
            
            {/* Bento Grid - Frontend ile birebir aynı: 4 kolon web, 1 kolon mobil */}
            <div 
              className="relative z-10 grid"
              style={{
                gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
                gridAutoRows: `${rowHeight}px`,
                gap: `${gapSize}px`,
              }}
            >
              {formData.cards.map((card, index) => {
                const isLarge = !isMobile && card.desktopColSpan >= 2 && card.desktopRowSpan >= 2;
                const isWide = !isMobile && card.desktopColSpan >= 2 && card.desktopRowSpan === 1;
                const isTall = !isMobile && card.desktopColSpan === 1 && card.desktopRowSpan >= 2;
                
                // Grid span style - Dinamik kolon/satır span desteği
                const gridStyle: React.CSSProperties = {};
                if (!isMobile) {
                  if (card.desktopColSpan > 1) gridStyle.gridColumn = `span ${card.desktopColSpan}`;
                  if (card.desktopRowSpan > 1) gridStyle.gridRow = `span ${card.desktopRowSpan}`;
                }
                
                return (
                  <div
                    key={card.id}
                    onClick={() => setActiveCardIndex(index)}
                    className={`group relative overflow-hidden cursor-pointer flex flex-col h-full transition-all ${
                      activeCardIndex === index ? "ring-2 ring-[#E31E24] ring-offset-1 ring-offset-[#0A0A0A]" : ""
                    }`}
                    style={{ 
                      ...gridStyle,
                      background: `linear-gradient(135deg, ${card.gradient.colors[0]} 0%, ${card.gradient.colors[1]} 100%)`,
                      backdropFilter: "blur(30px)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "20px",
                    }}
                  >
                    {/* Dark overlay for contrast - Frontend ile aynı */}
                    <div className="absolute inset-0 bg-black/25" />
                    
                    {/* Badge - Top Left - Frontend ile birebir aynı stiller */}
                    {card.badge && (
                      <div className={`absolute ${isMobile ? "top-3 left-3" : "top-2.5 left-2.5"}`}>
                        <span 
                          className={`inline-flex items-center font-medium ${isMobile ? "px-2.5 py-1 text-[10px]" : "px-2 py-0.5 text-[8px]"}`}
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            borderRadius: "9999px",
                            color: "rgba(250, 250, 250, 0.75)",
                          }}
                        >
                          {card.badge}
                        </span>
                      </div>
                    )}
                    
                    {/* Icon - Top Right - Frontend ile birebir aynı */}
                    {card.icon.type !== "none" && (
                      <div className={`absolute ${isMobile ? "top-3 right-3" : "top-2.5 right-2.5"}`}>
                        <div 
                          className={`flex items-center justify-center ${isMobile ? "w-8 h-8 rounded-xl" : "w-6 h-6 rounded-lg"}`}
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                          }}
                        >
                          {renderIcon(card.icon, `${isMobile ? "w-4 h-4" : "w-3 h-3"} text-[#E31E24]`)}
                        </div>
                      </div>
                    )}
                    
                    {/* Content - Bottom - Frontend ile birebir aynı */}
                    <div className={`relative z-10 mt-auto ${isMobile ? "p-4" : isLarge ? "p-4" : "p-3"}`}>
                      <h3 
                        className={`font-semibold mb-1 line-clamp-2 ${
                          isMobile ? "text-base" : isLarge ? "text-sm" : "text-xs"
                        }`}
                        style={{ color: "#FAFAFA" }}
                      >
                        {card.title || "Başlık"}
                      </h3>
                      {card.subtitle && (
                        <p 
                          className={`mb-2 line-clamp-2 ${isMobile ? "text-sm" : isLarge ? "text-xs" : "text-[10px]"}`}
                          style={{ color: "rgba(250, 250, 250, 0.75)" }}
                        >
                          {card.subtitle}
                        </p>
                      )}
                      
                      {/* CTA - Frontend ile birebir aynı: #E31E24 rengi */}
                      <div 
                        className={`flex items-center gap-1 font-medium ${isMobile ? "text-sm" : "text-xs"}`} 
                        style={{ color: "#E31E24" }}
                      >
                        <span>{card.buttonText || "Keşfet"}</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PreviewFrame>
      );
    }

    // SHOP_CATEGORY: Glassmorphism card banner preview (frontend ile uyumlu)
    if (formData.placement.startsWith("SHOP_CATEGORY_")) {
      const bannerColors = {
        from: formData.gradient.colors[0] || "#10b981",
        to: formData.gradient.colors[1] || "#059669"
      };
      const cardWidth = isMobile ? "220px" : "240px";
      const cardHeight = isMobile ? "420px" : "480px";

      return (
        <PreviewFrame mode={viewMode}>
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#060606" }}>
            <div 
              className="relative rounded-2xl overflow-hidden border border-white/10"
              style={{
                width: cardWidth,
                minHeight: cardHeight,
                maxHeight: cardHeight,
                background: `linear-gradient(145deg, ${bannerColors.from}18 0%, ${bannerColors.to}08 100%)`,
              }}
            >
              {/* Gradient orb - frontend ile aynı */}
              <div 
                className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-40"
                style={{ background: `radial-gradient(circle, ${bannerColors.from} 0%, transparent 70%)` }}
              />
              
              {/* Content - height sabit, içerik dikeyde dağılımlı */}
              <div 
                className="relative flex flex-col p-6"
                style={{ height: cardHeight }}
              >
                {/* Badge - üstte */}
                <div 
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[11px] font-semibold w-fit"
                  style={{ 
                    background: `${bannerColors.from}30`,
                    color: bannerColors.from,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: bannerColors.from }} />
                  <span>Ürünler</span>
                </div>

                {/* Title alanı - ortada, flex-1 ile boşluğu kaplar */}
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-xl font-bold text-white leading-snug mb-2">
                    {formData.title || formData.name || "Banner Başlığı"}
                  </h4>
                  <p className="text-xs text-white/50">
                    {formData.subtitle || "Kaliteli ürünleri keşfedin"}
                  </p>
                </div>

                {/* CTA Button - altta */}
                <div 
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/20 backdrop-blur-sm"
                  style={{ 
                    background: `${bannerColors.from}20`,
                  }}
                >
                  <span className="text-xs font-semibold text-white">{formData.buttonText || "Tümünü Gör"}</span>
                  <span className="text-white text-sm">›</span>
                </div>
              </div>
            </div>
          </div>
        </PreviewFrame>
      );
    }

    // SHOP_HEADER / Single banner preview (slim hero) - Frontend ile birebir aynı
    const gradientFrom = formData.gradient.colors[0];
    const gradientTo = formData.gradient.colors[1];
    
    return (
      <PreviewFrame mode={viewMode}>
        <div className="w-full h-full flex items-center justify-center p-4">
          <div
            className="relative w-full rounded-2xl overflow-hidden border border-white/10"
            style={{
              height: isMobile ? 100 : 140,
              background: `linear-gradient(90deg, ${gradientTo} 0%, ${gradientFrom} 50%, ${gradientTo} 100%)`,
            }}
          >
            {/* Background Image */}
            {(formData.desktopImage || formData.mobileImage) && (
              <img
                src={isMobile && formData.mobileImage ? formData.mobileImage : formData.desktopImage || formData.mobileImage || ""}
                alt={formData.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Content Overlay - Frontend ile aynı layout */}
            <div className="absolute inset-0 flex items-end p-4">
              <div className="flex-1">
                {formData.title && (
                  <h3 className="text-white text-sm font-semibold mb-0.5">
                    {formData.title}
                  </h3>
                )}
                {formData.subtitle && (
                  <p className="text-white/80 text-[10px] line-clamp-1">
                    {formData.subtitle}
                  </p>
                )}
              </div>
              {formData.buttonText && (
                <span className="inline-flex items-center px-3 py-1.5 text-[10px] font-medium bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl">
                  {formData.buttonText}
                  <svg className="w-2.5 h-2.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </div>

            {/* Placeholder */}
            {!formData.desktopImage && !formData.mobileImage && !formData.title && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-white/50">{formData.placement} banner ekleyin</span>
              </div>
            )}
          </div>
        </div>
      </PreviewFrame>
    );
  };

  return (
    <>
      <EditorWithPreview
        title={formData.name || "Banner Düzenle"}
        subtitle="Banner ayarlarını düzenleyin"
        backUrl="/banners"
        renderContentTab={renderContentTab}
        renderMediaTab={renderMediaTab}
        renderStyleTab={renderStyleTab}
        renderSettingsTab={renderSettingsTab}
        renderPreview={renderPreview}
        showWidePreview={false}
        onSave={handleSave}
        onDelete={handleDelete}
        isSaving={isSaving}
        isDeleting={isDeleting}
        isDirty={isDirty}
        canSave={canSave}
        saveLabel="Güncelle"
      />

      <MediaLibrary
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={handleMediaSelect}
        usage="BANNER"
        title="Banner Görseli Seç"
      />
    </>
  );
}
