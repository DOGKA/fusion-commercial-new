/**
 * Gönderim Yerleri Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.shippingLocations;

export default function GonderimYerleriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

