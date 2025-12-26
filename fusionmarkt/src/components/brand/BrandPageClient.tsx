/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ArrowRight, ExternalLink, Ticket, Copy, Check } from "lucide-react";
import { 
  Sun, Battery, Zap, Factory, Clock, Package, Users, Award,
  Minimize2, Shield, MousePointer, Plane, Hand, Palette, Leaf, BadgeCheck,
  LucideIcon
} from "lucide-react";
import ParticleField from "@/components/three/ParticleField";
import type { Partner } from "@/lib/partners-data";

const iconMap: Record<string, LucideIcon> = {
  sun: Sun, battery: Battery, zap: Zap, factory: Factory,
  clock: Clock, package: Package, users: Users, award: Award,
  minimize: Minimize2, shield: Shield, pointer: MousePointer, plane: Plane,
  hand: Hand, palette: Palette, leaf: Leaf, badge: BadgeCheck,
};

interface BrandPageClientProps {
  partner: Partner;
}

export default function BrandPageClient({ partner }: BrandPageClientProps) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] relative">
      {/* Full Page Particle Background - Neutral White */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleField className="opacity-20" particleCount={50} color="#ffffff" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section - Logo Only */}
        <section className="pt-[120px] pb-12 lg:pb-16">
          <div className="container">
            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link 
                href="/" 
                className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-8 group"
              >
                <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Ana Sayfa</span>
              </Link>
            </motion.div>
            
            {/* Logo as Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6"
            >
              <div className="relative w-48 h-16 lg:w-64 lg:h-20">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain object-left brightness-0 invert"
                  priority
                />
              </div>
            </motion.div>
            
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm lg:text-base text-white/40 mb-6 max-w-lg"
            >
              {partner.tagline}
            </motion.p>
            
            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <Link
                href={partner.productLink}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                style={{ backgroundColor: '#ffffff', color: '#000000' }}
              >
                <span>Ürünleri Gör</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              
              <span className="text-xs text-white/25">
                FusionMarkt Satış Platformu
              </span>
            </motion.div>
          </div>
        </section>

        {/* Features - Horizontal Scroll */}
        <section className="py-8 border-y border-white/[0.04] overflow-hidden">
          <div className="container">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {partner.features.map((feature, idx) => {
                const Icon = iconMap[feature.icon] || Package;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 flex-shrink-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white/30" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-white/70 whitespace-nowrap">
                        {feature.title}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12 lg:py-16">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 block">
                  Hakkında
                </span>
                <div className="space-y-4">
                  {partner.about.map((paragraph, idx) => (
                    <p 
                      key={idx} 
                      className="text-sm text-white/50 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              
              {/* Features Detail */}
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 block">
                  Özellikler
                </span>
                <div className="space-y-4">
                  {partner.features.map((feature, idx) => {
                    const Icon = iconMap[feature.icon] || Package;
                    return (
                      <div key={idx} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-white/40" />
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-white/80 mb-0.5">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-white/40">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-10 border-t border-white/[0.04]">
          <div className="container">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-4 block">
              Ürün Kategorileri
            </span>
            <div className="flex flex-wrap gap-2">
              {partner.categories.map((category, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs text-white/50"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        {(partner.mission || partner.vision) && (
          <section className="py-10 border-t border-white/[0.04]">
            <div className="container">
              <div className="grid md:grid-cols-2 gap-8">
                {partner.mission && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-2 block">
                      Misyon
                    </span>
                    <p className="text-sm text-white/50">{partner.mission}</p>
                  </div>
                )}
                {partner.vision && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-2 block">
                      Vizyon
                    </span>
                    <p className="text-sm text-white/50">{partner.vision}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Extra Section */}
        {partner.extraSection && (
          <section className="py-10 border-t border-white/[0.04]">
            <div className="container">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-2 block">
                {partner.extraSection.title}
              </span>
              <p className="text-sm text-white/50 max-w-2xl">
                {partner.extraSection.content}
              </p>
            </div>
          </section>
        )}

        {/* Use Cases - if available */}
        {partner.useCases && partner.useCases.length > 0 && (
          <section className="py-10 border-t border-white/[0.04]">
            <div className="container">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-4 block">
                Kullanım Alanları
              </span>
              <div className="flex flex-wrap gap-2">
                {partner.useCases.map((useCase, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white/50"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Footer */}
        <section className="py-12 border-t border-white/[0.04]">
          <div className="container">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={partner.productLink}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors"
                style={{ backgroundColor: '#ffffff', color: '#000000' }}
              >
                <span>Ürünleri Keşfet</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              
              {partner.website && (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  <span>Resmi Web Sitesi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
