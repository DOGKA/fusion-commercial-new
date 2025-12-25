"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Clock, Gift, Copy, Check, Info } from "lucide-react";
import MysteryBox from "./MysteryBox";
import { useMysteryBox } from "@/context/MysteryBoxContext";
import { Coupon } from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// MYSTERY BOX MODAL
// Context ile entegre - 24 saat kuralını uygular
// ═══════════════════════════════════════════════════════════════════════════

export default function MysteryBoxModal() {
  const { 
    isModalOpen, 
    closeModal, 
    canOpen, 
    hasClaim, 
    claim, 
    coupon,
    claimCoupon,
    isLoading: statusLoading 
  } = useMysteryBox();
  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Kuponları API'den çek
  useEffect(() => {
    if (isModalOpen && canOpen && coupons.length === 0) {
      fetchCoupons();
    }
  }, [isModalOpen, canOpen]);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/public/mystery-box-coupons");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const formattedData = data.map((c: Coupon) => ({
        ...c,
        expiresAt: c.expiresAt ? new Date(c.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }));
      setCoupons(formattedData);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Kutu açıldığında claim API'sini çağır
  const handleBoxOpen = useCallback(async (couponId: string) => {
    setClaimError(null);
    const result = await claimCoupon(couponId);
    if (!result.success) {
      setClaimError(result.error || "Kutu açılamadı");
    }
  }, [claimCoupon]);

  // Kalan süre formatı
  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} saat ${minutes} dakika`;
  };

  // Kopyala
  const handleCopy = () => {
    if (claim?.couponCode) {
      navigator.clipboard.writeText(claim.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Body scroll kilitle
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={closeModal}
          />

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2 }}
            onClick={closeModal}
            className="fixed top-6 right-6 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200"
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>

          {/* Content */}
          <div className="relative z-10 w-full max-w-4xl">
            
            {/* ═══════════════════════════════════════════════════════════════
                DURUM 1: Zaten kutu açılmış - Kupon göster
                ═══════════════════════════════════════════════════════════════ */}
            {hasClaim && claim && coupon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                {/* Badge - Squircle style */}
                <div className="mystery-coupon-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 mb-6">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-300">Kupon Kazandınız!</span>
                </div>

                {/* Kupon Kartı */}
                <div className="max-w-md mx-auto bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#1a1a1a] border border-white/10 rounded-3xl p-8 mb-6">
                  {/* İndirim */}
                  <div className="mb-6">
                    <span className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                      {coupon.discountType === "percentage" 
                        ? `%${coupon.discountValue}` 
                        : `₺${coupon.discountValue.toLocaleString("tr-TR")}`
                      }
                    </span>
                    <p className="text-lg text-white/80 mt-1">İndirim</p>
                  </div>

                  {/* Kupon Kodu */}
                  <div className="mb-6">
                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Kupon Kodu</p>
                    <button
                      onClick={handleCopy}
                      className="mystery-coupon-code group flex items-center justify-center gap-3 w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl hover:bg-white/10 transition-all duration-300"
                    >
                      <span className="font-mono text-xl font-bold text-white tracking-widest">
                        {claim.couponCode}
                      </span>
                      {copied ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                      )}
                    </button>
                    {copied && (
                      <p className="text-xs text-emerald-400 mt-2">Kopyalandı!</p>
                    )}
                  </div>

                  {/* Min. Tutar */}
                  {coupon.minOrderAmount && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <Info className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">
                        Min. {coupon.minOrderAmount.toLocaleString("tr-TR")} ₺ alışveriş
                      </span>
                    </div>
                  )}
                </div>

                {/* Kalan Süre */}
                <div className="flex items-center justify-center gap-2 text-white/50">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {formatTimeRemaining(claim.timeRemaining)} sonra yeni kutu açabilirsiniz
                  </span>
                </div>

                {/* Bilgi */}
                <p className="text-white/40 text-sm mt-4">
                  Bu kupon kodunu sepetinizde kullanabilirsiniz.
                </p>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                DURUM 2: Kutu açılabilir - Mystery Box'ları göster
                ═══════════════════════════════════════════════════════════════ */}
            {canOpen && !hasClaim && (
              <>
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white/70">Sürpriz Kutu</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Kutulardan birini seç,{" "}
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      sürprizi keşfet!
                    </span>
                  </h2>
                </motion.div>

                {/* Error Message */}
                {claimError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto mb-6 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-center"
                  >
                    <p className="text-red-400 text-sm">{claimError}</p>
                  </motion.div>
                )}

                {/* Loading State */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mb-4" />
                    <p className="text-white/60">Kuponlar yükleniyor...</p>
                  </motion.div>
                )}

                {/* Error State */}
                {!loading && error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <p className="text-white/60 mb-4">Kuponlar yüklenirken bir hata oluştu.</p>
                    <button
                      onClick={fetchCoupons}
                      className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition-colors"
                    >
                      Tekrar Dene
                    </button>
                  </motion.div>
                )}

                {/* Empty State */}
                {!loading && !error && coupons.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <div className="w-24 h-24 mb-4 opacity-50">
                      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="15" y="35" width="70" height="50" rx="5" stroke="white" strokeWidth="2" strokeDasharray="4 4"/>
                        <path d="M15 50H85" stroke="white" strokeWidth="2" strokeDasharray="4 4"/>
                        <path d="M50 35V85" stroke="white" strokeWidth="2" strokeDasharray="4 4"/>
                        <path d="M35 35L50 15L65 35" stroke="white" strokeWidth="2" strokeDasharray="4 4"/>
                      </svg>
                    </div>
                    <p className="text-white/60 text-center">
                      Şu anda aktif kampanya kuponu bulunmuyor.<br/>
                      Yakında yeni sürprizlerle döneceğiz!
                    </p>
                  </motion.div>
                )}

                {/* Mystery Boxes */}
                {!loading && !error && coupons.length > 0 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
                  >
                    {coupons.map((couponItem, index) => (
                      <motion.div
                        key={couponItem.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="flex-shrink-0 w-[130px] md:w-[150px]"
                      >
                        <MysteryBox
                          id={couponItem.id}
                          coupon={couponItem}
                          delay={index}
                          onOpen={() => handleBoxOpen(couponItem.id)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Info text */}
                {!loading && !error && coupons.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-white/40 text-sm mt-8"
                  >
                    Her kutuda farklı bir indirim kuponu seni bekliyor!
                  </motion.p>
                )}
              </>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                DURUM 3: Loading
                ═══════════════════════════════════════════════════════════════ */}
            {statusLoading && !hasClaim && !canOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mb-4" />
                <p className="text-white/60">Yükleniyor...</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
