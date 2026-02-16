/**
 * Ücretlendirme Politikası Layout - SEO Metadata + Breadcrumb
 */

import { staticPageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";

export const metadata = staticPageMetadata.pricingPolicy;

export default function UcretlendirmePolitikasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "Ücretlendirme Politikası", url: "/ucretlendirme-politikasi" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
