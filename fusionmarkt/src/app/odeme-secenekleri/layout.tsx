/**
 * Ödeme Seçenekleri Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.paymentOptions;

export default function OdemeSecenekleriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

