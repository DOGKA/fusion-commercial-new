/**
 * Çerez Politikası Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.cookiePolicy;

export default function CerezPolitikasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

