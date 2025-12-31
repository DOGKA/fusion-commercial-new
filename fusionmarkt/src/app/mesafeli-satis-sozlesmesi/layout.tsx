/**
 * Mesafeli Satış Sözleşmesi Layout - SEO Metadata
 */

import { staticPageMetadata } from "@/lib/seo";

export const metadata = staticPageMetadata.distanceSalesContract;

export default function MesafeliSatisSozlesmesiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

