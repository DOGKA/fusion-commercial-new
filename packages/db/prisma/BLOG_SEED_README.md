# Blog Seed Çalıştırma Talimatları

52 adet SEO odaklı Türkçe blog yazısı seed dosyalarına bölünmüştür: `01–10` ikişerli, `11–13` dörderli, `14` yirmili (içerik `seed-blog-14-data/` klasöründe). `01–13` tekrar çalıştırılırsa içerik `upsert` ile güncellenir (mevcut kayıtlar silinmez, içerik ve meta güncellenir). `14` yalnızca ekleme yapar; aynı slug'lı yazı varsa ona dokunmaz.

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

### Dörderli Seed'ler (11–13)

| # | Dosya | Yazılar |
|---|---|---|
| 11 | `seed-blog-11.ts` | BMS Nedir? · Kombi Power Station'da Neden Çalışmıyor? · Şarj Neden Erken Bitiyor? · CE/UN38.3/MSDS/FCC Sertifikaları |
| 12 | `seed-blog-12.ts` | Su Pompası ve Hidrofor Kaç Watt? · Jump Starter ve Akü Takviyesi · Ofis ve Küçük İşletmede Kesinti · Kesintide Buzdolabı Gıda Güvenliği |
| 13 | `seed-blog-13.ts` | Güneş Paneli Temizliği · Eğim Açısı ve Yön · Sera ve Tarım Sulaması İçin Solar · Taşınabilir Enerji Terimleri Sözlüğü |

### Seed 14 — 2026 SEO + GEO Serisi (20 yazı)

Çalıştırıcı `seed-blog-14.ts`; içerikler `seed-blog-14-data/yazilar-a.ts … yazilar-j.ts` dosyalarında, ortak tip `seed-blog-14-data/tip.ts`. Varsayılan kuru çalışmadır; `--apply` ile yalnızca veritabanında olmayan slug'lar `create` edilir (mevcut yazılar güncellenmez). `publishedAt` her yazı için sabit bir tarihtir (2–21 Ekim 2026), `viewCount` 0, `featuredImage` `null` (kapaklar `nextadmin-nextjs-pro-v2-main/scripts/blog-kapak-uret.ts` ile üretilir).

| Dosya | Yazılar |
|---|---|
| `yazilar-a.ts` | Solar Paket Seçimi 2026 · Solar Jeneratör Nedir? · Ev Tipi Enerji Depolama (10 kWh) |
| `yazilar-b.ts` | Panel ↔ Power Station Uyumluluğu ve Solar Şarj Süresi · Taşınabilir Panel mi Çatı Paneli mi? |
| `yazilar-c.ts` | Karavan Buzdolabı Kaç Gün Gider? · Araç Çakmaklığından Şarj |
| `yazilar-d.ts` | Planlı Elektrik Kesintisi Sorgulama · Oksijen Konsantratörü |
| `yazilar-e.ts` | P3200 mü SH4000 mü? · Güneş Paneli Kaç Yılda Amorti Eder? |
| `yazilar-f.ts` | Arıcılar İçin Güneş Paneli · Bungalov ve Glamping Tesisi |
| `yazilar-g.ts` | Bahçe Aletleri / Çim Biçme · Uzatma Kablosu ve Grup Priz |
| `yazilar-h.ts` | Airfryer, Kettle ve Kahve Makinesi · PlayStation ve Oyun Bilgisayarı |
| `yazilar-i.ts` | Elektrikli Scooter ve Bisiklet Şarjı · Akvaryum Elektrik Kesintisi |
| `yazilar-j.ts` | Bebekli Evde Elektrik Kesintisi |

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
npx tsx prisma/seed-blog-11.ts
npx tsx prisma/seed-blog-12.ts
npx tsx prisma/seed-blog-13.ts
npx tsx prisma/seed-blog-14.ts           # kuru çalışma
npx tsx prisma/seed-blog-14.ts --apply   # ekle
```

`DATABASE_URL` ortamda tanımlı değilse admin uygulamasının env dosyası kullanılabilir:

```bash
cd packages/db
node --env-file=../../nextadmin-nextjs-pro-v2-main/.env.local --import tsx prisma/seed-blog-14.ts --apply
```

### Hepsi Sırayla

```bash
cd packages/db
for i in 01 02 03 04 05 06 07 08 09 10 11 12 13; do npx tsx prisma/seed-blog-$i.ts; done
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
/blog/bms-nedir-batarya-yonetim-sistemi-korumalari
/blog/kombi-power-station-ile-calismiyor-faz-notr-topraklama
/blog/guc-istasyonu-sarji-neden-erken-bitiyor
/blog/batarya-sertifikalari-ce-un38-3-msds-fcc-nedir
/blog/su-pompasi-hidrofor-icin-kac-watt-guc-kaynagi-gerekir
/blog/jump-starter-nedir-power-station-ile-aku-takviyesi
/blog/ofis-kucuk-isletme-elektrik-kesintisi-yedek-guc
/blog/elektrik-kesintisinde-buzdolabi-gida-guvenligi-kac-saat
/blog/gunes-paneli-temizligi-verim-artisi-nasil-temizlenir
/blog/gunes-paneli-egim-acisi-ve-yon-nasil-ayarlanir
/blog/sera-tarim-sulama-solar-enerji-sistemi-kurulumu
/blog/tasinabilir-enerji-terimleri-sozlugu
/blog/solar-paket-secimi-2026-hangi-solar-paket
/blog/solar-jenerator-nedir-gunes-enerjili-jenerator
/blog/ev-tipi-enerji-depolama-sistemi-10-kwh-ev-bataryasi
/blog/p3200-mu-sh4000-mu-ev-yedek-guc-karsilastirma
/blog/tasinabilir-solar-sistem-geri-odeme-suresi-hesaplama
/blog/gunes-paneli-guc-kaynagi-uyumluluk-solar-sarj-suresi
/blog/tasinabilir-gunes-paneli-mi-cati-gunes-paneli-mi
/blog/aricilar-icin-gunes-paneli-ve-tasinabilir-enerji
/blog/bungalov-glamping-tesisi-icin-solar-enerji
/blog/bahce-aletleri-cim-bicme-power-station-ile-calisir-mi
/blog/karavan-buzdolabi-12v-power-station-kac-gun-gider
/blog/karavanda-yolda-sarj-arac-sarji-ile-power-station
/blog/airfryer-kettle-power-station-ile-calisir-mi
/blog/oyun-bilgisayari-playstation-power-station-kac-saat
/blog/elektrikli-scooter-bisiklet-power-station-ile-sarj
/blog/planli-elektrik-kesintisi-sorgulama-ve-hazirlik
/blog/oksijen-konsantratoru-power-station-ile-calisir-mi
/blog/bebekli-evde-elektrik-kesintisi-guc-kaynagi
/blog/akvaryum-elektrik-kesintisi-hava-motoru-yedek-guc
/blog/power-station-uzatma-kablosu-grup-priz-kullanimi
```

## İç Linkler (Blog Yazılarında Kullanılan URL'ler)

Seed yazılırken kullanılan tüm iç linkler mevcut rotalara işaret eder:

- Ürün: Tam SEO slug'ları kullanılır (kısaltma değil). Güncel liste için [products-reference.md](./products-reference.md) dosyasına bakın.
- Landing: `/sh4000` (standalone)
- Kategori: `/kategori/tasinabilir-guc-kaynaklari`, `/kategori/gunes-panelleri`, `/kategori/bundle-paket-urunler` (solar paketler)
- Araç: `/guc-hesaplayici`
- Blog cross-link'ler (aynı seed paketi içinde birbirine atıfta bulunur)
- `/iletisim`, `/magaza`
- Dış kaynaklar: GEPA, MGM, PVGIS, EPDK, IEC, UL, IATA, NFPA ve ABD Enerji Bakanlığı gibi otorite kaynakları

## Yeni Yazı Standardı (06–14)

- Medium benzeri doğal akış ve kısa paragraflar
- Jenerik `Sonuç` başlığı kullanılmaz; son bölüm konuya özgü başlıkla doğal CTA'ya bağlanır
- Her yazıda ilgili ürün, kategori, araç ve diğer bloglara iç linkler bulunur
- Her yazıda en az bir güvenilir dış kaynak bulunur
- İçerik Türkçe HTML olarak saklanır; tablo, liste, hızlı cevap kutusu ve SSS kullanılabilir
- 11–13 arası yazılarda başlıklar arama/asistan sorgusuna yakın soru formunda kurgulanmıştır
- Elektrik tesisatı, kombi ve pompa gibi riskli konularda uygulama talimatı verilmez; okuyucu yetkili servis/elektrikçiye yönlendirilir
- 14'te her yazı girişten hemen sonra `<blockquote><p><strong>Kısa cevap:</strong> …</p></blockquote>` kutusu, en az bir tablo, 0,85 verimle Wh/W hesapları ve en sonda `<h2>Sık Sorulan Sorular</h2>` (5–7 soru) içerir; fiyat yalnızca paket seçimi ve geri ödeme yazılarında "Ekim 2026 itibarıyla" notuyla geçer

## Cross-Link Doğrulaması

Yeni seed yazarken `/blog/...` linklerinin gerçekten var olan slug'lara işaret ettiğini doğrulayın. Mevcut slug'lar iki yerde tanımlıdır: `packages/db/prisma/seed-blog-*.ts` ve `scripts/seed-blogs*.ts`.

```bash
cd /path/to/fusion-commercial
rg -oN 'href="/blog/[^"]+"' packages/db/prisma/seed-blog-1[123].ts packages/db/prisma/seed-blog-14-data/*.ts \
  | sed 's|.*href="/blog/||;s/"$//' | sort -u \
  | while read s; do rg -q "\"$s\"" scripts/seed-blogs*.ts packages/db/prisma/seed-blog-*.ts packages/db/prisma/seed-blog-14-data/*.ts || echo "MISSING: $s"; done
```

Yeni bir ürün sayfası veya kategori slug'u değişirse ilgili `content` string'lerini güncelleyip seed'i yeniden çalıştırın — `upsert` mevcut yazıları yeniler.
