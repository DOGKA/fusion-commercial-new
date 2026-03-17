/**
 * Servis Formu Layout - SEO Metadata
 */

import { generateMetadata as genMeta, generateBreadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo";

export const metadata = genMeta({
  title: "Servis Formu - Teknik Destek Talebi",
  description: "FusionMarkt servis ve teknik destek talep formu. Taşınabilir güç kaynağı, solar panel ve diğer ürünleriniz için garanti kapsamında servis başvurusu yapın.",
  canonical: "/servis-formu",
  keywords: ["fusionmarkt servis", "teknik destek", "garanti başvurusu", "servis talebi"],
  noIndex: true,
});

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
