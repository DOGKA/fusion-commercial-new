/**
 * Mağaza Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.shop;

export default function MagazaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

