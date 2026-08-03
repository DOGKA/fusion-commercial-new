/**
 * Ana sayfa promo bandı — SUNUCU bileşeni.
 *
 * Eskiden istemcideydi ve tek sebebi bir yedek `fetch` idi: prop verilmezse
 * bileşen banner'ı `/api/public/homepage/promos`'tan kendi çekiyordu. O dal ölü
 * kod: bileşenin tek tüketicisi app/page.tsx ve orada veri her zaman sunucuda
 * `getInitialPromo()` ile çözülüp prop olarak geçiyor. Yedek dalla birlikte
 * `resolved` durumu da gitti; sunucuda cevap zaten kesin.
 */

import Link from "next/link";
import Image from "next/image";

interface PromoData {
  title: string | null;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  image: string | null;
}

export default function PromoBanner({ promo }: { promo: PromoData | null }) {
  return (
    <section className="py-6 lg:py-8">
      <div className="container">
        <div className="promo-banner-wrapper">
          <div
            className="promo-banner-section"
            style={promo?.image ? undefined : { backgroundColor: "var(--background-tertiary)" }}
          >
            {promo?.image && (
              <Image
                src={promo.image}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 1024px) 100vw, 1440px"
                // next.config.ts images.qualities allowlist'inde olmalı, aksi
                // halde optimizer 400 döner
                quality={75}
                className="object-cover object-center"
              />
            )}
            <div className="banner-content">
              {promo?.image ? (
                <>
                  {promo.title && <h2 className="banner-main-title">{promo.title}</h2>}
                  {promo.subtitle && <p className="banner-subtitle">{promo.subtitle}</p>}
                  {promo.buttonLink && promo.buttonText && (
                    <Link href={promo.buttonLink} className="banner-button">{promo.buttonText}</Link>
                  )}
                </>
              ) : (
                /* Admin'e yönelik yer tutucu. Yalnızca "gerçekten banner yok"
                   durumunda basılır — sunucu verisi hazır olduğu için burada
                   bir yükleme ara durumu yok. */
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground-muted)", marginTop: "8px" }}>1440 x 228 px</p>
                  <p style={{ fontSize: "12px", color: "var(--foreground-disabled)" }}>Banner Görseli Eklenecek</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
