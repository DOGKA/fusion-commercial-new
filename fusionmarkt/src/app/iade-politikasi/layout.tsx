/**
 * İade Politikası Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.returnPolicy;

export default function IadePolitikasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

