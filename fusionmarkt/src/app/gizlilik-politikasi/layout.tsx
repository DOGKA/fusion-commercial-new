/**
 * Gizlilik Politikası Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.privacyPolicy;

export default function GizlilikPolitikasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

