/**
 * Kullanıcı Sözleşmesi Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.userAgreement;

export default function KullaniciSozlesmesiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

