"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import CampaignModal from "./CampaignModal";

export default function CampaignWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasCoupons, setHasCoupons] = useState(false);
  const [loading, setLoading] = useState(true);

  // Kupon var mı kontrol et
  useEffect(() => {
    const checkCoupons = async () => {
      try {
        const res = await fetch("/api/public/mystery-box-coupons");
        if (res.ok) {
          const data = await res.json();
          setHasCoupons(data.length > 0);
        }
      } catch (err) {
        console.error("Error checking coupons:", err);
        setHasCoupons(false);
      } finally {
        setLoading(false);
      }
    };

    checkCoupons();
  }, []);

  // Widget'ı sayfa yüklendikten 2 saniye sonra göster (sadece kupon varsa)
  useEffect(() => {
    if (!loading && hasCoupons) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, hasCoupons]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasInteracted(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Kupon yoksa veya yükleniyor ise gösterme
  if (loading || !hasCoupons || !isVisible) return null;

  return (
    <>
      {/* Floating Widget Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            {/* Pulse ring effect */}
            {!hasInteracted && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-yellow-500"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}

            {/* Main button */}
            <motion.button
              onClick={handleOpen}
              className="relative w-16 h-16 rounded-full overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "linear-gradient(135deg, var(--background-tertiary) 0%, var(--background) 100%)",
                border: "2px solid rgba(255,255,255,0.15)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(227,30,36,0.3)",
              }}
            >
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-yellow-500/20" />
              
              {/* Sparkle effects */}
              <motion.div
                className="absolute top-1 right-1"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </motion.div>

              {/* Box icon */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Image
                  src="/box-frames/box-1.png"
                  alt="Mystery Box"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>

              {/* Notification badge */}
              {!hasInteracted && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <span className="text-[10px] font-bold text-white">!</span>
                </motion.div>
              )}
            </motion.button>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaign Modal */}
      <CampaignModal isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
