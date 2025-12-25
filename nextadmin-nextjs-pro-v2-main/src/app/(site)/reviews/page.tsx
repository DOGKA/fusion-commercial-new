"use client";

import { useState, useEffect } from "react";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean;
  isVerified: boolean;
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
  };
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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, approved

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const url = filter === "all" ? "/api/reviews" : `/api/reviews?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approve }),
      });
      if (res.ok) {
        setReviews(reviews.map((r) => (r.id === id ? { ...r, isApproved: approve } : r)));
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
        setReviews(reviews.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const approvedCount = reviews.filter((r) => r.isApproved).length;
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
        <h1 className="text-2xl font-bold text-dark dark:text-white">Ürün Yorumları</h1>
        <p className="text-gray-500">Müşteri yorumlarını yönetin ve onaylayın</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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

                <div className="mb-2">
                  <span className="text-sm text-gray-500">Ürün: </span>
                  <span className="text-sm font-medium text-primary">{review.product.name}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={review.rating} />
                  {review.title && (
                    <span className="font-medium text-dark dark:text-white">{review.title}</span>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">{review.comment}</p>

                <div className="flex gap-2">
                  {!review.isApproved && (
                    <button
                      onClick={() => handleApprove(review.id, true)}
                      className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600"
                    >
                      Onayla
                    </button>
                  )}
                  {review.isApproved && (
                    <button
                      onClick={() => handleApprove(review.id, false)}
                      className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm hover:bg-yellow-600"
                    >
                      Onayı Kaldır
                    </button>
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
    </div>
  );
}
