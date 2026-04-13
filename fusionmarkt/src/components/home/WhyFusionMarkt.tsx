"use client";

import { useTransformCarousel } from "@/hooks/useTransformCarousel";
import CarouselNavButtons from "@/components/ui/CarouselNavButtons";
import { Truck, ShieldCheck, RotateCcw, MessageCircle, CreditCard, PackageCheck } from "lucide-react";

const BENEFITS = [
  {
    icon: Truck,
    title: "Aynı Gün Kargoda",
    subtitle: "14:00'e kadar verilen siparişler aynı gün yola çıkar.",
  },
  {
    icon: ShieldCheck,
    title: "Test Edilmiş Ürünler",
    subtitle: "Her ürün satışa sunulmadan önce ekibimiz tarafından kontrol edilir.",
  },
  {
    icon: RotateCcw,
    title: "Kolay İade",
    subtitle: "15 gün içinde koşulsuz iade. Soru sormayız.",
  },
  {
    icon: MessageCircle,
    title: "Gerçek Kişilerle Konuşun",
    subtitle: "Bot değil, ürünleri tanıyan gerçek ekibimiz yanıt verir.",
  },
  {
    icon: CreditCard,
    title: "Taksitle Alın",
    subtitle: "12 aya varan taksit seçenekleri.",
  },
  {
    icon: PackageCheck,
    title: "Seçilmiş Ürünler",
    subtitle: "Yüzlerce marka arasından yalnızca kaliteli olanları sunuyoruz.",
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
          <h2 className="why-fusion-title">FusionMarkt ile hayatınızı kolaylaştırın</h2>
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
