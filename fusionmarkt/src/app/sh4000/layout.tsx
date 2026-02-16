import { generateMetadata } from '@/lib/seo/metadata';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/seo';

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
    'akıllı enerji depolama',
    'ev enerji sistemi',
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
  const productSchema = generateProductSchema({
    name: 'IEETek SH4000 - 5120Wh Akıllı Enerji Depolama Sistemi',
    description: 'IEETek SH4000 ile kesintisiz güç deneyimi. 5120Wh LiFePO4 kapasite, 4000W sürekli güç, 10ms UPS geçişi. Güneş enerjinizi akıllıca yönetin.',
    image: '/sh4000/frame_01.webp',
    price: 0,
    brand: 'IEETek',
    category: 'Enerji Depolama Sistemi',
    inStock: true,
    url: '/sh4000',
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: '/' },
    { name: 'Mağaza', url: '/magaza' },
    { name: 'IEETek SH4000', url: '/sh4000' },
  ]);

  return (
    <div className="min-h-screen bg-slate-950">
      <JsonLd data={[productSchema, breadcrumbSchema]} />
      {children}
    </div>
  );
}
