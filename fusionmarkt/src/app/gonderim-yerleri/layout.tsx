/**
 * Gönderim Yerleri Layout - SEO Metadata + Breadcrumb
 */

import { staticPageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";

export const metadata = staticPageMetadata.shippingLocations;

export default function GonderimYerleriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "Gönderim Yerleri", url: "/gonderim-yerleri" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}
