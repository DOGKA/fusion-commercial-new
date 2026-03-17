/**
 * Servis Formu Layout - SEO Metadata
 */

import { staticPageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";

export const metadata = {
  ...staticPageMetadata.serviceForm,
  robots: { index: false, follow: true },
};

export default function ServisFormuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "Servis Formu", url: "/servis-formu" },
  ]);

  return (
    <>
      <JsonLd data={[breadcrumbSchema]} />
      {children}
    </>
  );
}
