/**
 * Blog Layout
 *
 * Tek amacı blog.css'i (~68 KB) bu rota segmentine hapsetmek. Daha önce
 * globals.css'ten import ediliyordu ve her sayfanın render-blocking
 * stylesheet'ine giriyordu.
 */

import "@/styles/blog.css";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
