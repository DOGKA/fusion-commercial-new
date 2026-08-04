/**
 * Favoriler Layout - SEO Metadata
 */

import "@/styles/account-mobile.css";
import "@/styles/account.css";

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.favorites;

export default function FavoriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

