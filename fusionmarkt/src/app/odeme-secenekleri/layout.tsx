/**
 * Ödeme Seçenekleri Layout - SEO Metadata + Breadcrumb
 */

import { staticPageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";

export const metadata = staticPageMetadata.paymentOptions;

export default function OdemeSecenekleriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "Ödeme Seçenekleri", url: "/odeme-secenekleri" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
