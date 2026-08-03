"use client";

/**
 * Kuponun tam koşul listesi.
 *
 * Kartta yalnızca özet var; kısıtların tamamı (geçerli/hariç kategoriler ve
 * ürünler, indirimli ürün kuralı) buraya taşındı. Mobilde alt panel, masaüstünde
 * modal — ikisi de paylaşılan `Sheet` bileşeninden geliyor.
 */

import Link from "next/link";
import { Check, X, Ticket } from "lucide-react";
import Sheet from "@/components/ui/Sheet";
import type { UserCoupon, CouponRefItem } from "../_lib/types";

interface CouponDetailsSheetProps {
  coupon: UserCoupon | null;
  onClose: () => void;
}

const formatAmount = (value: number) =>
  value.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function RefList({
  items,
  hrefPrefix,
}: {
  items: CouponRefItem[];
  hrefPrefix: "/kategori" | "/urun";
}) {
  return (
    <ul className="mt-1.5 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`${hrefPrefix}/${item.slug}`}
            className="inline-flex min-h-[40px] max-w-full items-center break-words rounded-full border border-border px-3 text-[12px] text-foreground-secondary transition-colors hover:border-[color:var(--acc-accent-border)] hover:text-[color:var(--acc-accent-fg)]"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[13px] text-foreground-secondary">
      {ok ? (
        <Check size={14} className="acc-tone-accent mt-0.5 shrink-0" aria-hidden="true" />
      ) : (
        <X size={14} className="mt-0.5 shrink-0 text-foreground-muted" aria-hidden="true" />
      )}
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

export default function CouponDetailsSheet({ coupon, onClose }: CouponDetailsSheetProps) {
  if (!coupon) return null;

  const { restrictions } = coupon;
  const isPercentage = coupon.discountType === "PERCENTAGE";

  return (
    <Sheet open onClose={onClose} title="Kupon koşulları" size="sm">
      <div className="space-y-4">
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-glass-bg px-3 py-2.5">
          <Ticket size={15} className="acc-tone-accent shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-all font-mono text-[14px] font-medium tracking-wider text-foreground">
            {coupon.code}
          </span>
        </div>

        <ul className="space-y-2">
          <Rule ok>
            {isPercentage
              ? `Sepet tutarına %${formatAmount(coupon.discountValue)} indirim uygulanır.`
              : `Sepet tutarından ${formatAmount(coupon.discountValue)} ₺ düşülür.`}
          </Rule>

          {isPercentage && coupon.maxDiscount ? (
            <Rule ok={false}>
              İndirim en fazla {formatAmount(coupon.maxDiscount)} ₺ olabilir.
            </Rule>
          ) : null}

          {coupon.minOrderAmount ? (
            <Rule ok={false}>
              Sepet tutarı en az {formatAmount(coupon.minOrderAmount)} ₺ olmalıdır.
            </Rule>
          ) : (
            <Rule ok>Alt sepet limiti yok.</Rule>
          )}

          {coupon.freeShipping && <Rule ok>Kargo ücreti alınmaz.</Rule>}

          {coupon.perUserLimit > 0 ? (
            <Rule ok={false}>
              {coupon.perUserLimit === 1
                ? "Yalnızca bir siparişinizde kullanabilirsiniz."
                : `En fazla ${coupon.perUserLimit} siparişinizde kullanabilirsiniz.`}
            </Rule>
          ) : (
            <Rule ok>Dilediğiniz kadar siparişinizde kullanabilirsiniz.</Rule>
          )}

          <Rule ok={!coupon.endDate}>
            {coupon.endDate
              ? `${formatDate(coupon.endDate)} tarihine kadar geçerlidir.`
              : "Son kullanma tarihi yok."}
          </Rule>

          {restrictions.excludeSaleItems && (
            <Rule ok={false}>İndirimli ürünlerde geçerli değildir.</Rule>
          )}
        </ul>

        {restrictions.categories.length > 0 && (
          <div>
            <p className="text-[12px] font-medium text-foreground">
              Yalnızca bu kategorilerde geçerli
            </p>
            <RefList items={restrictions.categories} hrefPrefix="/kategori" />
          </div>
        )}

        {restrictions.products.length > 0 && (
          <div>
            <p className="text-[12px] font-medium text-foreground">
              Yalnızca bu ürünlerde geçerli
            </p>
            <RefList items={restrictions.products} hrefPrefix="/urun" />
          </div>
        )}

        {restrictions.excludedCategories.length > 0 && (
          <div>
            <p className="text-[12px] font-medium text-foreground">
              Hariç tutulan kategoriler
            </p>
            <RefList items={restrictions.excludedCategories} hrefPrefix="/kategori" />
          </div>
        )}

        {restrictions.excludedProducts.length > 0 && (
          <div>
            <p className="text-[12px] font-medium text-foreground">Hariç tutulan ürünler</p>
            <RefList items={restrictions.excludedProducts} hrefPrefix="/urun" />
          </div>
        )}

        <p className="text-[11px] leading-relaxed text-foreground-muted">
          Kodu ödeme adımındaki kupon alanına yazarak kullanabilirsin. Bir siparişte
          yalnızca bir kupon geçerlidir.
        </p>
        {/* Kupon geçerliyken de listeden düşmüş olabilir; kullanıcı kodu bir yere
            kaydettiyse neden çalışmadığını burada anlıyor. */}
        {coupon.perUserLimit > 0 && (
          <p className="text-[11px] leading-relaxed text-foreground-muted">
            Hakkın dolduğunda kupon bu listeden kalkar.
          </p>
        )}
      </div>
    </Sheet>
  );
}
