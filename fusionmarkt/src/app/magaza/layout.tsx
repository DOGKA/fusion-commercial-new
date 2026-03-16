/**
 * Mağaza Layout - SEO Metadata + Structured Data
 */

import { staticPageMetadata, generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";

export const metadata = staticPageMetadata.shop;

export default function MagazaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "Mağaza", url: "/magaza" },
  ]);

  const collectionPageSchema = generateWebPageSchema({
    name: "Mağaza - Tüm Ürünler",
    description: "Taşınabilir güç kaynakları, güneş panelleri, yalıtkan merdivenler ve iş güvenliği ekipmanları. En iyi fiyat garantisi ve hızlı kargo.",
    url: "/magaza",
    type: "CollectionPage",
  });

  return (
    <>
      <JsonLd data={[collectionPageSchema, breadcrumbSchema]} />
      <h1 className="sr-only">Mağaza - Taşınabilir Güç Kaynağı, Solar Panel ve Tüm Ürünler | FusionMarkt</h1>
      {children}
    </>
  );
}

