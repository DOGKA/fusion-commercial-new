import Image from "next/image";
import Link from "next/link";
import type { BrandProduct } from "@/lib/brand-products";

/**
 * Marka sayfasındaki ürün listesi — tamamen sunucuda render ediliyor.
 *
 * Bilinçli olarak `ProductCard` kullanılmıyor: o bileşen sepet/favori
 * bağlamlarına bağlı bir istemci bileşeni, buradaki amaç ise ilk HTML'de
 * okunabilir ürün adı, fiyatı ve stok durumu bulunması.
 */
export default function BrandProductList({
  brandName,
  products,
}: {
  brandName: string;
  products: BrandProduct[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-10 border-t border-border">
      <div className="container">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-foreground-muted mb-4">
          {brandName} Ürünleri ({products.length})
        </h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/urun/${product.slug}`}
                className="flex gap-3 h-full p-3 rounded-2xl border border-border bg-glass-bg transition-colors hover:border-border-secondary"
              >
                {product.thumbnail && (
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-medium text-foreground line-clamp-2">
                    {product.name}
                  </span>
                  {product.shortDescription && (
                    <span className="mt-1 text-[11px] text-foreground-tertiary line-clamp-2">
                      {product.shortDescription}
                    </span>
                  )}
                  <span className="mt-auto pt-2 text-xs text-foreground-secondary tabular-nums">
                    {product.price.toLocaleString("tr-TR")} TL
                    <span className="ml-2 text-[11px] text-foreground-muted">
                      {product.inStock ? "Stokta" : "Tükendi"}
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
