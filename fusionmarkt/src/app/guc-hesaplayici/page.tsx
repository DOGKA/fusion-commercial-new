import { Metadata } from 'next';
import PowerCalculator from '@/components/power-calculator/PowerCalculator';

export const metadata: Metadata = {
  title: 'Güç & Solar Panel Hesaplayıcı | FusionMarkt',
  description: 'Enerji ihtiyacınızı hesaplayın. Cihazlarınızı ekleyin, ihtiyacınıza uygun güç kaynağı ve solar panel kombinasyonunu hesaplayalım.',
  keywords: ['güç hesaplayıcı', 'solar panel', 'taşınabilir güç kaynağı', 'enerji hesaplama', 'power station', 'off-grid'],
  openGraph: {
    title: 'Güç & Solar Panel Hesaplayıcı | FusionMarkt',
    description: 'Enerji ihtiyacınızı hesaplayın. Cihazlarınızı ekleyin, ihtiyacınıza uygun güç kaynağı ve solar panel kombinasyonunu hesaplayalım.',
    type: 'website',
    locale: 'tr_TR',
  },
};

export default function GucHesaplayiciPage() {
  return (
    <main className="min-h-screen bg-background pb-16" style={{ paddingTop: '120px' }}>
      <PowerCalculator />
    </main>
  );
}
