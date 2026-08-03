/**
 * Sözleşme görüntüleme kabuğu.
 *
 * Tek işi `contract.css`'i bu rotaya bağlamak. Stiller eskiden sayfanın
 * içindeki `styled-jsx` bloğundaydı; App Router'da kayıt (registry) olmadan
 * styled-jsx sunucu HTML'ine girmiyor ve sözleşme ilk boyada stilsiz
 * görünüyordu. Gerçek bir CSS dosyası hem SSR'da hem de ilk boyada doğru.
 */

import "./contract.css";

export default function ContractLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
