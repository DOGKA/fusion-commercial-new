/**
 * İletişim Layout - SEO Metadata
 */

import { staticPageMetadata, generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";

export const metadata = staticPageMetadata.contact;

export default function IletisimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localBusinessSchema = generateLocalBusinessSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Ana Sayfa", url: "/" },
    { name: "İletişim", url: "/iletisim" },
  ]);

  return (
    <>
      <JsonLd data={[localBusinessSchema, breadcrumbSchema]} />
      {children}
    </>
  );
}

