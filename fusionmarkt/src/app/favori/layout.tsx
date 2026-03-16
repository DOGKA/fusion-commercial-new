/**
 * Favoriler Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.favorites;

export default function FavoriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

