import Link from "next/link";

/**
 * HomeSeoContent - Ana sayfa SEO metin bölümü
 * Google'ın sayfayı anlaması için keyword-rich, doğal okunur metin
 * Tasarım sitenin dark temasına uygun, minimal ve şık
 */
export default function HomeSeoContent() {
  return (
    <section className="py-16 lg:py-20 border-t border-white/5">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Main SEO Heading */}
          <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-6 tracking-tight">
            Taşınabilir Güç Kaynağı ve Solar Panel Çözümleri
          </h2>

          <div className="space-y-4 text-foreground/60 text-sm lg:text-base leading-relaxed">
            <p>
              <strong className="text-foreground/80">FusionMarkt</strong>, Türkiye&apos;nin güvenilir{" "}
              <strong className="text-foreground/80">taşınabilir güç kaynağı</strong> ve{" "}
              <strong className="text-foreground/80">solar panel</strong> marketi olarak,
              kamp, karavan, açık hava etkinlikleri ve acil durum senaryoları için profesyonel enerji 
              çözümleri sunmaktadır. LiFePO4 batarya teknolojisi ile üretilen{" "}
              <strong className="text-foreground/80">portable power station</strong> modellerimiz,
              uzun ömür ve yüksek güvenlik standardı sağlar.
            </p>

            <p>
              <Link href="/marka/ieetek" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                IEETek
              </Link>{" "}
              yetkili distribütörü olarak sunduğumuz{" "}
              <strong className="text-foreground/80">güç istasyonları</strong>, 256Wh&apos;den 
              6kWh&apos;e kadar geniş kapasite seçenekleriyle her ihtiyaca cevap verir. 
              Katlanır{" "}
              <strong className="text-foreground/80">güneş paneli</strong> setlerimiz ile birlikte kullanarak 
              tamamen off-grid, bağımsız bir enerji sistemi oluşturabilirsiniz.
            </p>

            <p>
              Ürün yelpazemiz sadece enerji çözümleriyle sınırlı değildir.{" "}
              <Link href="/marka/telesteps" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Telesteps
              </Link>{" "}
              marka <strong className="text-foreground/80">yalıtkan merdivenler</strong> ile elektrik 
              sektöründe güvenli çalışma imkanı,{" "}
              <Link href="/marka/traffi" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Traffi
              </Link>{" "}
              marka <strong className="text-foreground/80">iş güvenliği eldivenleri</strong> ile 
              EN 388 sertifikalı profesyonel koruma sağlıyoruz.
            </p>

            <p>
              Tüm ürünlerimiz <strong className="text-foreground/80">2 yıl garanti</strong>,{" "}
              <strong className="text-foreground/80">ücretsiz kargo</strong> ve 14 gün koşulsuz iade 
              hakkı ile gönderilmektedir. Hangi güç kaynağının size uygun olduğunu bulmak için{" "}
              <Link href="/guc-hesaplayici" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Güç Hesaplayıcı
              </Link>{" "}
              aracımızı kullanabilir, sorularınız için{" "}
              <Link href="/sikca-sorulan-sorular" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                SSS
              </Link>{" "}
              sayfamızı ziyaret edebilirsiniz.
            </p>
          </div>

          {/* Quick links for internal linking */}
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { label: "Taşınabilir Güç Kaynakları", href: "/kategori/tasinabilir-guc-kaynaklari" },
              { label: "Solar Panel", href: "/kategori/solar-panel" },
              { label: "Paket Setler", href: "/kategori/bundle-paket-urunler" },
              { label: "Yalıtkan Merdivenler", href: "/kategori/yalitkan-merdiven" },
              { label: "İş Güvenliği Eldivenleri", href: "/kategori/is-guvenligi-eldiveni" },
              { label: "Aksesuarlar", href: "/kategori/aksesuarlar" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-xs lg:text-sm rounded-full border border-white/10 text-foreground/50 hover:text-foreground hover:border-white/20 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
