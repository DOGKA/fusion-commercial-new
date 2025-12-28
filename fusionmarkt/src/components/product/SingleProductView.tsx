"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Heart, Truck, MessageCircle, Star, CheckCircle, AlertCircle, User, Minus, Plus } from "lucide-react";
import KargoTimer from "@/components/product/KargoTimer";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { formatPrice } from "@/lib/utils";
import { useFavorites } from "@/context/FavoritesContext";
import { useMomentumScroll } from "@/hooks/useMomentumScroll";

// API Response types
interface ApiReview {
  id: string;
  user?: { name?: string; email?: string };
  userName?: string;
  userEmail?: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt?: string;
  isVerifiedPurchase?: boolean;
}

interface ApiKeyFeature {
  id: string;
  title?: string;
  label?: string;
  color?: string;
  iconSvg?: string;
  icon?: string;
}

interface ApiProductFeatureValue {
  id?: string;
  feature?: {
    name?: string;
    unit?: string;
  } | null;
  value?: string;
  valueText?: string;
  valueNumber?: number;
  unit?: string;
}

interface TechnicalSpec {
  id: string;
  name: string;
  value: string;
  label?: string;
}

interface RelatedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  thumbnail?: string;
  images?: string[];
  brand?: string;
  stock?: number;
  freeShipping?: boolean;
  shortDescription?: string;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images?: string[];
  thumbnail?: string;
  brand?: string;
  description?: string;
  shortDescription?: string;
  stock?: number;
  freeShipping?: boolean;
  variants?: ProductVariant[];
  keyFeatures?: ApiKeyFeature[];
  technicalSpecs?: TechnicalSpec[];
  productFeatureValues?: ApiProductFeatureValue[];
  reviews?: ApiReview[];
  frequentlyBought?: RelatedProduct[];
  alsoViewed?: RelatedProduct[];
  category?: { id: string; name: string; slug: string };
  videoUrl?: string;
  sku?: string;
}

// Yorum tipi
interface Review {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
}

// Backend'ten gelecek key features tipi
interface KeyFeature {
  id: string;
  label: string;
  color: string;
  iconSvg?: string; // Backend'ten SVG string olarak gelecek
}

// Mock key features - Backend'ten gelecek data örneği
// iconSvg: SVG string olarak eklenirse o gösterilecek
const mockKeyFeatures: KeyFeature[] = [
  { 
    id: "1", 
    label: "2000Wh Kapasite", 
    color: "#10B981",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="11" y2="13"/><line x1="10" x2="10" y1="11" y2="13"/></svg>`
  },
  { 
    id: "2", 
    label: "3600W Güç", 
    color: "#3B82F6",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>`
  },
  { 
    id: "3", 
    label: "LiFePO4 Batarya", 
    color: "#8B5CF6",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>`
  },
  { 
    id: "4", 
    label: "10 Yıl Ömür", 
    color: "#F59E0B",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`
  },
  { 
    id: "5", 
    label: "12 Port", 
    color: "#EC4899",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>`
  },
  { 
    id: "6", 
    label: "Solar Uyumlu", 
    color: "#06B6D4",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
  },
];

interface SingleProductViewProps {
  slug?: string;
}

// HTML içeriğini temizleme ve güvenlik sanitizer fonksiyonu
function cleanHtmlContent(html: string): string {
  if (!html) return '';
  
  const cleaned = html
    // ═══════════════════════════════════════════════════════════════════════════
    // SECURITY: XSS Prevention
    // ═══════════════════════════════════════════════════════════════════════════
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and their content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove event handlers (onclick, onerror, onload, etc.)
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (can be used for XSS)
    .replace(/data:/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    // Remove embed tags
    .replace(/<embed[^>]*>/gi, '')
    // Remove form tags
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    // Remove input/button tags
    .replace(/<(input|button|textarea|select)[^>]*>/gi, '')
    // ═══════════════════════════════════════════════════════════════════════════
    // Content Cleanup
    // ═══════════════════════════════════════════════════════════════════════════
    // Escaped newline karakterlerini kaldır
    .replace(/\\n/g, '')
    // Literal \n karakterlerini kaldır  
    .replace(/\n/g, '')
    // Quill editör UI span'larını kaldır
    .replace(/<span class="ql-ui"[^>]*>.*?<\/span>/gi, '')
    // Boş paragrafları temizle
    .replace(/<p>\s*<\/p>/gi, '')
    // Ardışık boşlukları tek boşluğa indir
    .replace(/\s{2,}/g, ' ')
    // height ve width attribute'larını kaldır (görsellerin responsive olması için)
    .replace(/\s(height|width)="[^"]*"/gi, '');
  
  return cleaned;
}

// Varyant tipi
interface ProductVariant {
  id: string;
  name: string;
  type: string;
  value: string;
  colorCode?: string | null;
  image?: string | null;
  price?: number | null;
  salePrice?: number | null;
  stock: number;
  sku?: string | null;
  isActive: boolean;
}

// Squircle border-radius
const SQUIRCLE = {
  sm: '10px',
  md: '14px',
};

export default function SingleProductView({ slug }: SingleProductViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [favoriteHover, setFavoriteHover] = useState(false);
  const [activeTab, setActiveTab] = useState("Açıklama");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  
  // Teknik Özellikler için expand state
  const [techSpecsExpanded, setTechSpecsExpanded] = useState(false);
  const INITIAL_SPECS_COUNT = 6; // Başlangıçta gösterilecek özellik sayısı
  // countdown artık KargoTimer component'inden geliyor
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(!!slug);
  
  // Varyant seçimi
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  // Varyant görseli (seçilen varyantın görseli, yoksa null)
  const [variantImage, setVariantImage] = useState<string | null>(null);
  // Adet seçimi
  const [quantity, setQuantity] = useState(1);
  
  // Favorites
  const { isFavorite, toggleItem } = useFavorites();

  // Açıklama yüksekliğini kontrol et - kısa içeriklerde buton gösterme
  useEffect(() => {
    if (descriptionRef.current) {
      const contentHeight = descriptionRef.current.scrollHeight;
      setShowExpandButton(contentHeight > 400);
    }
  }, [productData?.description, activeTab]);

  // Eğer slug varsa API'den ürün bilgilerini çek
  useEffect(() => {
    if (!slug) return;
    
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/public/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProductData(data);
          // API'den gelen yorumları component formatına map et
          if (data.reviews) {
            const mappedReviews = data.reviews.map((r: ApiReview) => ({
              id: r.id,
              userName: r.user?.name || "Anonim",
              userEmail: r.user?.email || "",
              rating: r.rating,
              title: r.title || "",
              comment: r.comment || "",
              createdAt: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : "",
              isVerifiedPurchase: r.isVerifiedPurchase || false,
            }));
            setReviews(mappedReviews);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Momentum scroll for key features strip
  const { containerRef: featuresRef, handlers: featuresHandlers } = useMomentumScroll({
    autoScroll: true,
    autoScrollSpeed: 0.5,
    pauseOnHover: true,
    friction: 0.94,
  });

  // Yorum state'leri
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [isVerifiedPurchaser] = useState(true); // Normalde backend'ten gelecek
  const [isLoggedIn] = useState(true); // Normalde backend'ten gelecek
  
  // Ortalama puan hesapla
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  // Yorum gönderme
  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewComment.trim()) {
      alert("Lütfen puan verin ve yorum yazın.");
      return;
    }
    
    setReviewSubmitting(true);
    
    // Simüle edilmiş API çağrısı
    setTimeout(() => {
      // Yorum başarılı gönderildi bildirimi (normalde onay bekleyecek)
      alert("Yorumunuz gönderildi! Onaylandıktan sonra görüntülenecektir.");
      
      // Form temizle
      setReviewRating(0);
      setReviewTitle("");
      setReviewComment("");
      setReviewSubmitting(false);
    }, 1000);
  };


  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#050505', paddingTop: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Yükleniyor...</div>
      </div>
    );
  }

  // Ürün bulunamadı
  if (!productData && slug) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#050505', paddingTop: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Ürün bulunamadı</div>
      </div>
    );
  }

  // Ürün verisi yoksa gösterme
  if (!productData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white/50">Ürün bulunamadı</p>
      </div>
    );
  }
  
  const product = productData;

  // Galeri görselleri - images string array
  const galleryImages = product.images || [];

  // Features - API'den gelecek (keyFeatures olarak geliyor)
  // Renk paleti - her feature için sırayla renk atanır
  const featureColors = [
    "#10B981", // emerald
    "#3B82F6", // blue
    "#8B5CF6", // purple
    "#F59E0B", // amber
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#EF4444", // red
    "#84CC16", // lime
  ];
  
  const features = product.keyFeatures && product.keyFeatures.length > 0 
    ? product.keyFeatures.map((f: ApiKeyFeature, idx: number) => ({
        id: f.id,
        label: f.title, // API'den title olarak geliyor
        color: featureColors[idx % featureColors.length],
        iconSvg: f.icon, // API'den icon olarak geliyor
      }))
    : mockKeyFeatures;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', paddingTop: '120px' }}>
      <div className="product-page-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* HERO - 3 Kolon */}
        <div 
          className="product-hero-grid"
          style={{ 
          display: 'grid', 
          gridTemplateColumns: '80px 600px 600px', 
          gap: '16px',
          marginBottom: '48px',
          alignItems: 'start',
          justifyContent: 'center',
          }}
        >
          
          {/* SOL - Thumbnails (Max 6 + Video) */}
          <div className="product-thumbnails-column" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignSelf: 'start' }}>
            {(() => {
              // Video varsa son slot video için ayrılacak
              const hasVideo = !!product.videoUrl;
              const maxImages = hasVideo ? 5 : 6;
              const visibleImages = galleryImages.slice(0, maxImages - 1); // Son slot +X için ayrıldı
              const hiddenStartIndex = maxImages - 1;
              const remainingCount = galleryImages.length - hiddenStartIndex;
              const hasHiddenImages = remainingCount > 1;
              
              return (
                <>
                  {/* İlk N-1 görsel (her zaman görünür) */}
                  {visibleImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedImage(idx);
                        setVariantImage(null);
                      }}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: '#0a0a0a',
                        border: selectedImage === idx && !variantImage ? '2px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Image src={img} alt={`Görsel ${idx + 1}`} fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                  
                  {/* Son slot: Gizli görseller için +X butonu (tıkladıkça değişir) */}
                  {galleryImages.length >= maxImages && (
                    <button
                      onClick={() => {
                        setVariantImage(null);
                        // Tıkladıkça gizli görseller arasında döngü yap
                        if (selectedImage >= hiddenStartIndex && selectedImage < galleryImages.length - 1) {
                          setSelectedImage(selectedImage + 1);
                        } else {
                          setSelectedImage(hiddenStartIndex);
                        }
                      }}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: '#0a0a0a',
                        border: selectedImage >= hiddenStartIndex ? '2px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Seçili gizli görselin thumbnail'ini göster */}
                      <Image 
                        src={galleryImages[selectedImage >= hiddenStartIndex ? selectedImage : hiddenStartIndex]} 
                        alt={`Görsel ${hiddenStartIndex + 1}`} 
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      {/* Overlay: kaç görsel daha var */}
                      {hasHiddenImages && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '2px',
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>
                            +{remainingCount}
                          </span>
                          <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>
                            {selectedImage >= hiddenStartIndex ? `${selectedImage - hiddenStartIndex + 1}/${remainingCount}` : 'tıkla'}
                          </span>
                        </div>
                      )}
                    </button>
                  )}
                  
                  {/* Video Thumbnail */}
                  {hasVideo && (
                    <button
                      onClick={() => {
                        setSelectedImage(-1); // -1 = video mode
                        setVariantImage(null);
                      }}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: '#0a0a0a',
                        border: selectedImage === -1 ? '2px solid rgba(6, 182, 212, 0.8)' : '1px solid rgba(6, 182, 212, 0.3)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Video Play Icon */}
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#06B6D4' }}>
                          <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                        </svg>
                      </div>
                    </button>
                  )}
                </>
              );
            })()}
          </div>

          {/* ORTA - Ana Gorsel / Video */}
          <div className="product-main-image-column" style={{ width: '600px', height: '600px' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              maxWidth: '600px',
              maxHeight: '600px',
              backgroundColor: '#0a0a0a',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {/* Video mode */}
              {selectedImage === -1 && product.videoUrl ? (
                <video 
                  src={product.videoUrl}
                  controls
                  autoPlay
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    backgroundColor: '#000',
                  }} 
                />
              ) : (variantImage || galleryImages[selectedImage]) ? (
                <Image 
                  src={variantImage || galleryImages[selectedImage]} 
                  alt={product.name} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <ImagePlaceholder type="product" text="ÜRÜN GÖRSELİ" iconSize="lg" />
              )}
              
              {/* Badges */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '85px',
                    height: '28px',
                    padding: '0 14px',
                    backgroundColor: 'white',
                    color: 'black',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    borderRadius: '10px',
                  }}>
                    %{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)} İNDİRİM
                  </span>
                )}
                {(product.stock ?? 0) <= 5 && (product.stock ?? 0) > 0 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '85px',
                    height: '28px',
                    padding: '0 14px',
                    backgroundColor: 'rgba(251, 146, 60, 0.9)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '600',
                    borderRadius: '10px',
                  }}>
                    Son {product.stock} Adet
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SAG - Info Panel */}
          <div className="product-info-column" style={{
            backgroundColor: 'rgba(19, 19, 19, 0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px',
            padding: '20px',
            width: '100%',
            maxWidth: '600px',
            height: 'auto',
            minHeight: '600px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Üst Kısım - Flex Grow */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Kategori Etiketi - Tıklanabilir Link */}
            {product.category && (
              <div style={{ marginBottom: '8px' }}>
                <a 
                  href={`/kategori/${product.category.slug || product.category.name?.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '8px',
                    fontSize: '9px',
                    fontWeight: '500',
                    color: '#10B981',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                  {product.category.name}
                </a>
              </div>
            )}

            {/* Brand */}
            {product.brand && (
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                {product.brand}
              </p>
            )}

            {/* Title */}
            <h1 style={{ fontSize: '22px', fontWeight: '600', color: 'white', lineHeight: '1.3', marginBottom: '10px' }}>
              {product.name}
            </h1>

            {/* Subtitle */}
            {product.shortDescription && (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '12px', lineHeight: '1.45' }}>
                {product.shortDescription}
              </p>
            )}

            {/* Kargo Timer */}
            <div style={{ marginBottom: '12px' }}>
              <KargoTimer 
                variant="siparis" 
                inStock={(product?.stock ?? 0) > 0 || (productData?.stock ?? 0) > 0}
              />
            </div>

            {/* KEY FEATURES - Auto-scroll with momentum drag support */}
            <div style={{ marginBottom: '12px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Özellikler
                </span>
                {/* Drag hint */}
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>
                  ← sürükle →
                </span>
              </div>
              
              <div 
                ref={featuresRef}
                {...featuresHandlers}
                className="touch-pan-x"
                style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  paddingBottom: '4px',
                  cursor: 'grab',
                  userSelect: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {/* Backend'ten gelen features - 2x duplicate for seamless loop */}
                {[...features, ...features].map((feature, idx) => (
                  <div
                    key={`${feature.id}-${idx}`}
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      cursor: 'default',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* SVG Icon - Backend'ten gelir */}
                    {feature.iconSvg && (
                      <div
                        style={{ 
                          color: feature.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        dangerouslySetInnerHTML={{ __html: feature.iconSvg }}
                      />
                    )}
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock & SKU */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '11px', 
              marginBottom: '10px' 
            }}>
              <span style={{ color: (selectedVariant ? selectedVariant.stock : (product.stock ?? 0)) > 0 ? 'rgba(255,255,255,0.45)' : '#EF4444' }}>
                {selectedVariant 
                  ? (selectedVariant.stock > 0 ? `Stok: ${selectedVariant.stock} adet` : 'Stokta Yok')
                  : ((product.stock ?? 0) > 0 ? `Stok: ${product.stock} adet` : 'Stokta Yok')
                }
              </span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px' }}>
                SKU: {selectedVariant 
                  ? (selectedVariant.sku || `${product.sku || ''}-${selectedVariant.value}`)
                  : (product.sku || '-')
                }
              </span>
            </div>

            {/* Varyasyonlar - Squircle seçim */}
            {product.variants && product.variants.length > 0 && (
              <div style={{ marginBottom: '0px' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'block' }}>
                  Seçenekler
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(product.variants as ProductVariant[]).map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isColor = variant.type === 'color' && variant.colorCode;
                    const isInStock = variant.stock > 0;
                    
                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          if (isSelected) {
                            // Seçimi kaldır
                            setSelectedVariant(null);
                            setVariantImage(null);
                          } else {
                            // Yeni varyant seç
                            setSelectedVariant(variant);
                            // Varyant görseli varsa ayarla
                            setVariantImage(variant.image || null);
                          }
                        }}
                        disabled={!isInStock}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px',
                          background: 'transparent',
                          border: 'none',
                          cursor: isInStock ? 'pointer' : 'not-allowed',
                          opacity: isInStock ? 1 : 0.4,
                        }}
                      >
                        {/* Squircle */}
                        <div
                          style={{
                            position: 'relative',
                            width: '38px',
                            height: '38px',
                            borderRadius: SQUIRCLE.md,
                            backgroundColor: isColor ? (variant.colorCode || 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.06)',
                            backgroundImage: !isColor && variant.image ? `url(${variant.image})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: isSelected 
                              ? '2px solid rgba(16, 185, 129, 0.8)' 
                              : isInStock 
                                ? '2px solid rgba(255,255,255,0.15)'
                                : '2px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Renk değilse ve görsel yoksa değeri göster */}
                          {!isColor && !variant.image && (
                            <span style={{ 
                              fontSize: '13px', 
                              fontWeight: '600', 
                              color: isInStock ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
                              textAlign: 'center',
                              lineHeight: 1.1,
                            }}>
                              {variant.value}
                            </span>
                          )}
                          {/* Stokta yok çizgisi */}
                          {!isInStock && (
                            <span style={{
                              position: 'absolute',
                              width: '140%',
                              height: '2px',
                              backgroundColor: 'rgba(255,255,255,0.5)',
                              transform: 'rotate(-45deg)',
                              top: '50%',
                              left: '-20%',
                            }} />
                          )}
                        </div>
                        
                        {/* Varyant adı */}
                        <span style={{ 
                          fontSize: '10px', 
                          color: isSelected ? '#10B981' : isInStock ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
                          fontWeight: isSelected ? '600' : '400',
                          textAlign: 'center',
                          maxWidth: '60px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {variant.value || variant.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                
              </div>
            )}

            </div>
            {/* Üst Kısım Sonu */}

            {/* Price Section - Alt Kısım */}
            <div className="product-price-section" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: 'auto' }}>
              {(() => {
                // Fiyat mantığı:
                // Product modeli: price = güncel fiyat, comparePrice = eski fiyat (indirim varsa)
                // Variant modeli: price = normal fiyat, salePrice = indirimli fiyat
                
                let displayPrice: number;
                let displayComparePrice: number | null = null;
                
                if (selectedVariant) {
                  // Varyant seçiliyse varyant fiyatını kullan
                  displayPrice = selectedVariant.salePrice ?? selectedVariant.price ?? product.price;
                  // Varyantın salePrice'ı varsa, price karşılaştırma fiyatı olur
                  if (selectedVariant.salePrice && selectedVariant.price && selectedVariant.price > selectedVariant.salePrice) {
                    displayComparePrice = selectedVariant.price;
                  }
                } else {
                  // Varyant seçili değilse ana ürün fiyatını kullan
                  // product.price = güncel fiyat, product.comparePrice = eski fiyat
                  displayPrice = product.price;
                  displayComparePrice = product.comparePrice ?? null;
                }
                
                const hasDiscount = displayComparePrice != null && displayComparePrice > displayPrice;
                
                return (
                  <>
                    {/* Mobil: Discount row ayrı kalacak */}
                    {hasDiscount && displayComparePrice != null && (
                      <div className="product-discount-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span className="product-original-price" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                          {formatPrice(displayComparePrice)} TL
                        </span>
                        <span className="product-savings" style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>
                          {formatPrice(displayComparePrice - displayPrice)} TL kazanç
                        </span>
                      </div>
                    )}

                    {/* Mobilde: Price + CTA aynı satırda olacak */}
                    <div className="product-price-cta-wrapper">
                      <div className="product-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                        <span className="product-main-price" style={{ fontSize: '30px', fontWeight: 'bold', color: 'white' }}>{formatPrice(displayPrice)}</span>
                        <span className="product-price-currency" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>TL</span>
                        <span className="product-kdv-text" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginLeft: '8px' }}>KDV Dahil</span>
                    </div>

                    {/* CTA Buttons */}
                      <div className="product-cta-row" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {/* Quantity Selector */}
                      <div className="product-quantity-selector" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: '4px',
                        height: '48px',
                      }}>
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            backgroundColor: quantity > 1 ? 'rgba(255,255,255,0.08)' : 'transparent',
                            border: 'none',
                            color: quantity > 1 ? 'white' : 'rgba(255,255,255,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: quantity > 1 ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Minus size={16} />
                        </button>
                        <span style={{
                          minWidth: '40px',
                          textAlign: 'center',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'white',
                        }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <div className="product-add-to-cart-wrapper" style={{ flex: 1 }}>
                        <AddToCartButton
                          product={{
                            productId: productData?.id || product.id || '',
                            slug: productData?.slug || slug || '',
                            title: productData?.name || product.name || '',
                            brand: productData?.brand || product.brand || 'FusionMarkt',
                            price: displayPrice,
                            originalPrice: displayComparePrice,
                            image: productData?.thumbnail || productData?.images?.[0] || product.images?.[0] || '',
                            quantity: quantity,
                            variant: selectedVariant ? {
                              id: selectedVariant.id,
                              name: selectedVariant.name || '',
                              type: selectedVariant.type || 'size',
                              value: selectedVariant.value || '',
                            } : undefined,
                          }}
                          variant="text"
                          size="lg"
                          className="product-add-to-cart-btn w-full h-12"
                          requiresVariant={product.variants && product.variants.length > 0}
                        />
                      </div>

                      {/* Favorite Button */}
                      {(() => {
                        const productId = productData?.id || product.id || '';
                        const isProductFavorite = isFavorite(String(productId), selectedVariant?.id);
                        
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              toggleItem({
                                productId: String(productId),
                                slug: productData?.slug || slug || '',
                                title: productData?.name || product.name || '',
                                brand: productData?.brand || product.brand || 'FusionMarkt',
                                price: displayPrice,
                                originalPrice: displayComparePrice,
                                image: productData?.thumbnail || productData?.images?.[0] || product.images?.[0] || '',
                                variant: selectedVariant ? {
                                  id: selectedVariant.id,
                                  name: selectedVariant.name || '',
                                  type: selectedVariant.type || 'size',
                                  value: selectedVariant.value || '',
                                } : undefined,
                              });
                            }}
                            onMouseEnter={() => setFavoriteHover(true)}
                            onMouseLeave={() => setFavoriteHover(false)}
                            title={isProductFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '16px',
                              backgroundColor: isProductFavorite 
                                ? 'rgba(236, 72, 153, 0.15)' 
                                : favoriteHover 
                                  ? 'rgba(255,255,255,0.15)' 
                                  : 'rgba(255,255,255,0.08)',
                              border: isProductFavorite 
                                ? '1px solid rgba(236, 72, 153, 0.5)' 
                                : '1px solid rgba(255,255,255,0.1)',
                              color: isProductFavorite 
                                ? '#ec4899' 
                                : favoriteHover 
                                  ? 'white' 
                                  : 'rgba(255,255,255,0.6)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              transform: isProductFavorite ? 'scale(1.05)' : 'scale(1)',
                              boxShadow: isProductFavorite ? '0 4px 15px rgba(236, 72, 153, 0.3)' : 'none',
                            }}
                          >
                            <Heart size={18} fill={isProductFavorite ? 'currentColor' : 'none'} />
                          </button>
                        );
                      })()}
                    </div>
                    </div>{/* product-price-cta-wrapper */}
                  </>
                );
              })()}


            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }}>
            {['Açıklama', 'Teknik Özellikler', 'Yorumlar'].map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(tab)}
                style={{
                  paddingBottom: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.45)',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid white' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{
            backgroundColor: 'rgba(19, 19, 19, 0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '24px',
            padding: '24px',
            minHeight: '200px',
          }}>
            {activeTab === 'Yorumlar' ? (
              <div>
                {/* Yorum Özeti */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>{averageRating}</div>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '8px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={18} fill={star <= Math.round(Number(averageRating)) ? '#FBBF24' : 'none'} stroke="#FBBF24" />
                      ))}
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>{reviews.length} değerlendirme</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews.filter(r => r.rating === rating).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', width: '20px' }}>{rating}</span>
                          <Star size={12} fill="#FBBF24" stroke="#FBBF24" />
                          <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#FBBF24', borderRadius: '4px' }} />
                          </div>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', width: '30px' }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Yorum Yazma Alanı */}
                <div style={{ marginBottom: '32px', padding: '24px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageCircle size={18} />
                    Yorum Yaz
                  </h3>
                  
                  {!isLoggedIn ? (
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                      <AlertCircle size={32} style={{ color: '#F59E0B', margin: '0 auto 12px' }} />
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>Yorum yapmak için giriş yapmalısınız.</p>
                      <button style={{ padding: '10px 24px', backgroundColor: '#10B981', color: 'white', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        Giriş Yap
                      </button>
                    </div>
                  ) : !isVerifiedPurchaser ? (
                    <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <AlertCircle size={32} style={{ color: '#F59E0B', margin: '0 auto 12px' }} />
                      <p style={{ fontSize: '14px', color: '#F59E0B', fontWeight: '600', marginBottom: '8px' }}>Satın Alma Gerekli</p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Bu ürüne yorum yapabilmek için önce satın almanız gerekmektedir.</p>
                    </div>
                  ) : (
                    <div>
                      {/* Satın Alma Doğrulandı Badge */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', marginBottom: '16px' }}>
                        <CheckCircle size={14} style={{ color: '#10B981' }} />
                        <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '500' }}>Satın alma doğrulandı - Yorum yapabilirsiniz</span>
                      </div>
                      
                      {/* Puan */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'block' }}>Puanınız *</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setReviewHoverRating(star)}
                              onMouseLeave={() => setReviewHoverRating(0)}
                              onClick={() => setReviewRating(star)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            >
                              <Star size={28} fill={(reviewHoverRating || reviewRating) >= star ? '#FBBF24' : 'none'} stroke="#FBBF24" />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Başlık */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'block' }}>Başlık (Opsiyonel)</label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Yorumunuz için kısa bir başlık..."
                          style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                      
                      {/* Yorum */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'block' }}>Yorumunuz *</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Bu ürün hakkındaki düşüncelerinizi paylaşın..."
                          rows={4}
                          style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                        />
                      </div>
                      
                      {/* Bilgi */}
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                        Yorumunuz, yönetici onayından sonra yayınlanacaktır.
                      </p>
                      
                      {/* Gönder */}
                      <button
                        onClick={handleSubmitReview}
                        disabled={reviewSubmitting || !reviewRating || !reviewComment.trim()}
                        style={{ padding: '12px 32px', backgroundColor: reviewSubmitting || !reviewRating || !reviewComment.trim() ? 'rgba(255,255,255,0.1)' : '#10B981', color: 'white', borderRadius: '12px', border: 'none', cursor: reviewSubmitting || !reviewRating || !reviewComment.trim() ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s ease' }}
                      >
                        {reviewSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Mevcut Yorumlar */}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Müşteri Yorumları ({reviews.length})</h3>
                  
                  {reviews.length === 0 ? (
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '32px' }}>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {reviews.map((review) => (
                        <div key={review.id} style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            {/* Avatar */}
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <User size={20} style={{ color: '#10B981' }} />
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              {/* Header */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{review.userName}</span>
                                    {review.isVerifiedPurchase && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: '4px' }}>
                                        <CheckCircle size={10} style={{ color: '#10B981' }} />
                                        <span style={{ fontSize: '9px', color: '#10B981', fontWeight: '500' }}>Doğrulanmış Alıcı</span>
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={12} fill={star <= review.rating ? '#FBBF24' : 'none'} stroke="#FBBF24" />
                                      ))}
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{review.createdAt}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Content */}
                              {review.title && (
                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>{review.title}</h4>
                              )}
                              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'Açıklama' ? (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                  Açıklama
                </h2>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                  {product.description ? (
                    <div style={{ position: 'relative' }}>
                      <div 
                        ref={descriptionRef}
                        style={{ 
                          maxHeight: (showExpandButton && !descriptionExpanded) ? '400px' : 'none', 
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <div 
                          className="product-description-content"
                          dangerouslySetInnerHTML={{ __html: cleanHtmlContent(product.description) }} 
                        />
                      </div>
                      {/* Gradient Overlay - sadece uzun içeriklerde ve kapalıyken göster */}
                      {showExpandButton && !descriptionExpanded && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '120px',
                          background: 'linear-gradient(to bottom, transparent, rgba(19, 19, 19, 1))',
                          pointerEvents: 'none',
                        }} />
                      )}
                      {/* Devamını Oku Butonu - sadece uzun içeriklerde göster */}
                      {showExpandButton && (
                        <div style={{ 
                          textAlign: 'center', 
                          marginTop: descriptionExpanded ? '24px' : '-40px',
                          position: 'relative',
                          zIndex: 1,
                        }}>
                          <button
                            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                            style={{
                              padding: '12px 32px',
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '12px',
                              color: 'white',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            {descriptionExpanded ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="m18 15-6-6-6 6"/>
                                </svg>
                                Daralt
                              </>
                            ) : (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="m6 9 6 6 6-6"/>
                                </svg>
                                Devamını Oku
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>Ürün açıklaması bulunmamaktadır.</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                  Teknik Özellikler
                </h2>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                  {/* Önce kategori bazlı teknik özellikleri göster */}
                  {/* Silinmiş özellikleri filtrele (feature null olanları gösterme) */}
                  {(() => {
                    const filteredSpecs = product.productFeatureValues?.filter((pfv: ApiProductFeatureValue) => pfv.feature !== null && pfv.feature !== undefined) || [];
                    const techSpecs = product.technicalSpecs || [];
                    const hasProductFeatureValues = filteredSpecs.length > 0;
                    const hasTechSpecs = techSpecs.length > 0;
                    const specsToShow = hasProductFeatureValues ? filteredSpecs : techSpecs;
                    const totalCount = specsToShow.length;
                    const showExpandBtn = totalCount > INITIAL_SPECS_COUNT;
                    const displaySpecs = techSpecsExpanded ? specsToShow : specsToShow.slice(0, INITIAL_SPECS_COUNT);

                    if (hasProductFeatureValues) {
                      return (
                        <div style={{ position: 'relative' }}>
                          <div style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}>
                            <table style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                            }}>
                              <tbody>
                                {displaySpecs.map((pfv: ApiProductFeatureValue, index: number) => (
                                  <tr 
                                    key={pfv.id || index}
                                    style={{
                                      backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                                    }}
                                  >
                                    <td style={{
                                      padding: '14px 16px',
                                      fontWeight: '500',
                                      color: 'rgba(255,255,255,0.7)',
                                      width: '40%',
                                      borderBottom: index < displaySpecs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                    }}>
                                      {pfv.feature?.name || 'Özellik'}
                                    </td>
                                    <td style={{
                                      padding: '14px 16px',
                                      fontWeight: '600',
                                      color: 'white',
                                      borderBottom: index < displaySpecs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                    }}>
                                      {pfv.valueText || (pfv.valueNumber !== null ? pfv.valueNumber : '')}
                                      {(pfv.unit || pfv.feature?.unit) && (
                                        <span style={{ 
                                          color: 'rgba(255,255,255,0.5)', 
                                          fontWeight: '400',
                                          marginLeft: '4px',
                                        }}>
                                          {pfv.unit || pfv.feature?.unit}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Devamını Göster Butonu */}
                          {showExpandBtn && (
                            <div style={{ 
                              textAlign: 'center', 
                              marginTop: '16px',
                            }}>
                              <button
                                onClick={() => setTechSpecsExpanded(!techSpecsExpanded)}
                                style={{
                                  padding: '12px 32px',
                                  backgroundColor: 'rgba(255,255,255,0.08)',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  borderRadius: '12px',
                                  color: 'white',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                                }}
                              >
                                {techSpecsExpanded ? 'Daha Az Göster' : `Tümünü Göster (${totalCount})`}
                                <svg 
                                  style={{ 
                                    width: '16px', 
                                    height: '16px',
                                    transform: techSpecsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                  }}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    } else if (hasTechSpecs) {
                      const techDisplaySpecs = displaySpecs as TechnicalSpec[];
                      return (
                        <div style={{ position: 'relative' }}>
                          <div style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}>
                            <table style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                            }}>
                              <tbody>
                                {techDisplaySpecs.map((spec: TechnicalSpec, index: number) => (
                                  <tr 
                                    key={spec.id}
                                    style={{
                                      backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                                    }}
                                  >
                                    <td style={{
                                      padding: '14px 16px',
                                      fontWeight: '500',
                                      color: 'rgba(255,255,255,0.7)',
                                      width: '40%',
                                      borderBottom: index < techDisplaySpecs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                    }}>
                                      {spec.name || spec.label}
                                    </td>
                                    <td style={{
                                      padding: '14px 16px',
                                      fontWeight: '600',
                                      color: 'white',
                                      borderBottom: index < techDisplaySpecs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                    }}>
                                      {spec.value}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Devamını Göster Butonu */}
                          {showExpandBtn && (
                            <div style={{ 
                              textAlign: 'center', 
                              marginTop: '16px',
                            }}>
                              <button
                                onClick={() => setTechSpecsExpanded(!techSpecsExpanded)}
                                style={{
                                  padding: '12px 32px',
                                  backgroundColor: 'rgba(255,255,255,0.08)',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                  borderRadius: '12px',
                                  color: 'white',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                                }}
                              >
                                {techSpecsExpanded ? 'Daha Az Göster' : `Tümünü Göster (${totalCount})`}
                                <svg 
                                  style={{ 
                                    width: '16px', 
                                    height: '16px',
                                    transform: techSpecsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                  }}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div style={{
                          textAlign: 'center',
                          padding: '32px',
                          color: 'rgba(255,255,255,0.4)',
                        }}>
                          <svg 
                            style={{ width: '48px', height: '48px', margin: '0 auto 12px', opacity: 0.3 }}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p>Teknik özellikler bulunmamaktadır.</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ONERILEN URUNLER SECTION - Birlikte Sıkça Alınan */}
        {product.frequentlyBought && product.frequentlyBought.length > 0 && (
          <div style={{ marginTop: '48px', marginBottom: '48px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>Birlikte Sıkça Alınan Ürünler</span>
              <span style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.4)', 
                fontWeight: '400',
                marginLeft: '8px',
              }}>
                Bu ürünle birlikte alınabilir
              </span>
            </h2>

            <div className="frequently-bought-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {product.frequentlyBought.map((relatedProduct: RelatedProduct) => {
                const savings = relatedProduct.comparePrice ? relatedProduct.comparePrice - relatedProduct.price : 0;
                const productImage = relatedProduct.thumbnail || relatedProduct.images?.[0];
                
                return (
                  <a 
                    key={relatedProduct.id} 
                    href={`/urun/${relatedProduct.slug}`}
                    className="frequently-bought-card"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr auto',
                      gap: '20px',
                      alignItems: 'center',
                      backgroundColor: 'rgba(19, 19, 19, 0.9)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '20px',
                      padding: '16px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: '120px',
                      height: '120px',
                      backgroundColor: '#0a0a0a',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {productImage ? (
                        <Image 
                          src={productImage} 
                          alt={relatedProduct.name}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      ) : (
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>GÖRSEL</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        {relatedProduct.brand || 'FUSIONMARKT'}
                      </p>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>
                        {relatedProduct.name}
                      </h3>
                      {relatedProduct.shortDescription && (
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                          {relatedProduct.shortDescription.substring(0, 50)}...
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {relatedProduct.freeShipping && (
                          <>
                            <span style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Truck size={10} />
                              Ücretsiz Kargo
                            </span>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>•</span>
                          </>
                        )}
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Stok: {relatedProduct.stock} adet</span>
                      </div>
                    </div>

                    <div className="related-product-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '180px' }}>
                      <div className="related-product-price-section" style={{ textAlign: 'right' }}>
                        {savings > 0 && (
                          <div className="related-product-discount" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                              {formatPrice(relatedProduct.comparePrice ?? 0)} TL
                            </span>
                            <span className="related-savings-badge" style={{ fontSize: '10px', color: '#10B981', fontWeight: '600' }}>
                              {formatPrice(savings)} TL kazanç
                            </span>
                          </div>
                        )}
                        <div className="related-product-current-price" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span 
                            className="related-main-price" 
                            style={{ 
                              fontSize: 'var(--related-price-size, 20px)', 
                              fontWeight: 'bold', 
                              color: 'white' 
                            }}
                          >
                            {formatPrice(relatedProduct.price)}
                          </span>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>TL</span>
                        </div>
                      </div>
                      <div className="related-product-buttons" style={{ display: 'flex', gap: '8px' }}>
                        <AddToCartButton
                          product={{
                            productId: relatedProduct.id,
                            slug: relatedProduct.slug,
                            title: relatedProduct.name,
                            brand: relatedProduct.brand || 'FusionMarkt',
                            price: relatedProduct.price,
                            originalPrice: relatedProduct.comparePrice,
                            image: productImage,
                          }}
                          variant="text"
                          size="sm"
                        />
                        {(() => {
                          const isRelatedFavorite = isFavorite(String(relatedProduct.id));
                          return (
                            <button 
                              onClick={(e) => { 
                                e.preventDefault();
                                e.stopPropagation();
                                toggleItem({
                                  productId: String(relatedProduct.id),
                                  slug: relatedProduct.slug,
                                  title: relatedProduct.name,
                                  brand: relatedProduct.brand || 'FusionMarkt',
                                  price: relatedProduct.price,
                                  originalPrice: relatedProduct.comparePrice,
                                  image: productImage,
                                });
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                backgroundColor: isRelatedFavorite ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.05)',
                                border: isRelatedFavorite ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '14px', // SQUIRCLE - matching AddToCartButton
                                color: isRelatedFavorite ? '#ec4899' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <Heart size={16} fill={isRelatedFavorite ? 'currentColor' : 'none'} />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* CROSS-SELL SECTION - Kullanicilar bu urunlere de baktilar */}
        {product.alsoViewed && product.alsoViewed.length > 0 && (
          <div style={{ marginTop: '48px', marginBottom: '64px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>Kullanıcılar Bu Ürünlere de Baktı</span>
              <span style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.4)', 
                fontWeight: '400',
                marginLeft: '8px',
              }}>
                İlginizi çekebilir
              </span>
            </h2>

            <div className="also-viewed-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {product.alsoViewed.map((relatedProduct: RelatedProduct) => {
                const savings = relatedProduct.comparePrice ? relatedProduct.comparePrice - relatedProduct.price : 0;
                const productImage = relatedProduct.thumbnail || relatedProduct.images?.[0];
                
                return (
                  <a 
                    key={relatedProduct.id} 
                    href={`/urun/${relatedProduct.slug}`}
                    className="also-viewed-card"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr auto',
                      gap: '20px',
                      alignItems: 'center',
                      backgroundColor: 'rgba(19, 19, 19, 0.9)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '20px',
                      padding: '16px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: '120px',
                      height: '120px',
                      backgroundColor: '#0a0a0a',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {productImage ? (
                        <Image 
                          src={productImage} 
                          alt={relatedProduct.name}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      ) : (
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>GÖRSEL</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        {relatedProduct.brand || 'FUSIONMARKT'}
                      </p>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>
                        {relatedProduct.name}
                      </h3>
                      {relatedProduct.shortDescription && (
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                          {relatedProduct.shortDescription.substring(0, 50)}...
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {relatedProduct.freeShipping && (
                          <>
                            <span style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Truck size={10} />
                              Ücretsiz Kargo
                            </span>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>•</span>
                          </>
                        )}
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Stok: {relatedProduct.stock} adet</span>
                      </div>
                    </div>

                    <div className="related-product-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '180px' }}>
                      <div className="related-product-price-section" style={{ textAlign: 'right' }}>
                        {savings > 0 && (
                          <div className="related-product-discount" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                              {formatPrice(relatedProduct.comparePrice ?? 0)} TL
                            </span>
                            <span className="related-savings-badge" style={{ fontSize: '10px', color: '#10B981', fontWeight: '600' }}>
                              {formatPrice(savings)} TL kazanç
                            </span>
                          </div>
                        )}
                        <div className="related-product-current-price" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span 
                            className="related-main-price" 
                            style={{ 
                              fontSize: 'var(--related-price-size, 20px)', 
                              fontWeight: 'bold', 
                              color: 'white' 
                            }}
                          >
                            {formatPrice(relatedProduct.price)}
                          </span>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>TL</span>
                        </div>
                      </div>
                      <div className="related-product-buttons" style={{ display: 'flex', gap: '8px' }}>
                        <AddToCartButton
                          product={{
                            productId: relatedProduct.id,
                            slug: relatedProduct.slug,
                            title: relatedProduct.name,
                            brand: relatedProduct.brand || 'FusionMarkt',
                            price: relatedProduct.price,
                            originalPrice: relatedProduct.comparePrice,
                            image: productImage,
                          }}
                          variant="text"
                          size="sm"
                        />
                        {(() => {
                          const isRelatedFavorite = isFavorite(String(relatedProduct.id));
                          return (
                            <button 
                              onClick={(e) => { 
                                e.preventDefault();
                                e.stopPropagation();
                                toggleItem({
                                  productId: String(relatedProduct.id),
                                  slug: relatedProduct.slug,
                                  title: relatedProduct.name,
                                  brand: relatedProduct.brand || 'FusionMarkt',
                                  price: relatedProduct.price,
                                  originalPrice: relatedProduct.comparePrice,
                                  image: productImage,
                                });
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                backgroundColor: isRelatedFavorite ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.05)',
                                border: isRelatedFavorite ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '14px', // SQUIRCLE - matching AddToCartButton
                                color: isRelatedFavorite ? '#ec4899' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <Heart size={16} fill={isRelatedFavorite ? 'currentColor' : 'none'} />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
