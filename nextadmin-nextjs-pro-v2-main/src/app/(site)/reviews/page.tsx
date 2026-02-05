"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  images: string[]; // Yorum görselleri
  isApproved: boolean;
  isVerified: boolean;
  adminReply: string | null; // Admin cevabı
  adminReplyAt: string | null; // Cevap tarihi
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  product: {
    id: string;
    name: string;
    thumbnail: string | null;
  } | null;
  bundle: {
    id: string;
    name: string;
    thumbnail: string | null;
  } | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Görsel Modal Bileşeni
function ImageModal({ 
  images, 
  initialIndex, 
  onClose 
}: { 
  images: string[]; 
  initialIndex: number; 
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[500px] max-h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat butonu */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Görsel */}
        <Image
          src={images[currentIndex]}
          alt={`Yorum görseli ${currentIndex + 1}`}
          width={500}
          height={500}
          className="rounded-lg object-contain"
          style={{ maxWidth: "500px", maxHeight: "500px" }}
        />

        {/* Navigasyon */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Onaylama Modal Bileşeni
function ApproveModal({
  review,
  onClose,
  onApprove,
}: {
  review: Review;
  onClose: () => void;
  onApprove: (id: string, adminReply: string) => void;
}) {
  const [adminReply, setAdminReply] = useState(review.adminReply || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onApprove(review.id, adminReply);
    setLoading(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-dark rounded-xl p-6 w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">
          Yorumu Onayla
        </h3>

        {/* Yorum Özeti */}
        <div className="bg-gray-50 dark:bg-dark-2 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={review.rating} />
            <span className="text-sm text-gray-500">
              {review.user.name || review.user.email}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
          
          {/* Görseller */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  alt={`Görsel ${idx + 1}`}
                  width={60}
                  height={60}
                  className="rounded object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Admin Cevabı */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-dark dark:text-white mb-2">
            Satıcı Yanıtı (Opsiyonel)
          </label>
          <textarea
            value={adminReply}
            onChange={(e) => setAdminReply(e.target.value)}
            placeholder="Müşteriye bir yanıt yazın... (Yorum ile birlikte yayınlanacak)"
            rows={4}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none focus:border-primary dark:border-dark-3 dark:text-white dark:focus:border-primary"
          />
          <p className="text-xs text-gray-500 mt-1">
            Bu yanıt, onaylanan yorum ile birlikte müşterilere gösterilecektir.
          </p>
        </div>

        {/* Butonlar */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-2"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Onaylanıyor..." : "Onayla ve Yayınla"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, approved
  const [imageModal, setImageModal] = useState<{ images: string[]; index: number } | null>(null);
  const [approveModal, setApproveModal] = useState<Review | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/reviews" : `/api/reviews?status=${filter}`;
      // Cache-busting için timestamp ekle
      const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        console.error("Error fetching reviews:", res.status, res.statusText);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApproveWithReply = async (id: string, adminReply: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isApproved: true, 
          adminReply: adminReply || null,
        }),
      });
      if (res.ok) {
        // Onaylama başarılı - listeyi yeniden çek
        await fetchReviews();
      } else {
        console.error("Error approving review:", res.status, res.statusText);
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const handleUnapprove = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false }),
      });
      if (res.ok) {
        // Onay kaldırma başarılı - listeyi yeniden çek
        await fetchReviews();
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Silme başarılı - listeyi yeniden çek
        await fetchReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const withImagesCount = reviews.filter((r) => r.images && r.images.length > 0).length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Ürün ve Paket Yorumları</h1>
        <p className="text-gray-500">Müşteri yorumlarını yönetin, görselleri inceleyin ve yanıt verin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{reviews.length}</p>
          <p className="text-sm text-gray-500">Toplam Yorum</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-yellow-500">{avgRating}</p>
            <StarRating rating={Math.round(Number(avgRating))} />
          </div>
          <p className="text-sm text-gray-500">Ortalama Puan</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
          <p className="text-sm text-gray-500">Beklemede</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{approvedCount}</p>
          <p className="text-sm text-gray-500">Onaylandı</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-purple-500">{withImagesCount}</p>
          <p className="text-sm text-gray-500">Görselli Yorum</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "pending", "approved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-2 dark:text-gray-400"
            }`}
          >
            {f === "all" ? "Tümü" : f === "pending" ? "Beklemede" : "Onaylandı"}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Yorum Listesi</h2>
        </div>

        {reviews.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500">Henüz yorum yok</p>
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-dark-3">
            {reviews.map((review) => (
              <div key={review.id} className="p-6">
                {/* Üst Kısım: Kullanıcı bilgisi ve durum */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium text-primary">
                        {review.user.name?.charAt(0) || review.user.email?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-dark dark:text-white">
                        {review.user.name || "İsimsiz"}
                      </p>
                      <p className="text-sm text-gray-500">{review.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {review.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/10">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Doğrulanmış Alıcı
                      </span>
                    )}
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      review.isApproved
                        ? "bg-green-100 text-green-600 dark:bg-green-500/10"
                        : "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10"
                    }`}>
                      {review.isApproved ? "Onaylandı" : "Beklemede"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>

                {/* Ürün/Bundle bilgisi */}
                <div className="mb-2">
                  {review.product ? (
                    <>
                      <span className="text-sm text-gray-500">Ürün: </span>
                      <span className="text-sm font-medium text-primary">{review.product.name}</span>
                    </>
                  ) : review.bundle ? (
                    <>
                      <span className="text-sm text-gray-500">Paket: </span>
                      <span className="text-sm font-medium text-green-600">{review.bundle.name}</span>
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                        Bundle
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Ürün bilgisi yok</span>
                  )}
                </div>

                {/* Rating ve Başlık */}
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={review.rating} />
                  {review.title && (
                    <span className="font-medium text-dark dark:text-white">{review.title}</span>
                  )}
                </div>

                {/* Yorum metni */}
                <p className="text-gray-600 dark:text-gray-400 mb-4">{review.comment}</p>

                {/* Görseller - 200x200 thumbnail grid */}
                {review.images && review.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Müşteri Görselleri ({review.images.length})
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {review.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setImageModal({ images: review.images, index: idx })}
                          className="relative group overflow-hidden rounded-lg border border-stroke dark:border-dark-3 hover:border-primary transition-colors"
                        >
                          <Image
                            src={img}
                            alt={`Yorum görseli ${idx + 1}`}
                            width={100}
                            height={100}
                            className="object-cover"
                            style={{ width: "100px", height: "100px" }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mevcut Admin Cevabı */}
                {review.adminReply && (
                  <div className="mb-4 bg-green-50 dark:bg-green-500/10 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                        Satıcı Yanıtı
                      </span>
                      {review.adminReplyAt && (
                        <span className="text-xs text-green-600/70">
                          • {new Date(review.adminReplyAt).toLocaleDateString("tr-TR")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-300">{review.adminReply}</p>
                  </div>
                )}

                {/* Aksiyonlar */}
                <div className="flex gap-2">
                  {!review.isApproved && (
                    <button
                      onClick={() => setApproveModal(review)}
                      className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Onayla
                    </button>
                  )}
                  {review.isApproved && (
                    <>
                      <button
                        onClick={() => setApproveModal(review)}
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Yanıt Düzenle
                      </button>
                      <button
                        onClick={() => handleUnapprove(review.id)}
                        className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm hover:bg-yellow-600"
                      >
                        Onayı Kaldır
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {imageModal && (
        <ImageModal
          images={imageModal.images}
          initialIndex={imageModal.index}
          onClose={() => setImageModal(null)}
        />
      )}

      {/* Approve Modal */}
      {approveModal && (
        <ApproveModal
          review={approveModal}
          onClose={() => setApproveModal(null)}
          onApprove={handleApproveWithReply}
        />
      )}
    </div>
  );
}
