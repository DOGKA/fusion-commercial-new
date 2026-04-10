"use client";

import { useTransformCarousel } from "@/hooks/useTransformCarousel";
import CarouselNavButtons from "@/components/ui/CarouselNavButtons";
import { Truck, ShieldCheck, Lock, Headphones, CreditCard, Globe } from "lucide-react";

const BENEFITS = [
  {
    icon: Truck,
    title: "Hızlı ve Ücretsiz Kargo",
    subtitle: "Tüm siparişler 1 iş gününde gönderilir.",
  },
  {
    icon: ShieldCheck,
    title: "Garanti Koruması",
    subtitle: "Tüm ürünler garanti hizmeti kapsamındadır.",
  },
  {
    icon: Lock,
    title: "Güvenli Ödeme",
    subtitle: "Banka veya kredi kartı ile güvenle ödeme yapın.",
  },
  {
    icon: Headphones,
    title: "Birçok Kanaldan Destek",
    subtitle: "E-posta veya telefon ile bize ulaşın.",
  },
  {
    icon: CreditCard,
    title: "Uygun Taksit Seçenekleri",
    subtitle: "Vade farksız taksit ile dilediğiniz gibi alışveriş yapın.",
  },
  {
    icon: Globe,
    title: "FusionMarkt Ailesi",
    subtitle: "Üye olun, yeniliklerden ve kampanyalardan haberdar olun.",
  },
];

export default function WhyFusionMarkt() {
  const {
    containerRef,
    wrapperRef,
    containerStyle,
    wrapperStyle,
    handlers,
    scrollBy,
  } = useTransformCarousel({ friction: 0.92 });

  return (
    <section className="why-fusion-section">
      <div className="container">
        <div className="why-fusion-header">
          <h2 className="why-fusion-title">Neden FusionMarkt?</h2>
          <div className="why-fusion-nav">
            <CarouselNavButtons
              scrollBy={scrollBy}
              scrollAmount={280}
              theme="neutral"
            />
          </div>
        </div>
      </div>

      <div className="container">
        <div
          ref={containerRef}
          style={containerStyle}
        >
          <div
            ref={wrapperRef}
            style={{ ...wrapperStyle, gap: "16px" }}
            {...handlers}
            className="flex items-stretch pb-4"
          >
            {BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="why-fusion-card">
                  <div className="why-fusion-icon">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="why-fusion-card-title">{benefit.title}</h3>
                  <p className="why-fusion-card-subtitle">{benefit.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
