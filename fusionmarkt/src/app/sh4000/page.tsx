import dynamic from 'next/dynamic';

// Hero hemen yüklensin
import { Hero360Canvas } from '@/components/sh4000';

// Diğerleri lazy load
const PinnedStory = dynamic(() => import('@/components/sh4000/PinnedStory'), {
  loading: () => <div className="h-screen" />,
});
const ProductDetailsDiagram = dynamic(() => import('@/components/sh4000/ProductDetailsDiagram'));
const SystemDiagram = dynamic(() => import('@/components/sh4000/SystemDiagram'));
const TechSpecsCounter = dynamic(() => import('@/components/sh4000/TechSpecsCounter'));
const UseCases = dynamic(() => import('@/components/sh4000/UseCases'));
const UseGallery = dynamic(() => import('@/components/sh4000/UseGallery'));
const StickyCta = dynamic(() => import('@/components/sh4000/StickyCta'));

// 360 frame paths
const frames = Array.from({ length: 12 }, (_, i) =>
  `/sh4000/frame_${String(i + 1).padStart(2, '0')}.webp`
);

export default function SH4000Page() {
  return (
    <main className="bg-background text-foreground">
      {/* 1. Hero - Ürün Görseli + Temel Özellikler */}
      <Hero360Canvas frames={frames} />

      {/* 2. PinnedStory - Detaylı Özellik Tanıtımı (4 sahne) */}
      <PinnedStory />

      {/* 3. Ürün Detayları - Port ve Bağlantılar */}
      <ProductDetailsDiagram />

      {/* 4. Sistem Diyagramı - Enerji Akışı */}
      <SystemDiagram />

      {/* 5. Teknik Özellikler - Detaylı Tablo */}
      <TechSpecsCounter />

      {/* 6. Kullanım Alanları */}
      <UseCases />

      {/* 7. Kullanım Galerisi */}
      <UseGallery />

      <StickyCta />
    </main>
  );
}
