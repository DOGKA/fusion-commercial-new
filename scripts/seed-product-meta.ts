/**
 * Product SEO Meta Seed
 * Guncelleme: 2026-03-17T09:42:51.643Z
 * Kullanim: npx tsx scripts/seed-product-meta.ts
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const products = [
  {
    "slug": "tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200",
    "metaTitle": "SP200 - 200W Katlanabilir Güneş Paneli",
    "metaDescription": "200W gücünde, IP67 su geçirmez ve %23 verimlilikle taşınabilir güneş paneli. Hafif ve katlanabilir tasarımıyla her yerde enerji sağlayın. Şimdi keşfedin!",
    "metaKeywords": [
      "taşınabilir güneş paneli",
      "katlanabilir güneş paneli",
      "200W güneş paneli",
      "IP67 güneş paneli",
      "monokristal güneş paneli"
    ],
    "shortDescription": "200W gücünde, IP67 su geçirmez ve %23 verimlilikle yüksek performans sunan katlanabilir güneş paneli."
  },
  {
    "slug": "td05-x-dura-grip-siyah-nitril-tek-kullanimlik-eldiven-50-li-kutu",
    "metaTitle": "TD05 X-DURA GRIP Siyah Nitril Tek Kullanımlık Eldiven 50'li ",
    "metaDescription": "TD05 X-DURA GRIP Siyah Nitril Tek Kullanımlık Eldiven, yağlı veya nemli ortamlarda mükemmel kavrama ve koruma sağlar. Elmas dokulu yüzeyi hava dolaşımını artıra",
    "metaKeywords": [],
    "shortDescription": "Yağlı ve nemli ortamlarda mükemmel kavrama sağlayan nitril eldiven. Gıda ve kimyasallara karşı dirençli, konforlu kullanım sunar."
  },
  {
    "slug": "tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400",
    "metaTitle": "SP400 - 400W Katlanabilir Güneş Paneli | IP67",
    "metaDescription": "400W monokristal güneş paneli ile yüksek verimlilik ve IP67 su geçirmezlik. Katlanabilir tasarım, kolay taşınabilirlik sunar. Şimdi keşfedin!",
    "metaKeywords": [
      "taşınabilir güneş paneli",
      "400W güneş paneli",
      "katlanabilir solar panel",
      "IP67 güneş paneli",
      "monokristal güneş paneli"
    ],
    "shortDescription": "SP400, 400W gücü ve IP67 su geçirmezliği ile yüksek verimlilik sunan katlanabilir bir güneş panelidir."
  },
  {
    "slug": "tg1072-cift-daldirma-kesim-seviyesi-a-guvenlik-eldiveni",
    "metaTitle": "TG1072 Çift Daldırma Kesim Seviyesi A Güvenlik Eldiveni",
    "metaDescription": "TG1072 Çift Daldırma Termal Nitril Eldiven, fırçalanmış akrilik astarı ve yüksek sıcak temas direnci ile kış koşulları için ideal bir seçenektir. Mükemmel kavra",
    "metaKeywords": [],
    "shortDescription": "Çift daldırma nitril eldiven, kış koşullarında konfor ve sıcaklık sunar. 250 °C'ye kadar sıcak temas direnci ile yüksek aşınma dayanıklılığı sağlar."
  },
  {
    "slug": "tg5895-su-gecirmez-lateks-nitril-kesim-seviyesi-d-guvenlik-eldiveni",
    "metaTitle": "TG5895 Su Geçirmez Lateks/Nitril Kesim Seviyesi D Güvenlik E",
    "metaDescription": "TG5895, su geçirmez lateks/nitril karışımlı Kesim Seviyesi D eldivenidir. Geniş daldırma kaplama bilekten konforlu ve güvenli uyum sağlarken ıslak ve yağlı madd",
    "metaKeywords": [],
    "shortDescription": "Su geçirmez ve yüksek kesilme direncine sahip bu eldiven, ıslak ve yağlı ortamlarda güvenli bir tutuş sağlar. Konforlu yapısıyla uzun süreli kullanıma uygundur."
  },
  {
    "slug": "3-8m-askeri-ve-taktik-amacli-tam-otomatik-teleskopik-merdiven-ts1600et-tactical",
    "metaTitle": "3.8M Askeri ve Taktik Amaçlı Tam Otomatik Teleskopik Merdive",
    "metaDescription": "Telescopics 3.8m Taktik Amaçlı Tam Otomatik Teleskopik Merdiven -ts1600et yorumlarını inceleyin, Fusion Markt'e özel indirimli fiyata satın alın.",
    "metaKeywords": [],
    "shortDescription": "Dayanıklı ve hafif tasarımıyla bu teleskopik merdiven, askeri ve taktik amaçlı kullanımlar için idealdir. Kolay taşınabilirliği ve hızlı açılma özelliğiyle her türlü zorlu koşulda güvenli bir erişim sağlar."
  },
  {
    "slug": "tg1140-microdex-ultra-nitrile-kesilme-seviyesi-a-is-eldiveni",
    "metaTitle": "TG1140 Microdex Ultra Nitrile Kesilme Seviyesi A İş Eldiveni",
    "metaDescription": null,
    "metaKeywords": [],
    "shortDescription": "Kesilme seviyesi A ile yüksek koruma sunan bu eldiven, esnek yapısıyla rahat bir kullanım sağlar. Islak, kuru ve yağlı yüzeylerde mükemmel kavrama yeteneği ile güvenli çalışmanızı destekler."
  },
  {
    "slug": "tm106-lateks-kaplamali-polipamuk-kesim-seviyesi-1-guvenlik-eldiveni",
    "metaTitle": "TM106 Lateks Kaplamalı Polipamuk Kesim Seviyesi 1 Güvenlik E",
    "metaDescription": "TM106, ıslak ve kuru koşullarda sert işlemler için Level 4 yırtılma direncine sahip lastik kaplamalı hafif bir iş eldivenidir. Dayanıklı tutuşu, yüksek yırtılma",
    "metaKeywords": [],
    "shortDescription": "Hafif yapısı ve yüksek yırtılma direnci ile güvenli bir kullanım sunan iş eldiveni, ıslak ve kuru koşullarda mükemmel kavrama sağlar. Sert işlemler için idealdir."
  },
  {
    "slug": "tm178-nitril-kaplamali-naylon-kesim-seviyesi-a-guvenlik-eldiveni",
    "metaTitle": "TM178 Nitril Kaplamalı Naylon Kesim Seviyesi A Güvenlik Eldi",
    "metaDescription": "M178, hafif nitril köpük kaplamalı iş eldiveni. Kuruluk, ıslaklık ve yağlı ortamlarda kullanım için uygun. Ergonomik tasarımı ve uzatılmış aşınma direnci ile ko",
    "metaKeywords": [],
    "shortDescription": "Hafif ve ergonomik tasarımıyla konfor sunan güvenlik eldiveni, yüksek kesilme direnci ve nefes alabilen kaplamasıyla cildinizi serin tutar. Islak ve yağlı ortamlarda güvenli bir kavrama sağlar."
  },
  {
    "slug": "td06-x-dura-grip-mavi-nitril-tek-kullanimlik-eldiven-50-li-kutu",
    "metaTitle": "TD06 X-DURA GRIP Mavi Nitril Tek Kullanımlık Eldiven 50'li k",
    "metaDescription": "Traffi TD01, biyobozunur nitril malzemeden üretilmiş, gıda güvenliği onaylı ve üstün konfor sağlayan tek kullanımlık bir eldivendir. Sağlık hizmetleri, gıda üre",
    "metaKeywords": [],
    "shortDescription": "Yağlı ve nemli ortamlarda mükemmel tutuş sağlayan nitril eldiven. Gıda ile temas için onaylı, kimyasallara dayanıklı ve konforlu bir kullanım sunar."
  },
  {
    "slug": "tg1290-dokunmatik-antistatik-a-seviye-kesilme-yirtilma-direncli-cok-amacli-is-eldiveni",
    "metaTitle": "TG1290 Dokunmatik Antistatik A Seviye Kesilme Yırtılma Diren",
    "metaDescription": "TG1290 antistatik iş eldiveni, dokunmatik uyumlu, A seviyesi kesilme koruması ve ATEX uyumluluğuyla profesyonel kullanım için idealdir.",
    "metaKeywords": [],
    "shortDescription": "Antistatik ve kesilmeye dayanıklı çok amaçlı iş eldiveni, hassas işlerde güvenli kullanım için idealdir. Yırtılmaya karşı direnci ile uzun ömürlü performans sunar."
  },
  {
    "slug": "tg5210-x-dura-metric-pu-kesilme-seviyesi-c-is-eldiveni",
    "metaTitle": "TG5210 X-DURA METRIC PU Kesilme Seviyesi  C İş Eldiveni",
    "metaDescription": "EN388:2016 standardına uygun Traffi TG5210 X-DURA METRIC PU Kesilme Direnci Eldiven, mükemmel tutuş ve yüksek yırtılma direnci ile güvenliğinizi sağlar.",
    "metaKeywords": [],
    "shortDescription": "Kesilme riski olan işler için ideal olan bu eldiven, hafif kesilme indeksi ile güvenlik sağlar. PU kaplama, kuru koşullarda mükemmel tutuş sunar."
  },
  {
    "slug": "10-cift-tg1290-dokunmatik-antistatik-a-seviye-kesilme-yirtilma-direncli-cok-amacli-is-eldiveni",
    "metaTitle": "10 ÇİFT TG1290 Dokunmatik Antistatik A Seviye Kesilme Yırtıl",
    "metaDescription": "TG1290 Dokunmatik ve Antistatik İş Eldiveni, A seviyesi kesilme koruması, ATEX uyumluluğu ve ultra hafif tasarımıyla elektronik montaj, otomasyon sistemleri ve ",
    "metaKeywords": [],
    "shortDescription": "Antistatik özellikleri ve A seviyesi kesilme direnciyle güvenli bir deneyim sunan çok amaçlı iş eldiveni. Yüksek hassasiyet gerektiren alanlarda ideal kullanım sağlar."
  },
  {
    "slug": "td07-x-dura-grip-turuncu-nitril-tek-kullanimlik-eldiven-50-li-kutu",
    "metaTitle": "TD07 X-DURA GRIP Turuncu Nitril Tek Kullanımlık Eldiven 50'l",
    "metaDescription": "Traffiglove TD07 X-DURA GRIP, turuncu nitril malzemeden üretilmiş dayanıklı ve kullanışlı bir tek kullanımlık eldivendir. Kimyasal direnç ve yüksek görünürlük s",
    "metaKeywords": [],
    "shortDescription": "Kalın yapısıyla artırılmış dayanıklılık sunan tek kullanımlık nitril eldiven, mükemmel kavrama sağlar. Gıda teması için onaylı ve kimyasallara karşı dirençlidir."
  },
  {
    "slug": "tg6240-microdex-lxt-nitrile-kesilme-seviyesi-e-is-eldiveni",
    "metaTitle": "TG6240 MicroDex LXT Nitrile Kesilme Seviyesi E İş Eldiveni",
    "metaDescription": "EN388:2016 ve ASTM ANSI standartlarına uygun Traffi TG6240 MicroDex LXT Nitrile Kesilme Direnci Eldiven, mükemmel tutuş, yüksek esneklik ve sıcak temas direnci ",
    "metaKeywords": [],
    "shortDescription": "Yüksek kesilme direnci ve konfor sunan endüstriyel iş eldiveni, ıslak, kuru ve yağlı koşullarda güvenli kullanım için idealdir. Uzun ömürlü tasarımıyla dayanıklılığı artırır."
  },
  {
    "slug": "tg1170-x-dura-flat-nitril-kesim-seviyesi-1-guvenlik-eldiveni",
    "metaTitle": "TG1170 X-Dura Flat Nitril Kesim Seviyesi 1 Güvenlik Eldiveni",
    "metaDescription": "TG1170 X-Dura Flat Nitril Eldiven, hafif yapılı, düz nitril avuç içi kaplamalı, yüksek konforlu astar ve uzun bilek boyuyla üretilmiştir. Kurutulmuş koşullarda ",
    "metaKeywords": [],
    "shortDescription": "Yüksek esneklik ve konfor sunan hafif eldiven, uzun süreli kullanımda dayanıklılık sağlar. Bol bilek tasarımıyla güvenli ve rahat bir kullanım deneyimi sunar."
  },
  {
    "slug": "512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800",
    "metaTitle": "IEETek P800 - 512Wh LiFePO4 Taşınabilir Güç Kaynağı",
    "metaDescription": "512Wh kapasite ve 1600W maksimum güç sunan IEETek P800, LiFePO4 bataryası ile uzun ömürlü kullanım sağlar. Hemen keşfedin!",
    "metaKeywords": [
      "P800",
      "LiFePO4",
      "taşınabilir güç kaynağı",
      "solar jeneratör",
      "IEETek"
    ],
    "shortDescription": "IEETek P800, 512Wh kapasite ve 1600W maksimum güç ile taşınabilir güç kaynağında üstün performans sunar."
  },
  {
    "slug": "3-8m-askeri-ve-taktik-amacli-tam-otomatik-teleskopik-merdiven-1600et-tactical",
    "metaTitle": "3.8M Askeri ve Taktik Amaçlı Tam Otomatik Teleskopik Merdive",
    "metaDescription": "3.8m Merdiven, Askeri ve Taktik Amaçlı Tam Otomatik Teleskopik Merdiven ile güvenli ve dayanıklı kullanım sağlayın. Uluslararası sertifikalı.",
    "metaKeywords": [],
    "shortDescription": "Dayanıklı ve hafif yapısıyla taşınması kolay olan bu teleskopik merdiven, 3.8 metreye kadar uzanarak yüksek alanlara erişim sağlar. Askeri ve taktik amaçlar için ideal bir çözümdür."
  },
  {
    "slug": "td01-karbon-notr-biyobozunur-nitril-tek-kullanimlik-eldiven-100-lu-kutu",
    "metaTitle": "TD01 Karbon Nötr Biyobozunur Nitril Tek Kullanımlık Eldiven ",
    "metaDescription": "Traffiglove TD01 sürdürülebilir, biyobozunur nitril malzemeden üretilmiş, gıda güvenliği onaylı ve üstün tutuş özellikleri sunan tek kullanımlık bir eldivendir.",
    "metaKeywords": [],
    "shortDescription": "Yüksek esneklik ve dayanıklılık sunan tek kullanımlık eldiven, gıda ile temas için uygundur. Biyobozunur yapısıyla çevre dostu bir seçimdir."
  },
  {
    "slug": "tg5545-darbe-emici-nitril-kopuk-kesim-seviyesi-e-guvenlik-eldiveni",
    "metaTitle": "TG5545 DARBE EMİCİ NİTRİL KÖPÜK Kesim Seviyesi E Güvenlik El",
    "metaDescription": "Traffiglove TG5545, darbe emici nitril köpük teknolojisi ve kesim seviyesi E güvenlik sertifikası ile üst düzey koruma sağlayan bir eldivendir. Islak, kuru ve y",
    "metaKeywords": [],
    "shortDescription": "Darbe emici nitril köpük ile üretilmiş bu güvenlik eldiveni, yüksek kesilme direnci ve mükemmel kavrama sunar. Uzun süreli konfor için tasarlanmıştır."
  },
  {
    "slug": "1008wh-tasinabilir-guc-kaynagi-99-99-mppt-bms-coklu-koruma-kablosuz-sarj-singo1000",
    "metaTitle": "Singo1000 - 1008Wh LiFePO4 Güç Kaynağı",
    "metaDescription": "1008Wh kapasite ve 1000W çıkış gücüyle Singo1000, taşınabilir enerji ihtiyacınızı karşılar. Hızlı şarj ve 11 cihaz desteğiyle hemen satın alın.",
    "metaKeywords": [
      "Taşınabilir Güç Kaynağı",
      "LiFePO4 Batarya",
      "Solar Jeneratör",
      "Singo1000",
      "Initial Entropy Energy"
    ],
    "shortDescription": "Singo1000, 1008Wh kapasitesi ve LiFePO4 bataryasıyla taşınabilir enerji ihtiyaçlarınızı karşılar. Hızlı şarj ve çoklu cihaz desteği sunar."
  },
  {
    "slug": "2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200",
    "metaTitle": "P3200 2048Wh - 6400W Güçlü Taşınabilir Jeneratör",
    "metaDescription": "2048Wh kapasite ve 6400W maksimum güç ile P3200, taşınabilir enerji çözümünüz. Hızlı şarj ve çoklu çıkış portlarıyla her yerde enerjinizi sağlayın.",
    "metaKeywords": [
      "P3200",
      "Taşınabilir Güç Kaynağı",
      "LiFePO4 Batarya",
      "Solar Jeneratör",
      "6400W Güç"
    ],
    "shortDescription": "P3200, 2048Wh kapasite ve 6400W maksimum çıkış gücüyle taşınabilir enerji ihtiyaçlarınızı karşılar."
  },
  {
    "slug": "td04-surdurulebilir-biyobozunur-nitril-tek-kullanimlik-eldiven-100-lu-kutu",
    "metaTitle": "TD04 Sürdürülebilir Biyobozunur Nitril Tek Kullanımlık Eldiv",
    "metaDescription": "Traffi TD04 Sürdürülebilir, ASTM D5526'ya göre 735 gün içinde biyobozunabilirlik sağlayan, yüksek esneklik ve üstün konfor sunan nitril eldivendir. Gıda, inşaat",
    "metaKeywords": [],
    "shortDescription": "Biyobozunur nitril yapı, 735 gün içinde %79 parçalanma sunar. Yüksek esneklik ve dokulu yüzey, karmaşık görevlerde mükemmel kavrama ve kontrol sağlar."
  },
  {
    "slug": "5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000",
    "metaTitle": "IEE SH4000 - 5120Wh LiFePO4 Solar Jeneratör",
    "metaDescription": "5120Wh kapasite, 8000W güç, hızlı şarj. Taşınabilir enerji çözümü, şimdi satın alın.",
    "metaKeywords": [
      "LiFePO4 taşınabilir güç",
      "solar jeneratör",
      "taşınabilir enerji",
      "IEE SH4000",
      "güç kaynağı"
    ],
    "shortDescription": "5120Wh kapasite ve 8000W tepe gücüyle, IEE SH4000 taşınabilir güç kaynağı ile enerji ihtiyaçlarınızı karşılayın."
  },
  {
    "slug": "1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro",
    "metaTitle": "Singo2000PRO - 1920Wh LiFePO4 Taşınabilir Güç Kaynağı",
    "metaDescription": "1920Wh kapasite, 4000W max güç, hızlı şarj ile kesintisiz enerji. Şimdi keşfedin!",
    "metaKeywords": [
      "Singo2000PRO",
      "LiFePO4 güç kaynağı",
      "taşınabilir solar jeneratör",
      "1920Wh",
      "4000W güç"
    ],
    "shortDescription": "Singo2000PRO, 1920Wh kapasitesi ve 4000W maksimum gücüyle taşınabilir enerji ihtiyacınızı karşılar."
  },
  {
    "slug": "tm100-pu-kaplamali-polyester-kesim-seviyesi-1-guvenlik-eldiveni",
    "metaTitle": "TM100 PU Kaplamalı Polyester Kesim Seviyesi 1 Güvenlik Eldiv",
    "metaDescription": "TM100 iş eldiveni, hafif ve dayanıklı yapıya sahip, çeşitli endüstriyel uygulamalar için ideal bir seçenektir. Konforlu tasarımıyla uzun süreli kullanım sağlar.",
    "metaKeywords": [],
    "shortDescription": "Aşınma direnci yüksek ve iyi kavrama sunan bu eldiven, kuru hava koşullarında güvenli çalışma imkanı sağlar. Endüstriyel kullanım için idealdir."
  },
  {
    "slug": "tm112-nitril-kaplamali-naylon-kesim-seviyesi-1-guvenlik-eldiveni",
    "metaTitle": "TM112 Nitril Kaplamalı Naylon Kesim Seviyesi 1 Güvenlik Eldi",
    "metaDescription": "TM112 iş eldiveni, dayanıklı yapısı ve konforlu tasarımıyla öne çıkan bir üründür. Düz nitril kaplaması sayesinde kuru koşullarda üstün kavrama sağlar. Detaylar",
    "metaKeywords": [],
    "shortDescription": "Esnek konfor astarı ile tasarlanmış bu nitril kaplamalı eldiven, kullanıcılara mükemmel koruma ve rahatlık sunar. Bilek boyu tasarımı, güvenli bir oturuş sağlar."
  },
  {
    "slug": "tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100",
    "metaTitle": "SP100 - 100W Katlanabilir Güneş Paneli",
    "metaDescription": "Su geçirmez ve katlanabilir 100W güneş paneli ile enerji ihtiyacınızı karşılayın. Yüksek verimlilik ve hafif tasarım. Şimdi keşfedin!",
    "metaKeywords": [
      "katlanabilir güneş paneli",
      "100W güneş paneli",
      "IP67 su geçirmez",
      "monokristal güneş paneli",
      "solar şarj cihazı"
    ],
    "shortDescription": "Initial Entropy Energy SP100, %23 verimlilik ve IP67 su geçirmezlik sunan, katlanabilir 100W güneş paneli ile enerji çözümünüz."
  },
  {
    "slug": "tm410-pu-kaplamali-yuksek-performans-polietilen-kesim-seviyesi-d-guvenlik-eldiveni",
    "metaTitle": "TM410 PU kaplamalı Yüksek Performans Polietilen Kesim Seviye",
    "metaDescription": "Bu hafif PU kaplamalı iş eldiveni, ıslak ve kuru koşullarda sert işlemler için Level 4 yırtılma direnci sunar. Sağlam kavrama, yüksek dayanıklılık ve esneklik i",
    "metaKeywords": [],
    "shortDescription": "Hafif ve dayanıklı eldiven, yüksek yırtılma direnci ile zorlu koşullarda güvenli çalışma imkanı sunar. Islak ve kuru ortamlarda mükemmel kavrama sağlar."
  },
  {
    "slug": "1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800",
    "metaTitle": "P1800 1024Wh - 3600W LiFePO4 Güç Kaynağı",
    "metaDescription": "P1800 1024Wh kapasite ve 3600W max güç ile taşınabilir enerji. Hızlı şarj ve uzun ömür. Şimdi satın al!",
    "metaKeywords": [
      "P1800",
      "taşınabilir güç kaynağı",
      "solar jeneratör",
      "LiFePO4 batarya",
      "Initial Entropy Energy"
    ],
    "shortDescription": "P1800, 1024Wh kapasite ve 3600W maksimum güç sunan LiFePO4 bataryalı taşınabilir güç kaynağıdır."
  },
  {
    "slug": "tg5140-microdex-ultra-nitrile-kesilme-seviyesi-c-is-eldiveni",
    "metaTitle": "TG5140 MICRODEX ULTRA NITRILE Kesilme Seviyesi C İş Eldiveni",
    "metaDescription": "TG5140 MICRODEX ULTRA NITRILE kesilme seviyesi C iş eldiveni, üstün koruma ve konfor sunar. Islak, kuru ve yağlı koşullarda güvenli tutuş sağlayan MicroDex nitr",
    "metaKeywords": [],
    "shortDescription": "Yüksek kesilme direnci ve mükemmel kavrama özelliği sunan iş eldiveni, ıslak ve yağlı ortamlarda güvenle kullanılabilir. Esnek yapısı ile konforu artırır."
  }
];

async function seedMeta() {
  for (const p of products) {
    try {
      await prisma.product.update({
        where: { slug: p.slug },
        data: {
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          metaKeywords: p.metaKeywords,
          shortDescription: p.shortDescription,
        },
      });
      console.log("Guncellendi: " + p.slug.slice(-20));
    } catch {
      console.log("Atlanıyor (bulunamadi): " + p.slug.slice(-20));
    }
  }
  await prisma.$disconnect();
  console.log("\nTamamlandi!");
}

seedMeta().catch(console.error);
