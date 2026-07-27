# Blog Seed Çalıştırma Talimatları

20 adet SEO odaklı Türkçe blog yazısı, 2'şerli 10 seed dosyasına bölünmüştür. Her seed bağımsız çalışır; tekrar çalıştırılırsa içerik `upsert` ile güncellenir (mevcut kayıtlar silinmez, içerik ve meta güncellenir).

## Ürün Referansı

Blog yazıları yazılırken kullanılan otoriter ürün verileri:

- [products-reference.md](./products-reference.md)

## Dosyalar ve Kapsadığı Yazılar

| # | Dosya | Blog 1 | Blog 2 |
|---|---|---|---|
| 01 | `seed-blog-01.ts` | Ev İçin Taşınabilir Güç Kaynağı: Kaç Saat Çalışır? | P800, P1800, P3200 Yorumları (Kime Uygun?) |
| 02 | `seed-blog-02.ts` | Taşınabilir Güç Kaynağı Fiyatları 2026: Kapasite Rehberi | Taşınabilir Güneş Paneli Seçimi: 100W vs 200W vs 400W |
| 03 | `seed-blog-03.ts` | Karavan İçin Power Station mı Solar Paket mi? | Power Station Nedir? Jeneratörden Farkı Nedir? |
| 04 | `seed-blog-04.ts` | UPS mi Power Station mı? | Elektrik Kesintisinde Hangi Cihaz İçin Kaç Wh Gerekir? |
| 05 | `seed-blog-05.ts` | Power Station ile Klima Çalışır mı? | Sessiz Jeneratör Alternatifi: Power Station Rehberi |
| 06 | `seed-blog-06.ts` | Monokristal, Polikristal ve Esnek Panel Farkı | Türkiye'de Güneş Paneli Günde Kaç Saat Üretir? |
| 07 | `seed-blog-07.ts` | Balkonda Güneş Paneli | Üç Zamanlı Tarife ile Power Station |
| 08 | `seed-blog-08.ts` | Gerçek Kullanılabilir Kapasite | 4000 Döngü Ne Demek? |
| 09 | `seed-blog-09.ts` | Jackery, EcoFlow, Bluetti, Anker ve IEETek | Lityum Batarya Yangın Riski |
| 10 | `seed-blog-10.ts` | Hibrit İnvertör ve ATS | Solar Kablo ve Konnektör Rehberi |

## Çalıştırma

### Tek Tek

```bash
cd packages/db
npx tsx prisma/seed-blog-01.ts
npx tsx prisma/seed-blog-02.ts
npx tsx prisma/seed-blog-03.ts
npx tsx prisma/seed-blog-04.ts
npx tsx prisma/seed-blog-05.ts
npx tsx prisma/seed-blog-06.ts
npx tsx prisma/seed-blog-07.ts
npx tsx prisma/seed-blog-08.ts
npx tsx prisma/seed-blog-09.ts
npx tsx prisma/seed-blog-10.ts
```

### Hepsi Sırayla

```bash
cd packages/db
for i in 01 02 03 04 05 06 07 08 09 10; do npx tsx prisma/seed-blog-$i.ts; done
```

### Server'da (Production)

Aynı komutlar server'da da çalışır. DB bağlantısı için ortam değişkenlerinin (`DATABASE_URL`) doğru tanımlı olduğundan emin olun.

```bash
ssh <server>
cd /path/to/fusion-commercial/packages/db
DATABASE_URL="postgresql://..." npx tsx prisma/seed-blog-01.ts
# ... diğer seed'ler
```

## Davranış Detayları

- **Status:** `PUBLISHED` — seed çalıştırıldığı an yayına girer.
- **publishedAt:** İlk yayın tarihi, ilk `create` anında set edilir. `update` çağrılarında değişmez; yalnızca içerik/meta güncellenir.
- **Upsert:** Slug'a göre `findUnique` + `create or update`. Aynı seed defalarca çalıştırılabilir.
- **authorName:** `FusionMarkt`
- **featuredImage:** `null` (typography-first blog kart tasarımı görsel kullanmıyor)

## Slug Listesi (SEO için)

```
/blog/ev-icin-tasinabilir-guc-kaynagi-kac-saat-calisir
/blog/tasinabilir-guc-kaynagi-yorumlari-p800-p1800-p3200
/blog/tasinabilir-guc-kaynagi-fiyatlari-2026-kapasite-rehberi
/blog/tasinabilir-gunes-paneli-secimi-100w-200w-400w
/blog/karavan-icin-power-station-mi-solar-paket-mi
/blog/power-station-nedir-jenerator-farki
/blog/ups-mi-power-station-mi
/blog/elektrik-kesintisinde-kac-wh-gerekir
/blog/power-station-ile-klima-calisir-mi
/blog/sessiz-jenerator-alternatifi-power-station
/blog/gunes-paneli-monokristal-polikristal-esnek-fark
/blog/turkiye-il-il-gunes-paneli-verimli-gunes-saati
/blog/balkonda-gunes-paneli-apartman-solar-kurulum
/blog/uc-zamanli-tarife-power-station-elektrik-tasarrufu
/blog/gercek-kullanilabilir-kapasite-wh-verim-kayiplari
/blog/4000-dongu-ne-demek-power-station-kac-yil-dayanir
/blog/jackery-ecoflow-bluetti-anker-ieetek-karsilastirma
/blog/lityum-batarya-yangin-riski-lifepo4-guvenlik
/blog/hibrit-invertor-ats-nedir-ev-panosu-baglanti
/blog/solar-kablo-konnektor-mc4-xt60-anderson-kesit-hesabi
```

## İç Linkler (Blog Yazılarında Kullanılan URL'ler)

Seed yazılırken kullanılan tüm iç linkler mevcut rotalara işaret eder:

- Ürün: `/urun/p800`, `/urun/p1800`, `/urun/p3200`, `/urun/sp100`, `/urun/sp200`, `/urun/sp400`, `/urun/singo-2000-pro`
- Landing: `/sh4000` (standalone)
- Kategori: `/kategori/tasinabilir-guc-kaynaklari`, `/kategori/gunes-panelleri`
- Araç: `/guc-hesaplayici`
- Blog cross-link'ler (aynı seed paketi içinde birbirine atıfta bulunur)
- `/iletisim`, `/magaza`
- Dış kaynaklar: GEPA, MGM, PVGIS, EPDK, IEC, UL, IATA, NFPA ve ABD Enerji Bakanlığı gibi otorite kaynakları

## Yeni Yazı Standardı (06–10)

- Medium benzeri doğal akış ve kısa paragraflar
- Jenerik `Sonuç` başlığı kullanılmaz; son bölüm konuya özgü başlıkla doğal CTA'ya bağlanır
- Her yazıda ilgili ürün, kategori, araç ve diğer bloglara iç linkler bulunur
- Her yazıda en az bir güvenilir dış kaynak bulunur
- İçerik Türkçe HTML olarak saklanır; tablo, liste, hızlı cevap kutusu ve SSS kullanılabilir

Yeni bir ürün sayfası veya kategori slug'u değişirse ilgili `content` string'lerini güncelleyip seed'i yeniden çalıştırın — `upsert` mevcut yazıları yeniler.
