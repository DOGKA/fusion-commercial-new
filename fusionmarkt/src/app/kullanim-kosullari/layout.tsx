/**
 * Kullanım Koşulları Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.termsOfUse;

export default function KullanimKosullariLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

