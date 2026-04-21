# Blog Seed Çalıştırma Talimatları

10 adet SEO odaklı Türkçe blog yazısı, 2'şerli 5 seed dosyasına bölünmüştür. Her seed bağımsız çalışır; tekrar çalıştırılırsa içerik `upsert` ile güncellenir (mevcut kayıtlar silinmez, içerik ve meta güncellenir).

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

## Çalıştırma

### Tek Tek

```bash
cd packages/db
npx tsx prisma/seed-blog-01.ts
npx tsx prisma/seed-blog-02.ts
npx tsx prisma/seed-blog-03.ts
npx tsx prisma/seed-blog-04.ts
npx tsx prisma/seed-blog-05.ts
```

### Hepsi Sırayla

```bash
cd packages/db
for i in 01 02 03 04 05; do npx tsx prisma/seed-blog-$i.ts; done
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
```

## İç Linkler (Blog Yazılarında Kullanılan URL'ler)

Seed yazılırken kullanılan tüm iç linkler mevcut rotalara işaret eder:

- Ürün: `/urun/p800`, `/urun/p1800`, `/urun/p3200`, `/urun/sp100`, `/urun/sp200`, `/urun/sp400`, `/urun/singo-2000-pro`
- Landing: `/sh4000` (standalone)
- Kategori: `/kategori/tasinabilir-guc-kaynaklari`, `/kategori/gunes-panelleri`
- Araç: `/guc-hesaplayici`
- Blog cross-link'ler (aynı seed paketi içinde birbirine atıfta bulunur)
- `/iletisim`, `/magaza`

Yeni bir ürün sayfası veya kategori slug'u değişirse ilgili `content` string'lerini güncelleyip seed'i yeniden çalıştırın — `upsert` mevcut yazıları yeniler.
