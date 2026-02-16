/**
 * Kullanım Koşulları Layout - SEO Metadata + Breadcrumb
 */

import { staticPageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";

export const metadata = staticPageMetadata.termsOfUse;

export default function KullanimKosullariLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "Kullanım Koşulları", url: "/kullanim-kosullari" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
