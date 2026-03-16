"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import EditorWithPreview, { FormField, FormSection, FormDivider } from "@/components/templates/EditorWithPreview";
import { PreviewFrame } from "@/components/preview";
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
  // Overlay - Dark Theme
  overlayOpacity: number;
  overlayColor: string;
  // Overlay - Light Theme
  overlayOpacityLight: number | null;
  overlayColorLight: string;
  // Content Colors - Dark Theme
  titleColor: string;
  subtitleColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  button2BgColor: string;
  button2TextColor: string;
  // Content Colors - Light Theme
  titleColorLight: string;
  subtitleColorLight: string;
  badgeBgColorLight: string;
  badgeTextColorLight: string;
  buttonBgColorLight: string;
  buttonTextColorLight: string;
  button2BgColorLight: string;
  button2TextColorLight: string;
  // Title Highlight Gradient - Dark Theme
  titleHighlightFrom: string;
  titleHighlightTo: string;
  // Title Highlight Gradient - Light Theme
  titleHighlightFromLight: string;
  titleHighlightToLight: string;
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

// ============================================
// MAIN COMPONENT
// ============================================

export default function EditSliderPage() {
  const router = useRouter();
  const params = useParams();
  const sliderId = params.id as string;

  const [formData, setFormData] = useState<SliderFormData | null>(null);
  const [originalData, setOriginalData] = useState<SliderFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"desktop" | "mobile">("desktop");
  const [styleThemeTab, setStyleThemeTab] = useState<"dark" | "light">("dark");
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const res = await fetch(`/api/admin/sliders/${sliderId}`);
        if (!res.ok) {
          if (res.status === 404) router.push("/sliders");
          return;
        }

        const slider = await res.json();
        const data: SliderFormData = {
          name: slider.name || "",
          badge: slider.badge || "",
          badgeIcon: slider.badgeIcon ? { type: "preset", presetId: slider.badgeIcon } : { type: "none" },
          title: slider.title || "",
          titleHighlight: slider.titleHighlight || "",
          subtitle: slider.subtitle || "",
          buttonText: slider.buttonText || "",
          buttonLink: slider.buttonLink || "",
          button2Text: slider.button2Text || "",
          button2Link: slider.button2Link || "",
          desktopImage: slider.desktopImage || "",
          mobileImage: slider.mobileImage || "",
          // Overlay - Dark Theme
          overlayOpacity: slider.overlayOpacity ?? 50,
          overlayColor: slider.overlayColor || "#000000",
          // Overlay - Light Theme
          overlayOpacityLight: slider.overlayOpacityLight ?? null,
          overlayColorLight: slider.overlayColorLight || "",
          // Content Colors - Dark Theme
          titleColor: slider.titleColor || "",
          subtitleColor: slider.subtitleColor || "",
          badgeBgColor: slider.badgeBgColor || "",
          badgeTextColor: slider.badgeTextColor || "",
          buttonBgColor: slider.buttonBgColor || "",
          buttonTextColor: slider.buttonTextColor || "",
          button2BgColor: slider.button2BgColor || "",
          button2TextColor: slider.button2TextColor || "",
          // Content Colors - Light Theme
          titleColorLight: slider.titleColorLight || "",
          subtitleColorLight: slider.subtitleColorLight || "",
          badgeBgColorLight: slider.badgeBgColorLight || "",
          badgeTextColorLight: slider.badgeTextColorLight || "",
          buttonBgColorLight: slider.buttonBgColorLight || "",
          buttonTextColorLight: slider.buttonTextColorLight || "",
          button2BgColorLight: slider.button2BgColorLight || "",
          button2TextColorLight: slider.button2TextColorLight || "",
          // Title Highlight Gradient - Dark Theme
          titleHighlightFrom: slider.titleHighlightFrom || "",
          titleHighlightTo: slider.titleHighlightTo || "",
          // Title Highlight Gradient - Light Theme
          titleHighlightFromLight: slider.titleHighlightFromLight || "",
          titleHighlightToLight: slider.titleHighlightToLight || "",
          textAlign: slider.textAlign || "LEFT",
          theme: slider.theme || "DARK",
          effect: slider.effect || "FADE",
          autoplay: slider.autoplay ?? true,
          autoplayDelay: slider.autoplayDelay ?? 5000,
          loop: slider.loop ?? true,
          isActive: slider.isActive ?? true,
        };

        setFormData(data);
        setOriginalData(JSON.parse(JSON.stringify(data)));
      } catch (error) {
        console.error("Error fetching slider:", error);
        router.push("/sliders");
      } finally {
        setLoading(false);
      }
    };

    fetchSlider();
  }, [sliderId, router]);

  const isDirty = useMemo(() => {
    if (!formData || !originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  const updateField = <K extends keyof SliderFormData>(key: K, value: SliderFormData[K]) => {
    setFormData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const openMediaLibrary = (target: "desktop" | "mobile") => {
    setMediaTarget(target);
    setMediaLibraryOpen(true);
  };

  const handleMediaSelect = (media: any) => {
    if (mediaTarget === "desktop") updateField("desktopImage", media.url);
    else updateField("mobileImage", media.url);
    setMediaLibraryOpen(false);
  };

  const handleSave = async () => {
    if (!formData || !formData.name.trim() || !formData.title.trim()) {
      alert("Slider adı ve başlık gereklidir");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/sliders/${sliderId}`, {
        method: "PUT",
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
          // Overlay - Dark Theme
          overlayOpacity: formData.overlayOpacity,
          overlayColor: formData.overlayColor,
          // Overlay - Light Theme
          overlayOpacityLight: formData.overlayOpacityLight,
          overlayColorLight: formData.overlayColorLight || null,
          // Content Colors - Dark Theme
          titleColor: formData.titleColor || null,
          subtitleColor: formData.subtitleColor || null,
          badgeBgColor: formData.badgeBgColor || null,
          badgeTextColor: formData.badgeTextColor || null,
          buttonBgColor: formData.buttonBgColor || null,
          buttonTextColor: formData.buttonTextColor || null,
          button2BgColor: formData.button2BgColor || null,
          button2TextColor: formData.button2TextColor || null,
          // Content Colors - Light Theme
          titleColorLight: formData.titleColorLight || null,
          subtitleColorLight: formData.subtitleColorLight || null,
          badgeBgColorLight: formData.badgeBgColorLight || null,
          badgeTextColorLight: formData.badgeTextColorLight || null,
          buttonBgColorLight: formData.buttonBgColorLight || null,
          buttonTextColorLight: formData.buttonTextColorLight || null,
          button2BgColorLight: formData.button2BgColorLight || null,
          button2TextColorLight: formData.button2TextColorLight || null,
          // Title Highlight Gradient - Dark Theme
          titleHighlightFrom: formData.titleHighlightFrom || null,
          titleHighlightTo: formData.titleHighlightTo || null,
          // Title Highlight Gradient - Light Theme
          titleHighlightFromLight: formData.titleHighlightFromLight || null,
          titleHighlightToLight: formData.titleHighlightToLight || null,
          textAlign: formData.textAlign,
          theme: formData.theme,
          effect: formData.effect,
          autoplay: formData.autoplay,
          autoplayDelay: formData.autoplayDelay,
          loop: formData.loop,
          isActive: formData.isActive,
        }),
      });

      if (!res.ok) throw new Error("Failed to update slider");

      setOriginalData(JSON.parse(JSON.stringify(formData)));
      alert("Slider güncellendi!");
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "Kaydetme başarısız");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/sliders/${sliderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete slider");
      router.push("/sliders");
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(error.message || "Silme başarısız");
    } finally {
      setIsDeleting(false);
    }
  };

  const canSave = useMemo(() => {
    return formData ? formData.name.trim().length > 0 && formData.title.trim().length > 0 : false;
  }, [formData]);

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Tab renderers (same as new page)
  const renderContentTab = () => (
    <div className="space-y-6">
      <FormSection title="Genel Bilgiler">
        <FormField label="Slider Adı" required>
          <input type="text" value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Örn: Hero Slider 1" className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
        </FormField>
      </FormSection>
      <FormDivider />
      <FormSection title="İçerik">
        <FormField label="Rozet">
          <input type="text" value={formData.badge} onChange={(e) => updateField("badge", e.target.value)} placeholder="Örn: Yeni Ürün" className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
        </FormField>
        <FormField label="Başlık" required>
          <input type="text" value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Ana başlık" className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
        </FormField>
        <FormField label="Vurgulu Başlık">
          <input type="text" value={formData.titleHighlight} onChange={(e) => updateField("titleHighlight", e.target.value)} placeholder="Vurgulu metin" className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
        </FormField>
        <FormField label="Alt Başlık">
          <textarea value={formData.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} placeholder="Açıklama metni" rows={3} className="w-full px-4 py-3 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary resize-none" />
        </FormField>
      </FormSection>
      <FormDivider />
      <FormSection title="Butonlar">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Birincil Buton"><input type="text" value={formData.buttonText} onChange={(e) => updateField("buttonText", e.target.value)} className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" /></FormField>
          <FormField label="Link"><input type="text" value={formData.buttonLink} onChange={(e) => updateField("buttonLink", e.target.value)} className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="İkincil Buton"><input type="text" value={formData.button2Text} onChange={(e) => updateField("button2Text", e.target.value)} className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" /></FormField>
          <FormField label="Link"><input type="text" value={formData.button2Link} onChange={(e) => updateField("button2Link", e.target.value)} className="w-full h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" /></FormField>
        </div>
      </FormSection>
    </div>
  );

  const renderMediaTab = () => (
    <div className="space-y-6">
      <FormSection title="Görseller">
        <FormField label="Masaüstü Görsel">
          {formData.desktopImage ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-2 dark:bg-dark-2">
              <Image src={formData.desktopImage} alt="" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => openMediaLibrary("desktop")} className="px-3 py-1.5 bg-white text-dark rounded text-sm">Değiştir</button>
                <button onClick={() => updateField("desktopImage", "")} className="px-3 py-1.5 bg-red text-white rounded text-sm">Kaldır</button>
              </div>
            </div>
          ) : (
            <button onClick={() => openMediaLibrary("desktop")} className="w-full aspect-video border-2 border-dashed border-stroke dark:border-dark-3 rounded-lg flex items-center justify-center text-gray-5 hover:border-primary hover:text-primary">+ Görsel Seç</button>
          )}
        </FormField>
        <FormField label="Mobil Görsel">
          {formData.mobileImage ? (
            <div className="relative aspect-square max-w-[200px] rounded-lg overflow-hidden bg-gray-2 dark:bg-dark-2">
              <Image src={formData.mobileImage} alt="" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => openMediaLibrary("mobile")} className="px-3 py-1.5 bg-white text-dark rounded text-sm">Değiştir</button>
                <button onClick={() => updateField("mobileImage", "")} className="px-3 py-1.5 bg-red text-white rounded text-sm">Kaldır</button>
              </div>
            </div>
          ) : (
            <button onClick={() => openMediaLibrary("mobile")} className="w-[200px] aspect-square border-2 border-dashed border-stroke dark:border-dark-3 rounded-lg flex items-center justify-center text-gray-5 hover:border-primary hover:text-primary">+ Görsel Seç</button>
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
            <button key={align} onClick={() => updateField("textAlign", align)} className={`flex-1 py-2 rounded-lg text-sm transition-colors ${formData.textAlign === align ? "bg-primary text-white" : "bg-gray-2 dark:bg-dark-2 text-gray-6 hover:bg-gray-3"}`}>
              {align === "LEFT" ? "Sol" : align === "CENTER" ? "Orta" : "Sağ"}
            </button>
          ))}
        </div>
      </FormSection>
      <FormDivider />
      
      {/* Theme Tab Selector */}
      <FormSection title="Tema Ayarları">
        <div className="flex gap-2 p-1 bg-gray-2 dark:bg-dark-2 rounded-lg">
          <button 
            onClick={() => setStyleThemeTab("dark")} 
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${styleThemeTab === "dark" ? "bg-dark text-white shadow-sm" : "text-gray-6 hover:text-dark dark:hover:text-white"}`}
          >
            🌙 Dark Tema
          </button>
          <button 
            onClick={() => setStyleThemeTab("light")} 
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${styleThemeTab === "light" ? "bg-white text-dark shadow-sm" : "text-gray-6 hover:text-dark dark:hover:text-white"}`}
          >
            ☀️ Light Tema
          </button>
        </div>
        <p className="text-xs text-gray-5 mt-2">
          {styleThemeTab === "dark" 
            ? "Koyu tema varsayılandır. Boş bırakılan alanlar için sistem varsayılanları kullanılır." 
            : "Açık tema için özel renkler. Boş bırakılırsa dark tema değerleri kullanılır."}
        </p>
      </FormSection>
      <FormDivider />
      
      {/* Overlay Section */}
      <FormSection title={`Overlay (${styleThemeTab === "dark" ? "Dark" : "Light"})`}>
        {styleThemeTab === "dark" ? (
          <>
            <FormField label={`Opaklık: ${formData.overlayOpacity}%`}>
              <input type="range" min="0" max="100" value={formData.overlayOpacity} onChange={(e) => updateField("overlayOpacity", parseInt(e.target.value))} className="w-full h-2 bg-gray-3 dark:bg-dark-3 rounded-lg appearance-none cursor-pointer" />
            </FormField>
            <FormField label="Overlay Rengi">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.overlayColor} onChange={(e) => updateField("overlayColor", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.overlayColor} onChange={(e) => updateField("overlayColor", e.target.value)} className="flex-1 h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
          </>
        ) : (
          <>
            <FormField label={`Opaklık: ${formData.overlayOpacityLight ?? formData.overlayOpacity}%`}>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={formData.overlayOpacityLight ?? formData.overlayOpacity} 
                  onChange={(e) => updateField("overlayOpacityLight", parseInt(e.target.value))} 
                  className="flex-1 h-2 bg-gray-3 dark:bg-dark-3 rounded-lg appearance-none cursor-pointer" 
                />
                {formData.overlayOpacityLight !== null && (
                  <button onClick={() => updateField("overlayOpacityLight", null)} className="text-xs text-gray-5 hover:text-red">Sıfırla</button>
                )}
              </div>
            </FormField>
            <FormField label="Overlay Rengi">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.overlayColorLight || formData.overlayColor} onChange={(e) => updateField("overlayColorLight", e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.overlayColorLight} onChange={(e) => updateField("overlayColorLight", e.target.value)} placeholder={formData.overlayColor || "Dark tema değeri"} className="flex-1 h-10 px-4 rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
                {formData.overlayColorLight && (
                  <button onClick={() => updateField("overlayColorLight", "")} className="text-xs text-gray-5 hover:text-red">Sıfırla</button>
                )}
              </div>
            </FormField>
          </>
        )}
      </FormSection>
      <FormDivider />
      
      {/* Content Colors Section */}
      <FormSection title={`İçerik Renkleri (${styleThemeTab === "dark" ? "Dark" : "Light"})`}>
        {styleThemeTab === "dark" ? (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Başlık Rengi">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.titleColor || "#FFFFFF"} onChange={(e) => updateField("titleColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.titleColor} onChange={(e) => updateField("titleColor", e.target.value)} placeholder="#FFFFFF" className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Vurgulu Başlık Gradient">
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-1">
                  <input type="color" value={formData.titleHighlightFrom || "#10b981"} onChange={(e) => updateField("titleHighlightFrom", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" title="Başlangıç" />
                  <span className="text-xs text-gray-5">→</span>
                  <input type="color" value={formData.titleHighlightTo || "#06b6d4"} onChange={(e) => updateField("titleHighlightTo", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" title="Bitiş" />
                </div>
                <div className="flex-1 h-6 rounded" style={{ background: `linear-gradient(to right, ${formData.titleHighlightFrom || "#10b981"}, ${formData.titleHighlightTo || "#06b6d4"})` }} />
              </div>
            </FormField>
            <FormField label="Alt Başlık Rengi">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.subtitleColor || "#FFFFFF"} onChange={(e) => updateField("subtitleColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.subtitleColor} onChange={(e) => updateField("subtitleColor", e.target.value)} placeholder="#FFFFFF" className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Rozet Arka Plan">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.badgeBgColor || "#FFFFFF"} onChange={(e) => updateField("badgeBgColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.badgeBgColor} onChange={(e) => updateField("badgeBgColor", e.target.value)} placeholder="rgba(255,255,255,0.2)" className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Rozet Yazı">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.badgeTextColor || "#FFFFFF"} onChange={(e) => updateField("badgeTextColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.badgeTextColor} onChange={(e) => updateField("badgeTextColor", e.target.value)} placeholder="#FFFFFF" className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Buton 1 Arka Plan">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.buttonBgColor || "#FFFFFF"} onChange={(e) => updateField("buttonBgColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.buttonBgColor} onChange={(e) => updateField("buttonBgColor", e.target.value)} placeholder="#FFFFFF" className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Buton 1 Yazı">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.buttonTextColor || "#000000"} onChange={(e) => updateField("buttonTextColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.buttonTextColor} onChange={(e) => updateField("buttonTextColor", e.target.value)} placeholder="#000000" className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Buton 2 Arka Plan">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.button2BgColor || "#000000"} onChange={(e) => updateField("button2BgColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.button2BgColor} onChange={(e) => updateField("button2BgColor", e.target.value)} placeholder="transparent" className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Buton 2 Yazı">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.button2TextColor || "#FFFFFF"} onChange={(e) => updateField("button2TextColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.button2TextColor} onChange={(e) => updateField("button2TextColor", e.target.value)} placeholder="#FFFFFF" className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Başlık Rengi">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.titleColorLight || "#111827"} onChange={(e) => updateField("titleColorLight", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.titleColorLight} onChange={(e) => updateField("titleColorLight", e.target.value)} placeholder={formData.titleColor || "#111827"} className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Vurgulu Başlık Gradient">
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-1">
                  <input type="color" value={formData.titleHighlightFromLight || formData.titleHighlightFrom || "#10b981"} onChange={(e) => updateField("titleHighlightFromLight", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" title="Başlangıç" />
                  <span className="text-xs text-gray-5">→</span>
                  <input type="color" value={formData.titleHighlightToLight || formData.titleHighlightTo || "#06b6d4"} onChange={(e) => updateField("titleHighlightToLight", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" title="Bitiş" />
                </div>
                <div className="flex-1 h-6 rounded" style={{ background: `linear-gradient(to right, ${formData.titleHighlightFromLight || formData.titleHighlightFrom || "#10b981"}, ${formData.titleHighlightToLight || formData.titleHighlightTo || "#06b6d4"})` }} />
              </div>
            </FormField>
            <FormField label="Alt Başlık Rengi">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.subtitleColorLight || "#4B5563"} onChange={(e) => updateField("subtitleColorLight", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.subtitleColorLight} onChange={(e) => updateField("subtitleColorLight", e.target.value)} placeholder={formData.subtitleColor || "#4B5563"} className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Rozet Arka Plan">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.badgeBgColorLight || "#F3F4F6"} onChange={(e) => updateField("badgeBgColorLight", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.badgeBgColorLight} onChange={(e) => updateField("badgeBgColorLight", e.target.value)} placeholder={formData.badgeBgColor || "rgba(0,0,0,0.1)"} className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Rozet Yazı">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.badgeTextColorLight || "#111827"} onChange={(e) => updateField("badgeTextColorLight", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.badgeTextColorLight} onChange={(e) => updateField("badgeTextColorLight", e.target.value)} placeholder={formData.badgeTextColor || "#111827"} className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Buton 1 Arka Plan">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.buttonBgColorLight || "#111827"} onChange={(e) => updateField("buttonBgColorLight", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.buttonBgColorLight} onChange={(e) => updateField("buttonBgColorLight", e.target.value)} placeholder={formData.buttonBgColor || "#111827"} className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Buton 1 Yazı">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.buttonTextColorLight || "#FFFFFF"} onChange={(e) => updateField("buttonTextColorLight", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.buttonTextColorLight} onChange={(e) => updateField("buttonTextColorLight", e.target.value)} placeholder={formData.buttonTextColor || "#FFFFFF"} className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Buton 2 Arka Plan">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.button2BgColorLight || "#FFFFFF"} onChange={(e) => updateField("button2BgColorLight", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.button2BgColorLight} onChange={(e) => updateField("button2BgColorLight", e.target.value)} placeholder={formData.button2BgColor || "transparent"} className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
            <FormField label="Buton 2 Yazı">
              <div className="flex gap-2 items-center">
                <input type="color" value={formData.button2TextColorLight || "#111827"} onChange={(e) => updateField("button2TextColorLight", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-stroke dark:border-dark-3" />
                <input type="text" value={formData.button2TextColorLight} onChange={(e) => updateField("button2TextColorLight", e.target.value)} placeholder={formData.button2TextColor || "#111827"} className="flex-1 h-10 px-3 text-sm rounded-fm-sm border border-stroke dark:border-dark-3 bg-transparent outline-none focus:border-primary" />
              </div>
            </FormField>
          </div>
        )}
      </FormSection>
      <FormDivider />
      
      <FormSection title="Rozet İkonu">
        <IconPicker value={formData.badgeIcon} onChange={(v: IconValue) => updateField("badgeIcon", v)} label="" />
      </FormSection>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <FormSection title="Efekt">
        <div className="grid grid-cols-2 gap-2">
          {EFFECTS.map((effect) => (
            <button key={effect.value} onClick={() => effect.enabled && updateField("effect", effect.value)} disabled={!effect.enabled} className={`py-2 rounded-lg text-sm transition-colors ${formData.effect === effect.value ? "bg-primary text-white" : effect.enabled ? "bg-gray-2 dark:bg-dark-2 text-gray-6 hover:bg-gray-3" : "bg-gray-2 dark:bg-dark-2 text-gray-4 cursor-not-allowed"}`}>
              {effect.label}{!effect.enabled && <span className="ml-1 text-[10px]">Yakında</span>}
            </button>
          ))}
        </div>
      </FormSection>
      <FormDivider />
      <FormSection title="Otomatik Oynatma">
        <div className="flex items-center justify-between p-4 bg-gray-1 dark:bg-dark-2 rounded-lg">
          <div><p className="font-medium text-dark dark:text-white">Autoplay</p><p className="text-sm text-gray-5">Slider otomatik dönsün mü?</p></div>
          <button onClick={() => updateField("autoplay", !formData.autoplay)} className={`w-12 h-7 rounded-full relative transition-colors ${formData.autoplay ? "bg-fm-success" : "bg-gray-4"}`}>
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.autoplay ? "left-6" : "left-1"}`} />
          </button>
        </div>
        {formData.autoplay && (
          <FormField label={`Süre: ${formData.autoplayDelay / 1000}s`}>
            <input type="range" min="2000" max="10000" step="500" value={formData.autoplayDelay} onChange={(e) => updateField("autoplayDelay", parseInt(e.target.value))} className="w-full h-2 bg-gray-3 dark:bg-dark-3 rounded-lg appearance-none cursor-pointer" />
          </FormField>
        )}
        <div className="flex items-center justify-between p-4 bg-gray-1 dark:bg-dark-2 rounded-lg">
          <div><p className="font-medium text-dark dark:text-white">Loop</p><p className="text-sm text-gray-5">Sonsuz döngü</p></div>
          <button onClick={() => updateField("loop", !formData.loop)} className={`w-12 h-7 rounded-full relative transition-colors ${formData.loop ? "bg-fm-success" : "bg-gray-4"}`}>
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.loop ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </FormSection>
      <FormDivider />
      <FormSection title="Yayın Durumu">
        <div className="flex items-center justify-between p-4 bg-gray-1 dark:bg-dark-2 rounded-lg">
          <div><p className="font-medium text-dark dark:text-white">Aktif</p><p className="text-sm text-gray-5">Slider yayında mı?</p></div>
          <button onClick={() => updateField("isActive", !formData.isActive)} className={`w-12 h-7 rounded-full relative transition-colors ${formData.isActive ? "bg-fm-success" : "bg-gray-4"}`}>
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.isActive ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </FormSection>
    </div>
  );

  const renderPreview = (viewMode: "web" | "mobile" | "wide") => {
    const isMobile = viewMode === "mobile";
    
    // Theme-aware color helper - light tema değeri varsa onu kullan, yoksa dark tema değerini
    const getColor = (darkColor: string, lightColor: string, defaultDark: string, defaultLight?: string) => {
      if (previewTheme === "light") {
        // Light tema için: önce light değeri, sonra dark değeri, en son default light (veya default dark)
        return lightColor || darkColor || defaultLight || defaultDark;
      }
      // Dark tema için
      return darkColor || defaultDark;
    };
    
    // Overlay renk ve opaklık - tema bazlı
    const overlayColor = previewTheme === "light" && formData.overlayColorLight 
      ? formData.overlayColorLight 
      : formData.overlayColor;
    const overlayOpacity = previewTheme === "light" && formData.overlayOpacityLight !== null 
      ? formData.overlayOpacityLight 
      : formData.overlayOpacity;
    
    const r = parseInt(overlayColor.slice(1, 3), 16) || 0;
    const g = parseInt(overlayColor.slice(3, 5), 16) || 0;
    const b = parseInt(overlayColor.slice(5, 7), 16) || 0;
    const overlayStyle = { backgroundColor: `rgba(${r}, ${g}, ${b}, ${overlayOpacity / 100})` };
    const alignClass = formData.textAlign === "CENTER" ? "items-center text-center" : formData.textAlign === "RIGHT" ? "items-end text-right" : "items-start text-left";
    
    // İçerik renkleri - tema bazlı (dark default, light default)
    const badgeBgColor = getColor(formData.badgeBgColor, formData.badgeBgColorLight, "rgba(255,255,255,0.2)", "rgba(0,0,0,0.1)");
    const badgeTextColor = getColor(formData.badgeTextColor, formData.badgeTextColorLight, "#FFFFFF", "#111827");
    const titleColor = getColor(formData.titleColor, formData.titleColorLight, "#FFFFFF", "#111827");
    const subtitleColor = getColor(formData.subtitleColor, formData.subtitleColorLight, "rgba(255,255,255,0.7)", "rgba(75,85,99,1)");
    const buttonBgColor = getColor(formData.buttonBgColor, formData.buttonBgColorLight, "#FFFFFF", "#111827");
    const buttonTextColor = getColor(formData.buttonTextColor, formData.buttonTextColorLight, "#1a1a1a", "#FFFFFF");
    const button2BgColor = getColor(formData.button2BgColor, formData.button2BgColorLight, "transparent", "transparent");
    const button2TextColor = getColor(formData.button2TextColor, formData.button2TextColorLight, "#FFFFFF", "#111827");
    
    // Title Highlight Gradient
    const titleHighlightFrom = getColor(formData.titleHighlightFrom, formData.titleHighlightFromLight, "#10b981", "#10b981");
    const titleHighlightTo = getColor(formData.titleHighlightTo, formData.titleHighlightToLight, "#06b6d4", "#06b6d4");

    return (
      <PreviewFrame mode={viewMode}>
        <div className={`relative w-full h-full ${previewTheme === "light" ? "bg-gray-100" : "bg-gray-900"}`}>
          {formData.desktopImage && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${isMobile && formData.mobileImage ? formData.mobileImage : formData.desktopImage})` }} />}
          <div className="absolute inset-0" style={overlayStyle} />
          <div className={`relative h-full flex flex-col justify-center p-6 ${alignClass}`}>
            {formData.badge && (
              <div 
                className="fm-badge text-[10px] mb-3"
                style={{ backgroundColor: badgeBgColor, color: badgeTextColor }}
              >
                {formData.badgeIcon.type !== "none" && <span className="w-3 h-3">{renderIcon(formData.badgeIcon, "w-3 h-3")}</span>}
                {formData.badge}
              </div>
            )}
            <h2 className={`font-bold mb-2 ${isMobile ? "text-lg" : "text-xl"}`} style={{ color: titleColor }}>
              {formData.title || "Başlık"}
              {formData.titleHighlight && (
                <span 
                  style={{ 
                    backgroundImage: `linear-gradient(to right, ${titleHighlightFrom}, ${titleHighlightTo})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                > {formData.titleHighlight}</span>
              )}
            </h2>
            {formData.subtitle && (
              <p className={`mb-4 ${isMobile ? "text-xs" : "text-sm"}`} style={{ color: subtitleColor }}>
                {formData.subtitle}
              </p>
            )}
            <div className="flex gap-2">
              {formData.buttonText && (
                <span 
                  className={`rounded-full font-medium ${isMobile ? "text-[10px] px-3 py-1" : "text-xs px-4 py-1.5"}`}
                  style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                >
                  {formData.buttonText}
                </span>
              )}
              {formData.button2Text && (
                <span 
                  className={`rounded-full font-medium border ${isMobile ? "text-[10px] px-3 py-1" : "text-xs px-4 py-1.5"}`}
                  style={{ 
                    backgroundColor: button2BgColor, 
                    color: button2TextColor,
                    borderColor: button2TextColor + "80"
                  }}
                >
                  {formData.button2Text}
                </span>
              )}
            </div>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white/70 text-[8px] rounded">{formData.effect}</div>
          {/* Preview Theme Toggle */}
          <div className="absolute top-2 right-2 flex gap-1 bg-black/30 backdrop-blur-sm rounded-lg p-1">
            <button 
              onClick={() => setPreviewTheme("dark")}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${previewTheme === "dark" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"}`}
            >
              🌙
            </button>
            <button 
              onClick={() => setPreviewTheme("light")}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${previewTheme === "light" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"}`}
            >
              ☀️
            </button>
          </div>
        </div>
      </PreviewFrame>
    );
  };

  return (
    <>
      <EditorWithPreview
        title={formData.name || "Slider Düzenle"}
        subtitle="Slider ayarlarını düzenleyin"
        backUrl="/sliders"
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
        usage="SLIDER"
        title="Slider Görseli Seç"
      />
    </>
  );
}
