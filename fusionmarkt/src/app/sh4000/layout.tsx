import { generateMetadata } from '@/lib/seo/metadata';

export const metadata = generateMetadata({
  title: 'IEETek SH4000 - 5120Wh Akıllı Enerji Depolama Sistemi',
  description:
    'IEETek SH4000 ile kesintisiz güç deneyimi. 5120Wh kapasite, 4000W sürekli güç, 10ms UPS geçişi. Güneş enerjinizi akıllıca yönetin.',
  keywords: [
    'IEETek SH4000',
    'enerji depolama',
    'batarya sistemi',
    'güneş enerjisi',
    'UPS',
    'inverter',
    'LiFePO4',
  ],
  image: '/sh4000/frame_01.webp',
  canonical: '/sh4000',
  type: 'product',
});

export default function SH4000Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
}
