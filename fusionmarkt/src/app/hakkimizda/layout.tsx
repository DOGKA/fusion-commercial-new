/**
 * Hakkımızda Layout - SEO Metadata
 */

import { staticPageMetadata, generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";

export const metadata = staticPageMetadata.about;

export default function HakkimizdaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localBusinessSchema = generateLocalBusinessSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "Hakkımızda", url: "/hakkimizda" },
  ]);

  return (
    <>
      <JsonLd data={[localBusinessSchema, breadcrumbSchema]} />
      {children}
    </>
  );
}

