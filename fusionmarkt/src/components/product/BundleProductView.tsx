"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Star, CheckCircle, User, Minus, Plus, ExternalLink } from "lucide-react";
import KargoTimer from "@/components/product/KargoTimer";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import AddToCartButton from "@/components/cart/AddToCartButton";
import RelatedProductCard from "@/components/product/RelatedProductCard";
import { formatPrice } from "@/lib/utils";
import { useFavorites } from "@/context/FavoritesContext";
import { useTransformCarousel } from "@/hooks/useTransformCarousel";

// API Response types
interface ApiReview {
  id: string;
  user?: { name?: string; email?: string };
  userName?: string;
  userEmail?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  adminReply?: string | null;
  adminReplyAt?: string | null;
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

interface RelatedProductVariant {
  id: string;
  name: string;
  type: string;
  value: string;
  colorCode?: string | null;
  image?: string | null;
  stock: number;
  isActive: boolean;
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
  variants?: RelatedProductVariant[];
}

interface RelatedBundle {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  price: number;
  totalValue?: number;
  itemCount?: number;
  shortDescription?: string;
  stock?: number;
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
  images: string[]; // Yorum görselleri
  adminReply: string | null; // Satıcı yanıtı
  adminReplyAt: string | null; // Yanıt tarihi
  createdAt: string;
  isVerifiedPurchase: boolean;
}

interface BundleProductViewProps {
  slug?: string;
}

interface BundleItem {
  id: string;
  quantity: number;
  variantId?: string | null;
  variant?: {
    id: string;
    name: string;
    value: string;
  } | null;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    price: number;
    comparePrice?: number | null;
    stock: number;
    brand?: string;
    shortDescription?: string;
  } | null;
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

export default function BundleProductView({ slug }: BundleProductViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [favoriteHover, setFavoriteHover] = useState(false);
  const [activeTab, setActiveTab] = useState("Açıklama");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  
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

  // Bundle state'leri
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  const [relatedBundles, setRelatedBundles] = useState<RelatedBundle[]>([]);

  // Eğer slug varsa API'den bundle bilgilerini çek
  useEffect(() => {
    if (!slug) return;
    
    const fetchBundle = async () => {
      try {
        const res = await fetch(`/api/public/bundles/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProductData(data);
          setBundleItems(data.items || []);
          
          // API'den gelen yorumları component formatına map et
          if (data.reviews) {
            const mappedReviews = data.reviews.map((r: ApiReview) => ({
              id: r.id,
              userName: r.user?.name || "Anonim",
              userEmail: r.user?.email || "",
              rating: r.rating,
              title: r.title || "",
              comment: r.comment || "",
              images: r.images || [],
              adminReply: r.adminReply || null,
              adminReplyAt: r.adminReplyAt || null,
              createdAt: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : "",
              isVerifiedPurchase: r.isVerifiedPurchase || false,
            }));
            setReviews(mappedReviews);
          }
          
          // Aynı kategorideki veya tüm paketleri çek
          try {
            // Önce kategoriye göre dene
            const bundlesUrl = data.category?.id 
              ? `/api/public/bundles?categoryId=${data.category.id}&limit=8`
              : `/api/public/bundles?limit=8`;
            
            const bundlesRes = await fetch(bundlesUrl);
            if (bundlesRes.ok) {
              const bundlesData = await bundlesRes.json();
              // Kendisini hariç tut
              let otherBundles: RelatedBundle[] = (bundlesData.bundles || []).filter((b: RelatedBundle) => b.id !== data.id);
              
              // Eğer kategoriden yeterli bundle yoksa, tüm bundle'lardan getir
              if (otherBundles.length < 2 && data.category?.id) {
                const allBundlesRes = await fetch(`/api/public/bundles?limit=8`);
                if (allBundlesRes.ok) {
                  const allBundlesData = await allBundlesRes.json();
                  otherBundles = (allBundlesData.bundles || []).filter((b: RelatedBundle) => b.id !== data.id);
                }
              }
              
              // Eğer hiç başka bundle yoksa, aynı bundle'ı göster
              if (otherBundles.length === 0) {
                otherBundles = [{
                  id: data.id,
                  name: data.name,
                  slug: data.slug,
                  thumbnail: data.thumbnail || undefined,
                  price: data.price,
                  totalValue: data.totalValue || data.comparePrice || data.price,
                  itemCount: data.items?.length || data.itemCount || 0,
                  shortDescription: data.shortDescription || undefined,
                  stock: data.stock || 0,
                }];
              }
              
              setRelatedBundles(otherBundles.slice(0, 4));
            }
          } catch (err) {
            console.error("Error fetching related bundles:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching bundle:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundle();
  }, [slug]);

  // CSS Transform carousel for key features strip - ultra-smooth GPU scrolling
  // Not: Bu carousel şu an kullanılmıyor ama ileride key features için lazım olabilir
  useTransformCarousel({
    autoScroll: true,
    autoScrollSpeed: 40, // px/sn - yavaş & akıcı
    pauseOnHover: true,
    friction: 0.95,
  });
  
  // Yorum state'leri
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]); // Yüklenen görseller
  const [reviewImagePreviews, setReviewImagePreviews] = useState<string[]>([]); // Görsel önizlemeleri
  const [reviewImageUploading, setReviewImageUploading] = useState(false); // Görsel yükleniyor mu
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false); // Yorum gönderildi mi
  const [reviewIsUpdate, setReviewIsUpdate] = useState(false); // Güncelleme mi
  const [reviewFormOpen, setReviewFormOpen] = useState(false); // Form açık mı
  const [guestName, setGuestName] = useState(""); // Misafir kullanıcı adı
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Kullanıcı giriş yapmış mı
  const [userName, setUserName] = useState(""); // Giriş yapmış kullanıcının adı
  const [nameDisplayPreference, setNameDisplayPreference] = useState<"masked" | "full">("masked"); // İsim gösterim tercihi
  const reviewImageInputRef = useRef<HTMLInputElement>(null);
  
  // İsim maskeleme fonksiyonu: "DOĞUKAN ARIK" -> "D*** A***"
  const maskName = (fullName: string): string => {
    if (!fullName || fullName.trim() === "") return "Anonim";
    const parts = fullName.trim().split(/\s+/);
    return parts.map(part => {
      if (part.length <= 1) return part;
      return part[0].toUpperCase() + "***";
    }).join(" ");
  };
  
  // Check if user is logged in and get user name
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(!!data?.user?.email);
        if (data?.user?.name) {
          setUserName(data.user.name);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);
  
  // Ortalama puan hesapla
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  // Görsel seçme handler
  const handleReviewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Max 3 görsel
    const remainingSlots = 3 - reviewImages.length;
    const newFiles = Array.from(files).slice(0, remainingSlots);
    
    // Dosya boyutu kontrolü (max 5MB)
    const validFiles = newFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} dosyası 5MB'dan büyük olamaz`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      setReviewImages(prev => [...prev, ...validFiles]);
      // Önizleme oluştur
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReviewImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Input'u sıfırla
    if (reviewImageInputRef.current) {
      reviewImageInputRef.current.value = '';
    }
  };
  
  // Görsel silme
  const handleRemoveReviewImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
    setReviewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  // Görselleri S3'e yükle
  const uploadReviewImages = async (): Promise<string[]> => {
    if (reviewImages.length === 0) return [];
    
    setReviewImageUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of reviewImages) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'product-comments');
        
        const response = await fetch('/api/upload/review-image', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setReviewImageUploading(false);
    }
    
    return uploadedUrls;
  };
  
  // Yorum gönderme
  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewComment.trim()) {
      return;
    }
    
    // Guest kullanıcılar için isim zorunlu
    if (!isLoggedIn && !guestName.trim()) {
      alert("Lütfen adınızı ve soyadınızı giriniz");
      return;
    }
    
    // Guest kullanıcılar görsel yükleyemez
    if (!isLoggedIn && reviewImages.length > 0) {
      alert("Görsel eklemek için giriş yapmanız gerekmektedir");
      return;
    }
    
    setReviewSubmitting(true);
    
    try {
      // Önce görselleri yükle
      const imageUrls = await uploadReviewImages();
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productData?.id || product?.id,
          rating: reviewRating,
          title: reviewTitle || null,
          comment: reviewComment,
          images: imageUrls, // Yüklenen görsel URL'leri
          guestName: !isLoggedIn ? guestName.trim() : undefined,
          nameDisplayPreference: isLoggedIn ? nameDisplayPreference : "masked",
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        // Başarılı
        setReviewSubmitted(true);
        setReviewIsUpdate(!!result.isUpdate);
        // Form kapat
        setReviewFormOpen(false);
        // Form temizle
        setReviewRating(0);
        setReviewTitle("");
        setReviewComment("");
        setReviewImages([]);
        setReviewImagePreviews([]);
        setGuestName("");
      } else {
        const data = await response.json();
        alert(data.error || "Yorum gönderilemedi");
      }
    } catch (error) {
      console.error("Review submit error:", error);
      alert("Yorum gönderilirken bir hata oluştu");
    } finally {
      setReviewSubmitting(false);
    }
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

          {/* SAG - Info Panel - Kompakt 600px */}
          <div className="product-info-column" style={{
            backgroundColor: 'rgba(19, 19, 19, 0.9)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px',
            padding: '16px',
            width: '600px',
            height: '600px',
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
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'white', lineHeight: '1.25', marginBottom: '6px' }}>
              {product.name}
            </h1>

            {/* Subtitle */}
            {product.shortDescription && (
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', lineHeight: '1.4' }}>
                {product.shortDescription}
              </p>
            )}

            {/* Kargo Timer */}
            <div style={{ marginBottom: '8px' }}>
              <KargoTimer 
                variant="siparis" 
                inStock={(product?.stock ?? 0) > 0 || (productData?.stock ?? 0) > 0}
              />
            </div>

            {/* PAKET İÇERİĞİ - Compact version for 4 items */}
            <div className="bundle-items-section" style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Paket İçeriği
                </span>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                  {bundleItems.length} ürün
                </span>
              </div>

              {/* Items - compact grid */}
              <div
                className="bundle-items-list"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: 0,
                }}
              >
                {bundleItems.map((item) => {
                  const p = item.product;
                  const hasCompare = !!p?.comparePrice && (p.comparePrice ?? 0) > (p?.price ?? 0);
                  const productSlug = p?.slug;

                  return (
                    <Link
                      key={item.id}
                      href={productSlug ? `/urun/${productSlug}` : '#'}
                      className="bundle-item-row"
                      style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        display: 'grid',
                        gridTemplateColumns: '48px 1fr auto',
                        minWidth: 0,
                        overflow: 'hidden',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        cursor: productSlug ? 'pointer' : 'default',
                      }}
                      onClick={(e) => !productSlug && e.preventDefault()}
                    >
                      {/* Sol - Görsel (compact) */}
                      <div
                        className="bundle-item-image"
                        style={{
                          width: 48,
                          height: 48,
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '7px',
                          overflow: 'hidden',
                        }}
                      >
                        {p?.thumbnail ? (
                          <Image
                            src={p.thumbnail}
                            alt={p.name || ''}
                            width={48}
                            height={48}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                        )}
                      </div>

                      {/* Orta - Bilgiler (compact) */}
                      <div
                        className="bundle-item-info"
                        style={{
                          height: 48,
                          padding: '4px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          gap: '2px',
                          minWidth: 0,
                        }}
                      >
                        {/* Ürün Adı */}
                        <div
                          className="bundle-item-name"
                          style={{
                            fontSize: '10px',
                            color: 'white',
                            fontWeight: 500,
                            lineHeight: 1.25,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {p?.name || 'Ürün'}
                          {item.variant && (
                            <span style={{ color: '#F59E0B', marginLeft: '4px', fontSize: '9px' }}>
                              ({item.variant.name}: {item.variant.value})
                            </span>
                          )}
                        </div>

                        {/* Fiyat + Adet Satırı */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap', overflow: 'hidden' }}>
                            {hasCompare && (
                              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
                                {formatPrice(p?.comparePrice || 0)}
                              </span>
                            )}
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {formatPrice(p?.price || 0)}
                            </span>
                            {hasCompare && (
                              <span className="bundle-item-discount-label" style={{ fontSize: '8px', color: '#10B981', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                Tekli İndirimli Fiyat
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            x{item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Sağ - Link İkonu */}
                      {productSlug && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 8px',
                            color: 'rgba(255,255,255,0.3)',
                          }}
                        >
                          <ExternalLink size={12} />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Taksit & SKU */}
            <div 
              className="bundle-stock-info"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                fontSize: '10px', 
                marginBottom: '6px' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#A78BFA', fontWeight: 500 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }}>
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <line x1="2" x2="22" y1="10" y2="10"/>
                  </svg>
                  12 Taksit İmkanı
                </span>
              </div>
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
                      <div className="product-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <span className="product-main-price" style={{ fontSize: '30px', fontWeight: 'bold', color: 'white' }}>{formatPrice(displayPrice)}</span>
                        <span className="product-price-currency" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>TL</span>
                        <span className="product-kdv-text" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>KDV Dahil</span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            lineHeight: 1.1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Pakete Özel İndirim
                        </span>
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
                            // Brand boşsa "FusionMarkt" gibi mock fallback basma
                            brand: productData?.brand || product.brand || '',
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
                                // Brand boşsa "FusionMarkt" gibi mock fallback basma
                                brand: productData?.brand || product.brand || '',
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
            {['Açıklama', 'Yorumlar'].map((tab, idx) => (
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

                {/* Mevcut Yorumlar - Üstte */}
                {reviews.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Müşteri Yorumları ({reviews.length})</h3>
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
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{review.userName}</span>
                                    {review.isVerifiedPurchase && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: '4px' }}>
                                        <CheckCircle size={9} style={{ color: '#10B981' }} />
                                        <span style={{ fontSize: '8px', color: '#10B981', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Satın Alan Kullanıcı</span>
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
                              
                              {/* Yorum Görselleri */}
                              {review.images && review.images.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                                  {review.images.map((img, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => window.open(img, '_blank')}
                                      style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                        padding: 0,
                                        background: 'none',
                                      }}
                                    >
                                      <Image
                                        src={img}
                                        alt={`Yorum görseli ${idx + 1}`}
                                        width={80}
                                        height={80}
                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                      />
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {/* Satıcı Yanıtı */}
                              {review.adminReply && (
                                <div style={{
                                  marginTop: '16px',
                                  padding: '14px',
                                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                  borderLeft: '3px solid #10B981',
                                  borderRadius: '0 10px 10px 0',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#10B981">
                                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                                    </svg>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#10B981' }}>Satıcı Yanıtı</span>
                                    {review.adminReplyAt && (
                                      <span style={{ fontSize: '10px', color: 'rgba(16, 185, 129, 0.7)' }}>
                                        • {new Date(review.adminReplyAt).toLocaleDateString('tr-TR')}
                                      </span>
                                    )}
                                  </div>
                                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                                    {review.adminReply}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Yorum Yazma Alanı - Altta */}
                <div style={{ 
                  padding: reviewFormOpen ? '24px' : '16px', 
                  backgroundColor: 'rgba(255,255,255,0.03)', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.3s ease',
                }}>
                  {!reviewFormOpen ? (
                    // Kapalı durum - buton veya başarı mesajı
                    reviewSubmitted ? (
                      <div style={{
                        width: '100%',
                        padding: '14px 24px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        color: '#10B981',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}>
                        <CheckCircle size={18} />
                        {reviewIsUpdate ? 'Güncelleme Talebiniz Gönderildi' : 'Yorumunuz Gönderildi'}
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewFormOpen(true)}
                        style={{
                          width: '100%',
                          padding: '14px 24px',
                          backgroundColor: '#10B981',
                          border: 'none',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <MessageCircle size={18} />
                        Yorum Yaz
                      </button>
                    )
                  ) : (
                    // Açık durum - form
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageCircle size={18} />
                    Yorum Yaz
                  </h3>
                        <button
                          onClick={() => setReviewFormOpen(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            padding: '4px',
                            fontSize: '12px',
                          }}
                        >
                          ✕
                      </button>
                      </div>
                      
                    <div>
                      {/* Puan */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'block' }}>Puanınız *</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive = (reviewHoverRating || reviewRating) >= star;
                          
                          return (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setReviewHoverRating(star)}
                              onMouseLeave={() => setReviewHoverRating(0)}
                              onClick={() => setReviewRating(star)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Star 
                                size={32} 
                                fill={isActive ? '#FBBF24' : 'transparent'} 
                                stroke="#FBBF24" 
                                strokeWidth={2}
                              />
                            </button>
                          );
                        })}
                        {reviewRating > 0 && (
                          <span style={{ marginLeft: '8px', fontSize: '14px', color: '#FBBF24', fontWeight: '600' }}>
                            {reviewRating} / 5
                          </span>
                        )}
                        </div>
                      </div>
                    
                    {/* İsim Gösterim Tercihi - Giriş yapmış kullanıcılar için */}
                    {isLoggedIn && userName && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Maskelenmiş isim seçeneği */}
                          <label 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px', 
                              padding: '10px 14px', 
                              backgroundColor: nameDisplayPreference === 'masked' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)', 
                              border: nameDisplayPreference === 'masked' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.1)', 
                              borderRadius: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <input 
                              type="radio" 
                              name="namePreference" 
                              checked={nameDisplayPreference === 'masked'} 
                              onChange={() => setNameDisplayPreference('masked')}
                              style={{ accentColor: '#10B981', width: '16px', height: '16px' }}
                            />
                            <span style={{ fontSize: '13px', color: 'white' }}>
                              Yorumum <strong style={{ color: '#10B981' }}>{maskName(userName)}</strong> olarak gözüksün
                            </span>
                          </label>
                          
                          {/* Tam isim seçeneği */}
                          <label 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px', 
                              padding: '10px 14px', 
                              backgroundColor: nameDisplayPreference === 'full' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)', 
                              border: nameDisplayPreference === 'full' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.1)', 
                              borderRadius: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <input 
                              type="radio" 
                              name="namePreference" 
                              checked={nameDisplayPreference === 'full'} 
                              onChange={() => setNameDisplayPreference('full')}
                              style={{ accentColor: '#3B82F6', width: '16px', height: '16px' }}
                            />
                            <span style={{ fontSize: '13px', color: 'white' }}>
                              Yorumum <strong style={{ color: '#3B82F6' }}>{userName}</strong> olarak gözüksün
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {/* Ad Soyad - Sadece guest kullanıcılar için */}
                    {!isLoggedIn && (
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'block' }}>
                          Adınız Soyadınız *
                        </label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Örn: John Doe"
                          style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none' }}
                        />
                        {/* Maskelenmiş isim önizlemesi */}
                        {guestName.trim() && (
                          <div style={{ 
                            marginTop: '8px', 
                            padding: '10px 14px', 
                            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                            border: '1px solid rgba(16, 185, 129, 0.2)', 
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <User size={14} style={{ color: '#10B981' }} />
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                              Yorumunuz <strong style={{ color: '#10B981' }}>{maskName(guestName)}</strong> olarak görüntülenecek
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                      
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
                      
                      {/* Görsel Yükleme - Sadece Üyeler */}
                      {isLoggedIn ? (
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'block' }}>
                            Görsel Ekle (Opsiyonel - Max 3 adet)
                          </label>
                          
                          {/* Görsel Önizlemeleri */}
                          {reviewImagePreviews.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                              {reviewImagePreviews.map((preview, idx) => (
                                <div key={idx} style={{ position: 'relative' }}>
                                  <Image
                                    src={preview}
                                    alt={`Önizleme ${idx + 1}`}
                                    width={80}
                                    height={80}
                                    style={{ borderRadius: '8px', objectFit: 'cover' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveReviewImage(idx)}
                                    style={{
                                      position: 'absolute',
                                      top: '-6px',
                                      right: '-6px',
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      backgroundColor: '#EF4444',
                                      border: 'none',
                                      color: 'white',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Görsel Ekleme Butonu */}
                          {reviewImages.length < 3 && (
                            <>
                              <input
                                ref={reviewImageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleReviewImageSelect}
                                style={{ display: 'none' }}
                              />
                              <button
                                type="button"
                                onClick={() => reviewImageInputRef.current?.click()}
                                disabled={reviewImageUploading}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '10px 16px',
                                  backgroundColor: 'rgba(255,255,255,0.05)',
                                  border: '1px dashed rgba(255,255,255,0.2)',
                                  borderRadius: '10px',
                                  color: 'rgba(255,255,255,0.6)',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                  <circle cx="8.5" cy="8.5" r="1.5"/>
                                  <polyline points="21 15 16 10 5 21"/>
                                </svg>
                                {reviewImageUploading ? 'Yükleniyor...' : 'Görsel Ekle'}
                              </button>
                              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                                JPG, PNG veya WebP • Max 5MB • {3 - reviewImages.length} görsel daha ekleyebilirsiniz
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                            Görsel eklemek için <a href="/hesabim" style={{ color: '#10B981', textDecoration: 'underline' }}>giriş yapın</a>
                          </p>
                        </div>
                      )}
                      
                    {/* Gönder Butonu */}
                    {(() => {
                      const needsGuestName = !isLoggedIn && !guestName.trim();
                      const isDisabled = reviewSubmitting || reviewSubmitted || !reviewComment.trim() || !reviewRating || needsGuestName;
                      const isActive = !isDisabled;
                      
                      return (
                      <button
                        onClick={handleSubmitReview}
                          disabled={isDisabled}
                          style={{ 
                            padding: '12px 32px', 
                            backgroundColor: reviewSubmitted 
                              ? '#10B981' 
                              : isActive 
                                ? '#10B981'
                                : 'rgba(255,255,255,0.1)', 
                            color: 'white', 
                            borderRadius: '12px', 
                            border: 'none', 
                            cursor: isDisabled ? 'not-allowed' : 'pointer', 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          {reviewSubmitted ? (
                            <>
                              <CheckCircle size={18} />
                              Yorumunuz Gönderildi
                            </>
                          ) : reviewSubmitting ? (
                            'Gönderiliyor...'
                          ) : !reviewRating ? (
                            'Lütfen Puanlama Yapınız'
                          ) : needsGuestName ? (
                            'Lütfen Adınızı Giriniz'
                          ) : !reviewComment.trim() ? (
                            'Lütfen Yorumunuzu Yazınız'
                          ) : (
                            'Yorumu Gönder'
                          )}
                        </button>
                      );
                    })()}
                                  </div>
                    </>
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
            ) : null}
          </div>
        </div>

        {/* DİĞER PAKETLER SECTION - Aynı kategorideki diğer paketler */}
        {/* Web: Yatay scroll, Mobil: Dikey liste - RelatedProductCard tarzı */}
        <div style={{ marginTop: '48px', marginBottom: '80px', minHeight: '100px' }}>
        {relatedBundles && relatedBundles.length > 0 ? (
          <div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>Benzer Paketler</span>
              <span style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.4)', 
                fontWeight: '400',
                marginLeft: '8px',
              }}>
                Bu kategorideki diğer paketler
              </span>
            </h2>

            {/* Benzer Paketler - RelatedProductCard ile aynı component */}
            <div className="frequently-bought-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {relatedBundles.map((bundle: RelatedBundle) => (
                <RelatedProductCard 
                  key={bundle.id} 
                  product={{
                    id: bundle.id,
                    slug: bundle.slug,
                    name: bundle.name,
                    price: bundle.price,
                    comparePrice: (bundle.totalValue || 0) > bundle.price ? bundle.totalValue : undefined,
                    thumbnail: bundle.thumbnail,
                    brand: 'Bundle / Paket',
                    stock: bundle.stock || 10,
                    freeShipping: false,
                    shortDescription: bundle.shortDescription?.trim(),
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          // Benzer paket yoksa da boşluk bırak
          <div style={{ 
            padding: '24px', 
            textAlign: 'center', 
            color: 'rgba(255,255,255,0.3)',
            fontSize: '13px',
          }}>
            {/* Boş alan */}
          </div>
        )}
        </div>

      </div>
    </div>
  );
}
