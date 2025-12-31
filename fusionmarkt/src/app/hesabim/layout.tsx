/**
 * Hesabım Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.account;

export default function HesabimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

