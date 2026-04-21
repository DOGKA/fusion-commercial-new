# Blog Seed — Ürün Referans Sayfası

Bu dosya `seed-blog-01.ts` … `seed-blog-05.ts` blog seed script'lerinin kullanacağı **otoriter ürün verilerini** tek yerde toplar. Rakamlar doğrudan `packages/db/scripts/add-technical-specs.ts` ve `packages/db/prisma/seed-compare.ts` dosyalarından, yani site içinde gösterilen datasheet değerleriyle birebir uyumlu olarak alınmıştır. Herhangi bir değer yanlış/eksik ise önce burayı düzelt, sonra seed'ler yazılacak — seed'lerde bu tablodaki rakamlar kullanılacak.

> Not: Ana sayfa kartlarındaki Wh değerleri (ör. P800 "768Wh") pazarlama yuvarlaması/invertör üzerinden ölçümdür. Blog yazılarında **datasheet Wh'ı** kullanacağız (P800 = 512Wh).

---

## 1) Taşınabilir Güç Kaynakları (Power Stations)

### P800 — Giriş Segmenti
- **URL:** `/urun/p800`
- **Batarya:** 512Wh, LiFePO4, 25.6V, 4000+ döngü (@25°C, 0.5C, DOD80%)
- **AC Çıkış:** 800W sürekli, **1200W Smart-Boost**, 220/230/240V, 50/60Hz, saf sinüs
- **Şarj:** AC 600W (~1.2 sa), Araç 120W, Max Solar 300W, 3-4 sa solar ile tam şarj
- **Portlar:** 2× AC, 3× USB-C, 2× USB-A, 1× araç çıkışı
- **Fiziksel:** 299×191×196 mm, **6.55 kg**, IP20, <60 dB
- **UPS/EPS:** Evet (anlık geçiş) • Dahili LED fener: Evet
- **Kullanım:** Günübirlik kamp, modem+laptop+telefon+aydınlatma, CPAP 1 gece
- **Kutu içeriği:** Güç Kaynağı, AC Şarj Kablosu, Araç Şarj Kablosu, XT60→MC4 Dönüştürücü Kablo, 3 Modlu LED El Feneri, 4in1 Kablo, Kullanım Kılavuzu

### P1800 — Hafta Sonu / Hafif Ev Yedekleme
- **URL:** `/urun/p1800`
- **Batarya:** 1024Wh, LiFePO4, 51.2V, 4000+ döngü
- **AC Çıkış:** 1800W sürekli, **3600W pik**, 220/230/240V, 50/60Hz
- **Şarj:** AC 1200W (~1.2 sa), Araç 120W, Max Solar 500W (10–52V)
- **Portlar:** 2× AC, 2× USB-C (C1=100W PD), 3× USB-A 30W, 1× araç 13.2V/10A
- **Fiziksel:** 361.5×269.5×232.6 mm, **12.7 kg**, IP20, <65 dB
- **UPS/EPS:** Evet (10 ms) • Wi-Fi/Bluetooth uygulama
- **Kullanım:** Hafta sonu kamp/karavan, ev kısmi yedekleme (modem + buzdolabı + aydınlatma), elektrikli alet
- **Verimlilik:** Batarya→AC %99, AC→Batarya %99

### Singo 2000 Pro — Outdoor Orta Segment
- **URL:** `/urun/singo-2000-pro`
- **Batarya:** 1920Wh, LiFePO4, 48V, 4000+ döngü
- **AC Çıkış:** 2000W sürekli, 4000W pik, 4× AC priz
- **Şarj:** AC 1500W (~1.5 sa), Araç 120W, Max Solar 500W
- **Portlar:** 4× AC, 2× USB-C 100W, 3× USB-A (12W + 2× QC3.0 18W), **10W kablosuz şarj**, araç 132W
- **Fiziksel:** 355×347×226 mm, **20.5 kg**, IP20, <65 dB
- **Wi-Fi** (yalnız) uygulama kontrolü

### P3200 — Flagship / Ev Yedekleme
- **URL:** `/urun/p3200`
- **Batarya:** 2048Wh, LiFePO4, 51.2V, 4000+ döngü
- **AC Çıkış:** 3200W sürekli, **6400W pik**, 4× AC priz
- **Şarj:** AC 1800W (~1.5 sa), **Max Solar 1000W** (12–80V, 2–3 sa solar ile tam şarj), Araç 120W
- **Portlar:** 4× AC, 4× USB-C (C1/C2=100W PD, C3/C4=30W), 4× USB-A 30W, araç 13.2V/10A
- **Fiziksel:** 445×298×371 mm, **24.35 kg**, IP20, <65 dB
- **Özellik:** Dahili powerbank + jump-starter + fener, Wi-Fi/Bluetooth
- **Kullanım:** Buzdolabı + klima (inverter) + kombi pompası + modem — ev kısa-orta süreli kesinti, karavan kalıcı

### SH4000 — Hibrid Ev Enerji Sistemi
- **URL:** `/sh4000` (standalone landing — `/urun/sh4000` değil)
- **Batarya:** 5120Wh, LiFePO4, 51.2V, 4000+ döngü (genişletilebilir, B5120 modüllerle)
- **AC Çıkış:** **4000W sürekli, 8000W pik**, 220/230/240V, 50Hz
- **Şarj:**
  - HV Solar (MC4): 3000W, 70–450V, 16A
  - LV Solar (XT60): 600W, 12–50V
  - AC: 3600W, 180–270V
- **Portlar:** 2× USB-C 100W, XT60 DC çıkışı (12V/30A, 24V/25A, 36V/20A)
- **Fiziksel:** 510×673×266 mm, **65 kg**, **IP54** (IP65 opsiyonel), **<40 dB**
- **Özellik:** Hibrid invertör, ATS uyumlu, duvara monte kurulum, Wi-Fi/Bluetooth
- **Kullanım:** Tam ev yedekleme, off-grid, yazlık/bağ evi enerji sistemi

### TG1290 — Ara Segment
- **URL:** `/urun/tg1290`
- **Pazarlama sayfasından:** 1290Wh / 1200W, LiFePO4

### B5120 — Genişletme Bataryası
- **URL:** `/urun/b5120`
- **Pazarlama sayfasından:** 5120Wh, LiFePO4 modüler batarya (SH4000 ile uyumlu)

---

## 2) Taşınabilir Güneş Panelleri

### SP100 — Küçük / Balkon / Acil Çanta
- **URL:** `/urun/sp100`
- **Güç:** 100W Max (25W × 4), Monokristal silikon
- **Elektriksel:** 18V / 5.6A, **Voc 21.6V**, Isc 6.16A
- **Verimlilik:** %21–23 dönüşüm
- **Fiziksel:** IP67, 4 katlı, katlı 387×609×30 mm / açık 1250×609×10 mm, **5 kg**
- **Çalışma sıcaklığı:** −20°C ~ +70°C
- **Kullanım:** P800 şarjı, küçük kamp, balkon solar desteği

### SP200 — Orta / Karavan
- **URL:** `/urun/sp200`
- **Güç:** 200W Max (50W × 4)
- **Elektriksel:** 24V / 8.33A, **Voc 28.8V**, Isc 9.12A
- **Verimlilik:** %21–23
- **Fiziksel:** IP67, 4 katlı, katlı 610×608×45 mm / açık 2074×608×30 mm, **8 kg**
- **Kullanım:** P1800/Singo karavan/kamp kurulumu

### SP400 — Büyük / Off-Grid
- **URL:** `/urun/sp400`
- **Güç:** 400W Max (100W × 4)
- **Elektriksel:** 44V / 10A, **Voc 52.8V**, Isc 10A
- **Verimlilik:** %21–23
- **Fiziksel:** IP67, 4 katlı, katlı 725×990×45 mm / açık 2617×990×30 mm, **16.3 kg**
- **Kullanım:** P3200 hızlı solar şarj, SH4000 LV solar girişi, yazlık/bağ evi

---

## 3) Kategori ve Araç URL'leri (İç Link Haritası)

| Amaç | URL |
|---|---|
| Tüm taşınabilir güç kaynakları | `/kategori/tasinabilir-guc-kaynaklari` |
| Taşınabilir güneş panelleri | `/kategori/gunes-panelleri` |
| Güç hesaplayıcı (en önemli CTA) | `/guc-hesaplayici` |
| Karşılaştırma sayfası | `/karsilastir` (varsa) |
| Ev enerji sistemi landing | `/sh4000` |
| Blog ana sayfa | `/blog` |

---

## 4) Cihaz Güç Tüketimi Referansı (Blog tabloları için)

| Cihaz | Tipik Güç | Gerçek Kullanım (ort.) | 512Wh (P800) | 1024Wh (P1800) | 2048Wh (P3200) | 5120Wh (SH4000) |
|---|---|---|---|---|---|---|
| Modem/Router | 10–15W | 12W | ~40 sa | ~80 sa | ~160 sa | ~400 sa |
| Dizüstü bilgisayar | 45–65W | 55W | ~9 sa | ~18 sa | ~36 sa | ~90 sa |
| LED TV (42") | 60–80W | 70W | ~7 sa | ~14 sa | ~28 sa | ~70 sa |
| CPAP cihazı (ısıtıcı kapalı) | 30–40W | 35W | ~14 sa | ~28 sa | ~55 sa | ~140 sa |
| Mini buzdolabı | 60W (döngüsel ~30W ort.) | 30W ort. | ~16 sa | ~32 sa | ~65 sa | ~160 sa |
| Ev buzdolabı (A++) | 150W pik / ~60W ort. | 60W | ~8 sa | ~16 sa | ~32 sa | ~80 sa |
| Kombi (sadece pompa+brülör, doğalgaz yakıyor) | 80–120W | 100W | ~4-5 sa | ~9 sa | ~18 sa | ~45 sa |
| Kombi (elektrikli ısıtıcılı) | 1500–2000W | — | ÇALIŞMAZ* | ~30 dk | ~1 sa | ~2.5 sa |
| LED aydınlatma (oda) | 10–20W | 15W | ~33 sa | ~65 sa | ~130 sa | ~330 sa |
| Elektrikli battaniye | 60–100W | 80W | ~6 sa | ~12 sa | ~25 sa | ~60 sa |
| Telefon şarjı (full) | 20W | — | ~50 şarj | ~100 şarj | ~200 şarj | ~500 şarj |
| Klima (9000 BTU inverter) | 700–900W sürekli (2000W pik) | 800W | ÇALIŞMAZ* | ~1 sa | ~2.5 sa | ~6 sa |
| Klima (12000 BTU) | 1100–1400W | 1200W | ÇALIŞMAZ* | ~45 dk | ~1.5 sa | ~4 sa |
| Mikrodalga (800W nominal) | 1100–1300W çekim | — | ÇALIŞMAZ* | sadece puls | kısa | kısa/orta |

> `*` = P800'ün 800W sürekli / 1200W Smart-Boost limiti aşılır, cihaz başlamaz veya koruma devreye girer.
> Hesap formülü: `Süre (sa) ≈ Kapasite(Wh) × 0.9 ÷ Cihaz Ortalama Gücü(W)` (%10 invertör kaybı dahil).

---

## 5) Blog Kapsamına Göre İlişki Matrisi

| Blog # | Ana Ürünler (iç link) | Destek Linkler |
|---|---|---|
| 01 — Ev için kaç saat çalışır | P800, P1800, P3200 | `/guc-hesaplayici`, `/kategori/tasinabilir-guc-kaynaklari` |
| 02 — Yorumları: P800/P1800/P3200 | P800, P1800, P3200 | `/guc-hesaplayici` |
| 03 — Fiyatlar 2026 Kapasite | P800, P1800, P3200, SH4000 | `/kategori/tasinabilir-guc-kaynaklari` |
| 04 — Solar Panel 100/200/400W | SP100, SP200, SP400 | P1800, P3200, `/kategori/gunes-panelleri` |
| 05 — Karavan: Power Station vs Solar Paket | P1800, P3200, SP200, SP400 | Singo 2000 Pro |
| 06 — Power Station Nedir / Jeneratör | P1800, P3200, SH4000 | `/kategori/tasinabilir-guc-kaynaklari` |
| 07 — UPS mi Power Station mı | P800, P1800, P3200 | SH4000 |
| 08 — Kaç Wh Gerekir (cihaz bazlı) | P800, P1800, P3200, SH4000 | `/guc-hesaplayici` |
| 09 — Klima Çalışır mı | P1800, P3200, SH4000 | — |
| 10 — Sessiz Jeneratör Alternatifi | P1800, P3200, SH4000 | `/kategori/tasinabilir-guc-kaynaklari` |

---

## 6) Seed Dosyası Davranışı (tüm seed'ler için ortak kurallar)

- `status: "PUBLISHED"`
- `authorName: "FusionMarkt"`
- `publishedAt: new Date()` (seed çalışınca o an yayınlanır)
- `featuredImage: null` (typography-first blog kart tasarımı)
- `upsert` mantığı: slug zaten varsa içerik ve meta güncellenir (güvenli tekrar çalıştırma)
- Kategori: her bloğun başında belirtilen (`Rehber` / `Karşılaştırma` / `Solar` / `Karavan` / `Taşınabilir Enerji`)
- Tüm içerik Türkçe HTML; `<h2>`, `<h3>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<blockquote>`, `<table>`, `<tr>`, `<th>`, `<td>`, `<a href="...">` kullanılacak
- Her blogda en az: 1 problem paragrafı + 1 Hızlı Cevap kutusu (blockquote) + 1 karşılaştırma tablosu + senaryo örneği + model önerisi listesi + 3–4 SSS (h3+p) + 1 güç hesaplayıcı CTA

---

**Onay sonrası yazılacak seed dosyaları:**
1. `seed-blog-01.ts` — Ev kaç saat çalışır + P800/P1800/P3200 yorumları
2. `seed-blog-02.ts` — Fiyatlar 2026 Kapasite Rehberi + SP100/200/400 seçimi
3. `seed-blog-03.ts` — Karavan PS vs Solar paket + Power Station Nedir / Jeneratör farkı
4. `seed-blog-04.ts` — UPS mi Power Station mı + Kaç Wh gerekir (cihaz bazlı)
5. `seed-blog-05.ts` — Power Station ile klima + Sessiz jeneratör alternatifi

Çalıştırma (server veya lokal):
```bash
cd packages/db
npx tsx prisma/seed-blog-01.ts
npx tsx prisma/seed-blog-02.ts
npx tsx prisma/seed-blog-03.ts
npx tsx prisma/seed-blog-04.ts
npx tsx prisma/seed-blog-05.ts
```
