/**
 * Sözleşme görüntüleme kabuğu.
 *
 * Tek işi CSS'i bu rotaya bağlamak. Stiller eskiden sayfanın içindeki
 * `styled-jsx` bloğundaydı; App Router'da kayıt (registry) olmadan styled-jsx
 * sunucu HTML'ine girmiyor ve sözleşme ilk boyada stilsiz görünüyordu. Gerçek
 * bir CSS dosyası hem SSR'da hem de ilk boyada doğru.
 *
 * account.css de burada: `.contract-page` bu dosyadaki `--acc-*` ton
 * token'larına ve `acc-chip-*` sınıflarına bağlı (contract.css'te 15'ten fazla
 * `var(--acc-*)` referansı var). Dosya globals.css'ten çıkarıldığı için token'lar
 * artık kendiliğinden gelmiyor; contract.css'ten ÖNCE gelmeli ki sözleşmeye
 * özel kurallar üstte kalsın.
 */

import "@/styles/account.css";
import "./contract.css";

export default function ContractLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
