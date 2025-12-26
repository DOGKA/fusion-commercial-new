/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { motion } from "framer-motion";
import { Truck, Shield, CreditCard, Headphones, RefreshCw, Package } from "lucide-react";

const announcements = [
  { icon: Headphones, text: "Teknik Destek" },
  { icon: Truck, text: "Türkiye içi 500 TL üzeri Ücretsiz Kargo" },
  { icon: Package, text: "Stok Teslim" },
  { icon: Shield, text: "Güvenli Alışveriş" },
  { icon: CreditCard, text: "VADE FARKSIZ 3 TAKSİT" },
];

const duplicatedAnnouncements = [...announcements, ...announcements, ...announcements, ...announcements];

export default function AnnouncementBar() {
  return (
    <div className="relative bg-white/[0.02] border-b border-white/[0.06] overflow-hidden">
      <div className="py-2.5">
        <motion.div
          animate={{ x: [0, -100 * announcements.length] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {duplicatedAnnouncements.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Icon className="w-4 h-4 text-white/50" />
                <span className="text-white/60">{item.text}</span>
                <span className="text-white/20 mx-4">•</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
