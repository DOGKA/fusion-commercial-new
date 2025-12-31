/**
 * Ücretlendirme Politikası Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.pricingPolicy;

export default function UcretlendirmePolitikasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

