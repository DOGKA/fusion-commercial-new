/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2 } from "lucide-react";
import MysteryBox from "./MysteryBox";
import { Coupon } from "./types";

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CampaignModal({ isOpen, onClose }: CampaignModalProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Kuponları API'den çek
  useEffect(() => {
    if (isOpen && coupons.length === 0) {
      fetchCoupons();
    }
  }, [isOpen]);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/public/mystery-box-coupons");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // expiresAt string'i Date'e çevir
      const formattedData = data.map((c: any) => ({
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

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
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
            onClick={onClose}
          />

          {/* Close Button - Fixed position */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2 }}
            onClick={onClose}
            className="fixed top-6 right-6 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200"
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>

          {/* Content */}
          <div className="relative z-10 w-full max-w-4xl">
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

            {/* Mystery Boxes - Centered */}
            {!loading && !error && coupons.length > 0 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
              >
                {coupons.map((coupon, index) => (
                  <motion.div
                    key={coupon.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex-shrink-0 w-[130px] md:w-[150px]"
                  >
                    <MysteryBox
                      id={coupon.id}
                      coupon={coupon}
                      delay={index}
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
