import { ChevronDown } from "lucide-react";
import type { ProductFaqItem, ProductFaqSection } from "@/lib/product-faq";

/**
 * Ürün sayfasının altındaki soru-cevap bölümü — tamamen sunucuda basılıyor.
 *
 * Açılır/kapanır davranış için `<details>` kullanılıyor; böylece bölüm hiçbir
 * JavaScript'e bağlı olmadan çalışıyor ve cevaplar ilk HTML'in içinde yer
 * alıyor. FAQPage şemasındaki metinlerin sayfada görünür olması da bu sayede
 * sağlanıyor.
 *
 * Başlık ve soru seti kategoriye göre değişiyor; ikisini de `buildProductFaq`
 * belirliyor.
 */
export default function ProductFaq({ faq }: { faq: ProductFaqSection }) {
  const { eyebrow, title, items } = faq;
  if (items.length === 0) return null;

  return (
    <section className="container py-12 border-t border-border">
      <header className="mb-5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
          {eyebrow}
        </span>
        <h2 className="mt-1 text-xl font-semibold text-foreground">{title}</h2>
      </header>

      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <details
            key={item.question}
            className="group overflow-hidden rounded-2xl border border-border bg-glass-bg"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-background-hover [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <ChevronDown
                size={16}
                aria-hidden
                className="shrink-0 text-foreground-tertiary transition-transform duration-200 group-open:rotate-180"
              />
            </summary>

            <div className="px-5 pb-5">
              <p className="text-[13px] leading-relaxed text-foreground-secondary">
                {item.intro}
              </p>
              {item.rows?.length ? (
                <div className="mt-3">
                  <FaqSpecTable rows={item.rows} />
                </div>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

/**
 * Ölçülebilir cevaplar virgülle ayrılmış bir cümle yerine tabloya basılıyor;
 * "buzdolabı ≈12 saat, dizüstü ≈27 saat" gibi listeler düz metinde okunmuyor.
 *
 * Tablonun kendi çerçevesi yok: satırlar zaten çerçeveli kartın içinde duruyor,
 * iç içe iki kutu görüntüsü oluşuyordu. Satırlar hafif zeminle ayrılıyor.
 */
function FaqSpecTable({ rows }: { rows: NonNullable<ProductFaqItem["rows"]> }) {
  return (
    <table className="w-full border-separate border-spacing-0 text-[13px]">
      <tbody>
        {rows.map((row, index) => {
          // Şeritli zemin: tek satırlar kartın kendi rengiyle kalıyor.
          const striped = index % 2 === 0 ? "bg-foreground/[0.04]" : "";
          return (
            <tr key={row.name}>
              <th
                scope="row"
                className={`w-3/5 rounded-l-lg px-3 py-2 text-left align-top font-medium text-foreground-secondary ${striped}`}
              >
                {row.name}
              </th>
              <td
                className={`rounded-r-lg px-3 py-2 font-semibold text-foreground whitespace-nowrap ${striped}`}
              >
                {row.value}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
