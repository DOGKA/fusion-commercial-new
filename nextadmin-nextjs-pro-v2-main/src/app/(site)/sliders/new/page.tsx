"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EditorWithPreview, { FormField, FormSection, FormDivider } from "@/components/templates/EditorWithPreview";
import { PreviewFrame } from "@/components/preview";
import GradientPicker, { GradientValue, createGradientFromPreset, getGradientCSS } from "@/components/style/GradientPicker";
import IconPicker, { IconValue, renderIcon } from "@/components/style/IconPicker";
import MediaLibrary from "@/components/MediaLibrary";

// ============================================
// TYPES
// ============================================

interface SliderFormData {
  name: string;
  badge: string;
  badgeIcon: IconValue;
  title: string;
  titleHighlight: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  button2Text: string;
  button2Link: string;
  desktopImage: string;
  mobileImage: string;
  overlayOpacity: number;
  overlayColor: string;
  textAlign: string;
  theme: string;
  effect: string;
  autoplay: boolean;
  autoplayDelay: number;
  loop: boolean;
  isActive: boolean;
}

const EFFECTS = [
  { value: "NONE", label: "Yok", enabled: true },
  { value: "FADE", label: "Fade", enabled: true },
  { value: "SLIDE", label: "Slide", enabled: true },
  { value: "PARALLAX", label: "Parallax", enabled: true },
  { value: "WEBGL", label: "WebGL", enabled: false },
  { value: "LOTTIE", label: "Lottie", enabled: false },
];

const initialFormData: SliderFormData = {
  name: "",
  badge: "",
  badgeIcon: { type: "preset", presetId: "bolt" },
  title: "",
  titleHighlight: "",
  subtitle: "",
  buttonText: "Keşfet",
  buttonLink: "/",
  button2Text: "",
  button2Link: "",
  desktopImage: "",
  mobileImage: "",
  overlayOpacity: 50,
  overlayColor: "#000000",
  textAlign: "LEFT",
  theme: "DARK",
  effect: "FADE",
  autoplay: true,
  autoplayDelay: 5000,
  loop: true,
  isActive: true,
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function NewSliderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SliderFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"desktop" | "mobile">("desktop");

  const updateField = <K extends keyof SliderFormData>(key: K, value: SliderFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const openMediaLibrary = (target: "desktop" | "mobile") => {
    setMediaTarget(target);
    setMediaLibraryOpen(true);
  };

  const handleMediaSelect = (media: any) => {
    if (mediaTarget === "desktop") {
      updateField("desktopImage", media.url);
    } else {
      updateField("mobileImage", media.url);
    }
    setMediaLibraryOpen(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.title.trim()) {
      alert("Slider adı ve başlık gereklidir");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/sliders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          badge: formData.badge || null,
          badgeIcon: formData.badgeIcon.type === "preset" ? formData.badgeIcon.presetId : null,
          title: formData.title,
          titleHighlight: formData.titleHighlight || null,
          subtitle: formData.subtitle || null,
          buttonText: formData.buttonText || null,
          buttonLink: formData.buttonLink || null,
          button2Text: formData.button2Text || null,
          button2Link: formData.button2Link || null,
          desktopImage: formData.desktopImage || null,
          mobileImage: formData.mobileImage || null,
          overlayOpacity: formData.overlayOpacity,
          overlayColor: formData.overlayColor,
          textAlign: formData.textAlign,
          theme: formData.theme,
          effect: formData.effect,
          autoplay: formData.autoplay,
          autoplayDelay: formData.autoplayDelay,
          loop: formData.loop,
          isActive: formData.isActive,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create slider");
      }

      const slider = await res.json();
      router.push(`/sliders/${slider.id}`);
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "Kaydetme başarısız");
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = useMemo(() => {
    return formData.name.trim().length > 0 && formData.title.trim().length > 0;
  }, [formData.name, formData.title]);

  // Tab renderers
  const renderContentTab = () => (
    <div className="space-y-6">
      <FormSection title="Genel Bilgiler">
        <FormField label="Slider Adı" required>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Örn: Hero Slider 1"
            className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
          />
        </FormField>
      </FormSection>

      <FormDivider />

      <FormSection title="İçerik">
        <FormField label="Rozet">
          <input
            type="text"
            value={formData.badge}
            onChange={(e) => updateField("badge", e.target.value)}
            placeholder="Örn: Yeni Ürün"
            className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
          />
        </FormField>

        <FormField label="Başlık" required>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Ana başlık"
            className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
          />
        </FormField>

        <FormField label="Vurgulu Başlık" hint="Gradient ile vurgulanan kısım">
          <input
            type="text"
            value={formData.titleHighlight}
            onChange={(e) => updateField("titleHighlight", e.target.value)}
            placeholder="Vurgulu metin"
            className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
          />
        </FormField>

        <FormField label="Alt Başlık">
          <textarea
            value={formData.subtitle}
            onChange={(e) => updateField("subtitle", e.target.value)}
            placeholder="Açıklama metni"
            rows={3}
            className="w-full px-4 py-3 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary resize-none"
          />
        </FormField>
      </FormSection>

      <FormDivider />

      <FormSection title="Butonlar">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Birincil Buton">
            <input
              type="text"
              value={formData.buttonText}
              onChange={(e) => updateField("buttonText", e.target.value)}
              placeholder="Buton metni"
              className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
            />
          </FormField>
          <FormField label="Link">
            <input
              type="text"
              value={formData.buttonLink}
              onChange={(e) => updateField("buttonLink", e.target.value)}
              placeholder="/sayfa"
              className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="İkincil Buton">
            <input
              type="text"
              value={formData.button2Text}
              onChange={(e) => updateField("button2Text", e.target.value)}
              placeholder="Buton metni"
              className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
            />
          </FormField>
          <FormField label="Link">
            <input
              type="text"
              value={formData.button2Link}
              onChange={(e) => updateField("button2Link", e.target.value)}
              placeholder="/sayfa"
              className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
            />
          </FormField>
        </div>
      </FormSection>
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-6">
      <FormSection title="Görseller">
        <FormField label="Masaüstü Görsel" hint="Önerilen: 1920x1080">
          {formData.desktopImage ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-2 dark:bg-dark-2">
              <Image src={formData.desktopImage} alt="" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => openMediaLibrary("desktop")} className="px-3 py-1.5 bg-white text-dark rounded text-sm">Değiştir</button>
                <button onClick={() => updateField("desktopImage", "")} className="px-3 py-1.5 bg-red text-white rounded text-sm">Kaldır</button>
              </div>
            </div>
          ) : (
            <button onClick={() => openMediaLibrary("desktop")} className="w-full aspect-video border-2 border-dashed border-stroke dark:border-dark-3 rounded-lg flex items-center justify-center text-gray-5 hover:border-primary hover:text-primary">
              + Görsel Seç
            </button>
          )}
        </FormField>

        <FormField label="Mobil Görsel" hint="Önerilen: 1200x1200">
          {formData.mobileImage ? (
            <div className="relative aspect-square max-w-[200px] rounded-lg overflow-hidden bg-gray-2 dark:bg-dark-2">
              <Image src={formData.mobileImage} alt="" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => openMediaLibrary("mobile")} className="px-3 py-1.5 bg-white text-dark rounded text-sm">Değiştir</button>
                <button onClick={() => updateField("mobileImage", "")} className="px-3 py-1.5 bg-red text-white rounded text-sm">Kaldır</button>
              </div>
            </div>
          ) : (
            <button onClick={() => openMediaLibrary("mobile")} className="w-[200px] aspect-square border-2 border-dashed border-stroke dark:border-dark-3 rounded-lg flex items-center justify-center text-gray-5 hover:border-primary hover:text-primary">
              + Görsel Seç
            </button>
          )}
        </FormField>
      </FormSection>
    </div>
  );

  const renderStyleTab = () => (
    <div className="space-y-6">
      <FormSection title="Metin Hizalama">
        <div className="flex gap-2">
          {["LEFT", "CENTER", "RIGHT"].map((align) => (
            <button
              key={align}
              onClick={() => updateField("textAlign", align)}
              className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                formData.textAlign === align
                  ? "bg-primary text-white"
                  : "bg-gray-2 dark:bg-dark-2 text-gray-6 hover:bg-gray-3"
              }`}
            >
              {align === "LEFT" ? "Sol" : align === "CENTER" ? "Orta" : "Sağ"}
            </button>
          ))}
        </div>
      </FormSection>

      <FormDivider />

      <FormSection title="Overlay">
        <FormField label={`Opaklık: ${formData.overlayOpacity}%`}>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.overlayOpacity}
            onChange={(e) => updateField("overlayOpacity", parseInt(e.target.value))}
            className="w-full h-2 bg-gray-3 dark:bg-dark-3 rounded-lg appearance-none cursor-pointer"
          />
        </FormField>

        <FormField label="Overlay Rengi">
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={formData.overlayColor}
              onChange={(e) => updateField("overlayColor", e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-stroke dark:border-dark-3"
            />
            <input
              type="text"
              value={formData.overlayColor}
              onChange={(e) => updateField("overlayColor", e.target.value)}
              className="flex-1 h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary"
            />
          </div>
        </FormField>
      </FormSection>

      <FormDivider />

      <FormSection title="Rozet İkonu">
        <IconPicker
          value={formData.badgeIcon}
          onChange={(v: IconValue) => updateField("badgeIcon", v)}
          label=""
        />
      </FormSection>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <FormSection title="Efekt">
        <div className="grid grid-cols-2 gap-2">
          {EFFECTS.map((effect) => (
            <button
              key={effect.value}
              onClick={() => effect.enabled && updateField("effect", effect.value)}
              disabled={!effect.enabled}
              className={`py-2 rounded-lg text-sm transition-colors ${
                formData.effect === effect.value
                  ? "bg-primary text-white"
                  : effect.enabled
                  ? "bg-gray-2 dark:bg-dark-2 text-gray-6 hover:bg-gray-3"
                  : "bg-gray-2 dark:bg-dark-2 text-gray-4 cursor-not-allowed"
              }`}
            >
              {effect.label}
              {!effect.enabled && <span className="ml-1 text-[10px]">Yakında</span>}
            </button>
          ))}
        </div>
      </FormSection>

      <FormDivider />

      <FormSection title="Otomatik Oynatma">
        <div className="flex items-center justify-between p-4 bg-gray-1 dark:bg-dark-2 rounded-lg">
          <div>
            <p className="font-medium text-dark dark:text-white">Autoplay</p>
            <p className="text-sm text-gray-5">Slider otomatik dönsün mü?</p>
          </div>
          <button
            onClick={() => updateField("autoplay", !formData.autoplay)}
            className={`w-12 h-7 rounded-full relative transition-colors ${formData.autoplay ? "bg-fm-success" : "bg-gray-4"}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.autoplay ? "left-6" : "left-1"}`} />
          </button>
        </div>

        {formData.autoplay && (
          <FormField label={`Süre: ${formData.autoplayDelay / 1000}s`}>
            <input
              type="range"
              min="2000"
              max="10000"
              step="500"
              value={formData.autoplayDelay}
              onChange={(e) => updateField("autoplayDelay", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-3 dark:bg-dark-3 rounded-lg appearance-none cursor-pointer"
            />
          </FormField>
        )}

        <div className="flex items-center justify-between p-4 bg-gray-1 dark:bg-dark-2 rounded-lg">
          <div>
            <p className="font-medium text-dark dark:text-white">Loop</p>
            <p className="text-sm text-gray-5">Sonsuz döngü</p>
          </div>
          <button
            onClick={() => updateField("loop", !formData.loop)}
            className={`w-12 h-7 rounded-full relative transition-colors ${formData.loop ? "bg-fm-success" : "bg-gray-4"}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.loop ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </FormSection>

      <FormDivider />

      <FormSection title="Yayın Durumu">
        <div className="flex items-center justify-between p-4 bg-gray-1 dark:bg-dark-2 rounded-lg">
          <div>
            <p className="font-medium text-dark dark:text-white">Aktif</p>
            <p className="text-sm text-gray-5">Slider yayında mı?</p>
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

  const renderPreview = (viewMode: "web" | "mobile" | "wide") => {
    const isMobile = viewMode === "mobile";
    const r = parseInt(formData.overlayColor.slice(1, 3), 16);
    const g = parseInt(formData.overlayColor.slice(3, 5), 16);
    const b = parseInt(formData.overlayColor.slice(5, 7), 16);
    const overlayStyle = { backgroundColor: `rgba(${r}, ${g}, ${b}, ${formData.overlayOpacity / 100})` };

    const alignClass = formData.textAlign === "CENTER" ? "items-center text-center" : formData.textAlign === "RIGHT" ? "items-end text-right" : "items-start text-left";

    return (
      <PreviewFrame mode={viewMode}>
        <div className="relative w-full h-full bg-gray-900">
          {formData.desktopImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${isMobile && formData.mobileImage ? formData.mobileImage : formData.desktopImage})` }}
            />
          )}
          <div className="absolute inset-0" style={overlayStyle} />
          <div className={`relative h-full flex flex-col justify-center p-6 ${alignClass}`}>
            {formData.badge && (
              <div className="fm-badge bg-white/20 text-white text-[10px] mb-3">
                {formData.badgeIcon.type !== "none" && <span className="w-3 h-3">{renderIcon(formData.badgeIcon, "w-3 h-3")}</span>}
                {formData.badge}
              </div>
            )}
            <h2 className={`text-white font-bold mb-2 ${isMobile ? "text-lg" : "text-xl"}`}>
              {formData.title || "Başlık"}
              {formData.titleHighlight && (
                <span className="bg-gradient-to-r from-fm-green to-fm-cyan bg-clip-text text-transparent"> {formData.titleHighlight}</span>
              )}
            </h2>
            {formData.subtitle && <p className={`text-white/70 mb-4 ${isMobile ? "text-xs" : "text-sm"}`}>{formData.subtitle}</p>}
            <div className="flex gap-2">
              {formData.buttonText && (
                <span className={`bg-white text-dark rounded-full font-medium ${isMobile ? "text-[10px] px-3 py-1" : "text-xs px-4 py-1.5"}`}>{formData.buttonText}</span>
              )}
              {formData.button2Text && (
                <span className={`border border-white/50 text-white rounded-full font-medium ${isMobile ? "text-[10px] px-3 py-1" : "text-xs px-4 py-1.5"}`}>{formData.button2Text}</span>
              )}
            </div>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white/70 text-[8px] rounded">{formData.effect}</div>
        </div>
      </PreviewFrame>
    );
  };

  return (
    <>
      <EditorWithPreview
        title="Yeni Slider"
        subtitle="Yeni bir slider oluşturun"
        backUrl="/sliders"
        isNew
        renderContentTab={renderContentTab}
        renderMediaTab={renderMediaTab}
        renderStyleTab={renderStyleTab}
        renderSettingsTab={renderSettingsTab}
        renderPreview={renderPreview}
        showWidePreview={false}
        onSave={handleSave}
        isSaving={isSaving}
        isDirty={isDirty}
        canSave={canSave}
        saveLabel="Slider Oluştur"
      />

      <MediaLibrary
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={handleMediaSelect}
        usage="SLIDER"
        title="Slider Görseli Seç"
      />
    </>
  );
}
