"use client";

import { useState, useCallback } from "react";
import { motion } from 'framer-motion';
import { Copy, Check, RotateCcw, Gift, Percent, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Coupon } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// COUPON CARD COMPONENT
// Flip animasyonlu kupon kartı - ön yüz (indirim) ve arka yüz (kod)
// Sadeleştirilmiş versiyon - minimal içerik
// ═══════════════════════════════════════════════════════════════════════════

interface CouponCardProps {
  coupon: Coupon;
  onClose?: () => void;
}

export default function CouponCard({ coupon, onClose }: CouponCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Format discount value
  const getDiscountDisplay = () => {
    switch (coupon.discountType) {
      case 'percentage':
        return {
          value: `%${coupon.discountValue}`,
          label: 'İNDİRİM',
          icon: Percent,
        };
      case 'fixed':
        return {
          value: `₺${coupon.discountValue}`,
          label: 'İNDİRİM',
          icon: Gift,
        };
      case 'free_shipping':
        return {
          value: 'ÜCRETSİZ',
          label: 'KARGO',
          icon: Truck,
        };
      default:
        return {
          value: `%${coupon.discountValue}`,
          label: 'İNDİRİM',
          icon: Percent,
        };
    }
  };

  const discount = getDiscountDisplay();
  const DiscountIcon = discount.icon;

  // Copy coupon code to clipboard
  const handleCopy = useCallback(async () => {
    if (!coupon.code) return;
    
    try {
      await navigator.clipboard.writeText(coupon.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [coupon.code]);

  // Flip card
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  return (
    <div 
      className="relative w-full max-w-[160px] mx-auto"
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ 
          transformStyle: 'preserve-3d',
          aspectRatio: '1',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        onClick={handleFlip}
      >
        {/* FRONT FACE - Discount Display */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-2xl overflow-hidden",
            "backface-hidden"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#1a1a1a] border border-white/10 rounded-2xl" />
          
          {/* Decorative glow */}
          <div className="absolute inset-0 opacity-30">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(227, 30, 36, 0.2) 0%, transparent 60%)`,
              }}
            />
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-4 text-center">
            {/* Icon */}
            <div className="mb-2 p-2 rounded-lg bg-white/5 border border-white/10">
              <DiscountIcon className="w-6 h-6 text-white" />
            </div>

            {/* Discount Value */}
            <span className="text-2xl font-black bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text text-transparent">
              {discount.value}
            </span>

            {/* Label */}
            <span className="text-xs font-bold text-white/80 tracking-wider mt-1">
              {discount.label}
            </span>
          </div>

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </motion.div>

        {/* BACK FACE - Code */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-2xl overflow-hidden",
            "backface-hidden"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#1a1a1a] border border-white/10 rounded-2xl" />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-between p-3">
            {/* Top Section - Coupon Code */}
            <div className="w-full">
              <p className="text-[10px] text-white/50 mb-1 uppercase tracking-wider text-center">
                Kupon Kodu
              </p>
              <div 
                className="w-full group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
              >
                <div className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-300">
                  <span className="font-mono text-xs font-bold text-white tracking-wider">
                    {coupon.code || 'FUSION2025'}
                  </span>
                  {isCopied ? (
                    <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 text-white/40 group-hover:text-white transition-colors flex-shrink-0" />
                  )}
                </div>
                {isCopied && (
                  <p className="text-center text-[10px] text-emerald-400 mt-0.5">
                    Kopyalandı!
                  </p>
                )}
              </div>
            </div>

            {/* Middle Section - Conditions */}
            <div className="w-full mt-2 space-y-1 flex-1 flex flex-col justify-center">
              {coupon.conditions && coupon.conditions.length > 0 ? (
                // Kısıtlamalar varsa göster
                coupon.conditions.slice(0, 2).map((condition, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-center"
                  >
                    <span className="text-[9px] text-yellow-400/90 leading-tight">
                      {condition.label}
                    </span>
                  </div>
                ))
              ) : (
                // Kısıtlama yoksa "Tüm ürünlerde geçerli" göster
                <div className="flex items-center justify-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-center">
                  <span className="text-[9px] text-emerald-400/90 leading-tight">
                    Tüm ürünlerde geçerli
                  </span>
                </div>
              )}
            </div>

            {/* Reset button */}
            {onClose && (
              <motion.button
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-3 h-3" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
