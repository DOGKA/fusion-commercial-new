"use client";

/**
 * Değerlendirme formu (plan 04 §5.1).
 *
 * KONUM `components/review/`, `hesabim/_components/` değil: bugün sipariş
 * detayından açılıyor ama `/hesabim/degerlendirmelerim` ekranı da (plan 04 Faz 1)
 * aynı bileşeni kullanacak. Hesabım'a gömmek o ekran gelince taşıma gerektirirdi.
 *
 * ÜRÜN SAYFASINDAKİ FORMLA İLİŞKİSİ: `SingleProductView`/`BundleProductView`
 * içinde satır içi çalışan bir form daha var. Onu buraya taşımadım — o iki dosya
 * inline stille yazılmış 1500+ satırlık bileşenler ve çalışıyor; aynı dilimde
 * hem yeni giriş noktası açıp hem onları söküp takmak, bir hatanın hangisinden
 * geldiğini ayırt edilemez hale getirirdi. İkisi de aynı `POST /api/reviews`
 * sözleşmesini kullanıyor, davranış farkı yok.
 *
 * Ürün sayfasındaki formdan bir davranış AYRIMI var, kasıtlı: orada görsel
 * yüklemesi sessizce başarısız olabiliyor (`uploadReviewImages` hatayı yutup boş
 * dizi dönüyor), kullanıcı fotoğraf eklediğini sanıp yorumu fotoğrafsız gidiyor.
 * Burada yükleme başarısızsa gönderim durup kullanıcıya söylüyor — iade
 * fotoğraflarında aynı hatayı bir kez yaşadık (`00-KARARLAR` dilim 3).
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, Check, Loader2, X, AlertCircle } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import StarRating from "@/components/review/StarRating";

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_COMMENT = 1000;

export interface ReviewTarget {
  /** `productId` veya `bundleId`'den biri zorunlu — API ikisini de kabul ediyor. */
  productId?: string | null;
  bundleId?: string | null;
  productName: string;
  productImage?: string | null;
  /** Doluysa form düzenleme kipinde açılır. */
  existingReview?: {
    rating: number;
    title: string | null;
    comment: string;
    images: string[];
  } | null;
  /** Yıldıza tıklanarak açıldıysa o puanla ön-doldurulur. */
  initialRating?: number;
}

interface ReviewFormSheetProps {
  /** Açıksa hedef, kapalıysa `null`. */
  target: ReviewTarget | null;
  onClose: () => void;
  /** Gönderim başarılı olduğunda çağrılır (liste yenilemesi için). */
  onSuccess?: () => void;
}

export default function ReviewFormSheet({
  target,
  onClose,
  onSuccess,
}: ReviewFormSheetProps) {
  const isEdit = !!target?.existingReview;

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [nameFull, setNameFull] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Hedef değiştiğinde formu o ürüne göre kur. Sheet kapanınca DOM'dan
  // kalktığı için state'i ayrıca temizlemeye gerek yok; sıfırlamanın sebebi
  // aynı oturumda başka bir ürüne geçilmesi.
  useEffect(() => {
    if (!target) return;
    const existing = target.existingReview;
    setRating(existing?.rating ?? target.initialRating ?? 0);
    setTitle(existing?.title ?? "");
    setComment(existing?.comment ?? "");
    setKeptImages(existing?.images ?? []);
    setImages([]);
    setPreviews([]);
    setNameFull(false);
    setError(null);
    setSuccess(null);
  }, [target]);

  const totalImages = keptImages.length + images.length;

  const onSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const picked = Array.from(files);
    if (totalImages + picked.length > MAX_IMAGES) {
      setError(`En fazla ${MAX_IMAGES} görsel ekleyebilirsiniz`);
      return;
    }

    for (const file of picked) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Sadece JPEG, PNG ve WebP formatları desteklenir");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Her görsel 5MB'dan küçük olmalıdır");
        return;
      }
    }

    setError(null);
    setImages((prev) => [...prev, ...picked]);
    picked.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  /**
   * Görselleri yükler. Bir tanesi bile başarısızsa hata fırlatır: yorumu eksik
   * fotoğrafla göndermek, kullanıcının eklediğini sandığı kanıtı sessizce yok
   * etmek olur.
   */
  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of images) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "product-comments");

      const res = await fetch("/api/upload/review-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("upload-failed");
      const data = await res.json();
      if (!data?.url) throw new Error("upload-failed");
      urls.push(data.url);
    }
    return urls;
  };

  const submit = async () => {
    if (!target) return;
    if (!rating) {
      setError("Lütfen bir puan veriniz");
      return;
    }
    if (!comment.trim()) {
      setError("Lütfen değerlendirmenizi yazınız");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const uploaded = await uploadImages();

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: target.productId || undefined,
          bundleId: target.bundleId || undefined,
          rating,
          title: title.trim() || null,
          comment: comment.trim(),
          images: [...keptImages, ...uploaded],
          nameDisplayPreference: nameFull ? "full" : "masked",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Değerlendirmeniz gönderilemedi");
        return;
      }

      setSuccess(
        data.isUpdate
          ? "Değerlendirmeniz güncellendi ve yeniden onay bekliyor."
          : "Değerlendirmeniz alındı, onaylandıktan sonra yayınlanacak."
      );
      onSuccess?.();
      window.setTimeout(onClose, 2600);
    } catch (err) {
      setError(
        err instanceof Error && err.message === "upload-failed"
          ? "Görseller yüklenemedi, bu yüzden değerlendirmeniz gönderilmedi. Lütfen tekrar deneyiniz."
          : "Bir hata oluştu. Lütfen tekrar deneyiniz."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={target !== null}
      onClose={onClose}
      title={isEdit ? "Değerlendirmemi Düzenle" : "Ürünü Değerlendir"}
      description={target?.productName}
      busy={loading}
      footer={
        success ? null : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-glass-bg px-3 text-[13px] font-medium text-foreground transition-all hover:bg-glass-bg-hover disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={loading || !rating || !comment.trim()}
              className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 text-[13px] font-medium text-emerald-400 transition-all hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Gönderiliyor...
                </>
              ) : isEdit ? (
                "Güncelle"
              ) : (
                "Gönder"
              )}
            </button>
          </div>
        )
      }
    >
      {success ? (
        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
            <Check size={28} className="text-emerald-400" />
          </div>
          <p className="text-[14px] text-foreground">{success}</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-lg bg-glass-bg p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-background">
              {target?.productImage && (
                <Image
                  src={target.productImage}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              )}
            </div>
            <p className="line-clamp-2 text-[13px] text-foreground">
              {target?.productName}
            </p>
          </div>

          {/* Düzenlemenin bedeli gönderimden ÖNCE söyleniyor: yayında olan bir
              yorum güncellenince onaya düşüyor ve mağaza yanıtı siliniyor. */}
          {isEdit && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-[12px] text-amber-400">
                Değerlendirmenizi güncellediğinizde yeniden onaya düşer ve varsa
                mağaza yanıtı kaldırılır.
              </p>
            </div>
          )}

          <div>
            <p className="mb-2 text-[13px] text-foreground-secondary">
              Puanınız <span className="text-red-400">*</span>
            </p>
            <StarRating
              value={rating}
              onChange={setRating}
              disabled={loading}
              showLabel
            />
          </div>

          <div>
            <label
              htmlFor="review-title"
              className="mb-2 block text-[13px] text-foreground-secondary"
            >
              Başlık <span className="text-foreground-muted">(İsteğe bağlı)</span>
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Örn: Beklediğimden iyi çıktı"
              className="w-full rounded-lg border border-border bg-glass-bg px-3 py-2.5 text-[14px] text-foreground placeholder:text-foreground-muted transition-all focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="mb-2 block text-[13px] text-foreground-secondary"
            >
              Değerlendirmeniz <span className="text-red-400">*</span>
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
              rows={4}
              placeholder="Ürünü kullanma deneyiminizi paylaşın. Diğer müşteriler için en faydalısı, nasıl kullandığınız ve nelerden memnun kaldığınız."
              className="w-full resize-none rounded-lg border border-border bg-glass-bg px-3 py-2.5 text-[14px] text-foreground placeholder:text-foreground-muted transition-all focus:border-emerald-500/50 focus:outline-none"
            />
            <p className="mt-1 text-right text-[11px] text-foreground-muted">
              {comment.length}/{MAX_COMMENT}
            </p>
          </div>

          <div>
            <p className="mb-2 text-[13px] text-foreground-secondary">
              Fotoğraf{" "}
              <span className="text-foreground-muted">
                (İsteğe bağlı, en fazla {MAX_IMAGES})
              </span>
            </p>

            {(keptImages.length > 0 || previews.length > 0) && (
              <div className="mb-3 flex flex-wrap gap-2">
                {keptImages.map((url, index) => (
                  <div key={url} className="relative">
                    <Image
                      src={url}
                      alt={`Mevcut görsel ${index + 1}`}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setKeptImages((prev) => prev.filter((_, i) => i !== index))
                      }
                      aria-label={`${index + 1}. görseli kaldır`}
                      className="account-icon-btn account-icon-btn--round absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {previews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative">
                    <Image
                      src={preview}
                      alt={`Yeni görsel ${index + 1}`}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-lg border border-border object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImages((prev) => prev.filter((_, i) => i !== index));
                        setPreviews((prev) => prev.filter((_, i) => i !== index));
                      }}
                      aria-label={`Yeni ${index + 1}. görseli kaldır`}
                      className="account-icon-btn account-icon-btn--round absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalImages < MAX_IMAGES && (
              <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-glass-bg px-4 py-3 transition-all hover:border-emerald-500/50 hover:bg-glass-bg-hover">
                <Camera size={18} className="text-foreground-muted" />
                <span className="text-[13px] text-foreground-muted">
                  Fotoğraf Ekle ({totalImages}/{MAX_IMAGES})
                </span>
                <input
                  type="file"
                  accept={ALLOWED_TYPES.join(",")}
                  multiple
                  onChange={onSelectImages}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-border bg-glass-bg px-3">
            <input
              type="checkbox"
              checked={nameFull}
              onChange={(e) => setNameFull(e.target.checked)}
              className="h-4 w-4 shrink-0 accent-emerald-500"
            />
            <span className="text-[13px] text-foreground">
              İsmim tam görünsün
              <span className="ml-1 text-foreground-muted">
                (işaretlemezseniz D*** A*** şeklinde görünür)
              </span>
            </span>
          </label>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-[13px] text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
