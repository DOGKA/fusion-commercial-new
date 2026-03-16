/**
 * Checkout Layout - SEO Metadata & Provider Wrapper
 */

import { staticPageMetadata } from "@/lib/seo";
import CheckoutWrapper from "./CheckoutWrapper";

export const metadata = staticPageMetadata.checkout;

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CheckoutWrapper>{children}</CheckoutWrapper>;
}
