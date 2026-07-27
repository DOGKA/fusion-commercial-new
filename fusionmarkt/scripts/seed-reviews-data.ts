/**
 * Yorum Seed Verisi
 *
 * scripts/seed-reviews.ts tarafından kullanılır.
 * Buradaki metinleri / isimleri / puanları dilediğin gibi düzenleyebilirsin,
 * script veriyi olduğu gibi alır.
 *
 * masked: true  -> sitede "A*** K***" şeklinde görünür
 * masked: false -> sitede ad soyad açık görünür
 * daysAgo: yorumun kaç gün önce yazılmış görüneceği
 * date: sabit tarih (YYYY-MM-DD). Verilirse daysAgo yok sayılır.
 */

export type SeedReview = {
  name: string; // Gerçek görünümlü ad soyad (kullanıcı kaydı bu isimle açılır)
  masked: boolean;
  rating: 4 | 5;
  title?: string;
  comment: string;
  daysAgo?: number;
  date?: string; // "2026-03-14" gibi sabit tarih
};

export type SeedTarget = {
  label: string; // Sadece log çıktısı için
  type: "product" | "bundle";
  keywords: string[]; // slug veya isim eşleştirme (case-insensitive contains)
  reviews: SeedReview[];
};

export const SEED_TARGETS: SeedTarget[] = [
  // ============================================================
  // P800 — 12 yorum, hepsi 5 yıldız (ortalama 5.0)
  // ============================================================
  {
    label: "P800",
    type: "product",
    keywords: ["p800", "p-800"],
    reviews: [
      {
        name: "Serkan Güneş",
        masked: true,
        rating: 5,
        title: "kamp için birebir",
        comment:
          "3 haftadır bende, iki kamp gördü. telefonlar kamera drone hepsini şarj etti daha yarısı bitmedi. boyutu da çantada yer kaplamıyor.",
        daysAgo: 12,
      },
      {
        name: "Ayşe Kaya",
        masked: true,
        rating: 5,
        comment:
          "Elektrik kesintisinde modem ve televizyonu buna bağladık, saatlerce hiç sorun yaşamadık. İyi ki almışız.",
        daysAgo: 34,
      },
      {
        name: "Murat Öztürk",
        masked: false,
        rating: 5,
        comment: "Ürün cok guzel",
        daysAgo: 47,
      },
      {
        name: "Elif Yıldız",
        masked: true,
        rating: 5,
        comment:
          "Babam için bağ evine aldık. Kurulumu falan yok zaten, aç kullan. Babam çok memnun, akşamları fenerini bile kullanıyor. Küçük hediye için de ayrıca teşekkürler.",
        daysAgo: 61,
      },
      {
        name: "Burak Aslan",
        masked: false,
        rating: 5,
        title: "satıcı çok ilgili",
        comment:
          "Almadan önce satıcıya bir iki soru sormuştum, akşam geç saatte bile cevap verdiler. Kargo ertesi gün elimdeydi. Ürün de anlatıldığı gibi çıktı.",
        daysAgo: 8,
      },
      {
        name: "Hatice Çetin",
        masked: true,
        rating: 5,
        comment: "sorunsuz geldi, kullanıyoruz. teşekkürler",
        daysAgo: 19,
      },
      {
        name: "Kemal Aktaş",
        masked: false,
        rating: 5,
        comment:
          "Denemek için 800 wattlık taşlama makinesini taktım gayet güzel çalıştırdı. Bu boyuttan açıkçası beklemiyordum.",
        daysAgo: 78,
      },
      {
        name: "Merve Koç",
        masked: true,
        rating: 5,
        comment:
          "karavana geçmeden önce küçük boyla başlayalım dedik. hassas cihazları bile sorunsuz çalıştırıyor. memnun kalırsak büyüğünü alacağız",
        daysAgo: 95,
      },
      {
        name: "Osman Kurt",
        masked: true,
        rating: 5,
        comment: "İkinci siparişim, birini de kayınpedere aldık. O da memnun ben de.",
        daysAgo: 26,
      },
      {
        name: "Gamze Erdoğan",
        masked: false,
        rating: 5,
        comment: "harika bir ürün çok işime yarayacak.",
        daysAgo: 41,
      },
      {
        name: "Volkan Özkan",
        masked: true,
        rating: 5,
        comment:
          "Fotoğrafçıyım, dış çekimlerde ışık ve laptop için kullanıyorum. Bu boyutta bu güç işimi fazlasıyla görüyor.",
        daysAgo: 55,
      },
      {
        name: "İsmail Tunç",
        masked: true,
        rating: 5,
        comment:
          "fiyat performans olarak doğru tercih, muadillerine göre de uygun. satıcı ilgili, sorulara hemen dönüş yapıyorlar",
        daysAgo: 5,
      },
    ],
  },

  // ============================================================
  // P1800 — 13 yorum, hepsi 5 yıldız (ortalama 5.0)
  // ============================================================
  {
    label: "P1800",
    type: "product",
    keywords: ["p1800", "p-1800"],
    reviews: [
      {
        name: "Ahmet Çelik",
        masked: true,
        rating: 5,
        title: "kesintiler için almıştık",
        comment:
          "Sitede sık elektrik kesiliyor. Buzdolabı, modem ve tv saatlerce aynı anda bağlı kaldı, gayet rahat götürdü. Eşim de çok memnun.",
        daysAgo: 15,
      },
      {
        name: "Zeynep Arslan",
        masked: false,
        rating: 5,
        comment:
          "Karavanda 2 aydır kullanıyoruz. Sabahları saç kurutma makinesi bile sorun çıkarmadı. Prize takınca da çok hızlı doluyor.",
        daysAgo: 52,
      },
      {
        name: "Hüseyin Doğan",
        masked: true,
        rating: 5,
        comment:
          "gücüne sözüm yok, şantiyede matkabı bile çalıştırdım. bu fiyata bu performans gayet iyi",
        daysAgo: 33,
      },
      {
        name: "Selin Aksoy",
        masked: true,
        rating: 5,
        comment:
          "CPAP cihazı kullanan annem için aldık, kesintilerde kelimenin tam anlamıyla hayat kurtarıyor. Gece boyu rahat idare ediyor. Satıcı da almadan önce bütün sorularımıza sabırla cevap verdi, teşekkür ederiz.",
        daysAgo: 74,
      },
      {
        name: "Mehmet Yılmaz",
        masked: false,
        rating: 5,
        title: "tam bir kamp arkadaşı",
        comment:
          "3 günlük kampta 2 aile idare etti. ışıklar, telefonlar, mini buzdolabı derken dönerken hala şarjı vardı. güneş paneliyle beraber alın derim",
        daysAgo: 88,
      },
      {
        name: "Fatma Şahin",
        masked: true,
        rating: 5,
        comment:
          "eşime hediye aldım, balıkçıdır kendisi. teknede telefon şarjı derdi kalmadı, çok memnun",
        daysAgo: 21,
      },
      {
        name: "Emre Aydın",
        masked: false,
        rating: 5,
        comment: "çok iyi çıktı",
        daysAgo: 44,
      },
      {
        name: "Ramazan Yavuz",
        masked: true,
        rating: 5,
        comment:
          "bağ evinde buzdolabı ve aydınlatmayı buna bağladık, gündüz panelle dolduruyor akşam kullanıyoruz. şebeke elektriği gibi",
        daysAgo: 102,
      },
      {
        name: "Ebru Sarı",
        masked: true,
        rating: 5,
        title: "kararsız kalanlara",
        comment:
          "P800 ile arasında kaldım, iyi ki bunu almışım. kapasite farkı günlük kullanımda çok belli oluyor. bir beden büyük alın pişman olmazsınız",
        daysAgo: 9,
      },
      {
        name: "Hakan Kılıç",
        masked: false,
        rating: 5,
        comment:
          "Daha önce Jackery kullandım, bunun performansı hiç geride değil hatta şarj hızı daha iyi. Gönül rahatlığıyla alabilirsiniz.",
        daysAgo: 29,
      },
      {
        name: "Tuğba Polat",
        masked: true,
        rating: 5,
        comment: "tavsiye ederim",
        daysAgo: 60,
      },
      {
        name: "Yusuf Kara",
        masked: true,
        rating: 5,
        comment:
          "elektrikçiyim, müşteri tarafında jeneratör gürültüsünden kurtardı beni. sessiz çalışması en büyük artısı. kutudan çıkan küçük hediye de hoş sürpriz oldu",
        daysAgo: 37,
      },
      {
        name: "Nurcan Aydın",
        masked: false,
        rating: 5,
        title: "çok memnunuz",
        comment:
          "Oğlum araştırdı araştırdı bunu seçti. Köyde kesinti olduğunda komşular bize geliyor artık telefon şarj etmeye :)",
        daysAgo: 68,
      },
    ],
  },

  // ============================================================
  // Singo 2000 Pro — 10 yorum, 2 tane 4 yıldız (ortalama 4.8)
  // ============================================================
  {
    label: "Singo 2000 Pro",
    type: "product",
    keywords: ["singo2000", "singo-2000", "singo 2000"],
    reviews: [
      {
        name: "Cem Karadağ",
        masked: true,
        rating: 5,
        title: "canavar gibi",
        comment:
          "kaynak makinesi hariç ne taktıysam çalıştırdı. karavancılar için biçilmiş kaftan. panelle beraber iki gündür kesintisiz kullanıyorum",
        daysAgo: 24,
      },
      {
        name: "Ali Osman Şimşek",
        masked: true,
        rating: 5,
        comment:
          "Kahve makinesi, tost makinesi derken kamp kahvaltısını tamamen buna bağladık. Arkadaşlar şaşırdı açıkçası.",
        daysAgo: 49,
      },
      {
        name: "Derya Uçar",
        masked: false,
        rating: 4,
        comment:
          "Ürün gayet güçlü ve kaliteli. Yalnız yük artınca fan devreye giriyor ve sesi belirgin, kapalı alanda fark ediliyor. Onun dışında bir eksiği yok.",
        daysAgo: 66,
      },
      {
        name: "Ferhat Işık",
        masked: true,
        rating: 5,
        title: "jeneratörden kurtulduk",
        comment:
          "dükkanda kesinti olunca yazar kasa ve internet bundan çalışıyor artık. mazot derdi egzoz derdi yok. keşke daha önce alsaymışım",
        daysAgo: 13,
      },
      {
        name: "Şule Erdem",
        masked: true,
        rating: 5,
        comment:
          "eşim titiz araştırır, 1 ay inceledikten sonra buna karar verdi. karavanımızın ana güç kaynağı oldu, gayet memnunuz",
        daysAgo: 82,
      },
      {
        name: "Onur Bal",
        masked: false,
        rating: 5,
        comment:
          "İki yıldır aynı markanın Singo 1000 modelini kullanıyorum, bugüne kadar hiç sorun yaşamadım. Kapasite ihtiyacım artınca gözüm kapalı bunu aldım, eskisi ofise geçti. İkisi de görevde :)",
        daysAgo: 31,
      },
      {
        name: "Sibel Taş",
        masked: true,
        rating: 4,
        title: "iyi ürün",
        comment:
          "fiyatı nedeniyle çok düşündüm ama kapasitesi gerçekten günlük hayatı taşıyor. kesintide buzdolabı ve derin dondurucuyu birden çekti. fiyat düşünce 4 yıldız",
        daysAgo: 58,
      },
      {
        name: "Uğur Çakır",
        masked: true,
        rating: 5,
        comment:
          "3 aydır bende, bağ evinde panel + bu ikili sistemi kurduk. şebekeye ihtiyacımız kalmadı desem yalan olmaz",
        daysAgo: 91,
      },
      {
        name: "Halil İbrahim Öz",
        masked: false,
        rating: 5,
        comment:
          "bayramda köye götürdük, herkes başına toplandı :) ciddi cihaz, tavsiye ederim. küçük hediye için de teşekkürler",
        daysAgo: 40,
      },
      {
        name: "Aslı Kaplan",
        masked: true,
        rating: 5,
        comment:
          "Kadın kadına kamp yapıyoruz arkadaşlarla, artık elektrik derdimiz yok. Ağır ama zaten arabayla taşıyoruz.",
        daysAgo: 17,
      },
    ],
  },

  // ============================================================
  // P3200 — 10 yorum, 1 tane 4 yıldız (ortalama 4.9)
  // ============================================================
  {
    label: "P3200",
    type: "product",
    keywords: ["p3200", "p-3200"],
    reviews: [
      {
        name: "Mustafa Demir",
        masked: true,
        rating: 5,
        title: "ev için yedek güç",
        comment:
          "Jeneratöre alternatif ararken buldum. Kesintide kombi, buzdolabı, modem, tv hepsi bundan çalışıyor. Sessiz olması en büyük artısı, komşuların jeneratör gürültüsünü duyunca iyi ki diyorum.",
        daysAgo: 36,
      },
      {
        name: "Nihat Güler",
        masked: false,
        rating: 5,
        comment:
          "iş yerinde sunucu ve kameralar için aldık, ups gibi kullanıyoruz. kesintide hiçbir cihaz kapanmıyor. kurumsal fatura da kestiler sorunsuz",
        daysAgo: 71,
      },
      {
        name: "Meltem Acar",
        masked: true,
        rating: 4,
        comment:
          "kesintide evi rahat döndürüyor. tekerlekleri olduğu için taşıması da dert değil, odadan odaya çekip götürüyorum. memnunuz",
        daysAgo: 50,
      },
      {
        name: "Recep Bozkurt",
        masked: true,
        rating: 5,
        comment:
          "çiftlikte kesinti olunca süt sağım makinesini çalıştırıyorum. bu zamana kadar hiç yarı yolda bırakmadı. gündüz panelle dolduruyorum",
        daysAgo: 84,
      },
      {
        name: "Deniz Şen",
        masked: false,
        rating: 5,
        comment:
          "Anker kullanan biriydim, büyütme amaçlı fiyat performans olarak bunu tercih ettim. İçinden çıkan kablolar da çok kullanışlı. Satıcı her soruma kısa sürede cevap verdi. Zamanla tecrübelerimi tekrar yazarım.",
        daysAgo: 22,
      },
      {
        name: "Pınar Doğru",
        masked: true,
        rating: 5,
        comment:
          "babamlar için köye aldık, kesintiler artık dert değil. kurulum diye bir şey yok, prize takıp cihazları bağlıyorsun o kadar",
        daysAgo: 63,
      },
      {
        name: "Tolga Ergin",
        masked: true,
        rating: 5,
        comment:
          "benzer kapasitede başka marka cihazım da var, buna kıyasla epey hafif kalıyor. bagaja rahat sığıyor. kesintide bulaşık makinesini bile denedim, çalıştırdı",
        daysAgo: 45,
      },
      {
        name: "Songül Ateş",
        masked: false,
        rating: 5,
        title: "değer",
        comment:
          "1 senedir jeneratör bakıyorduk, iyi ki beklemişiz. mazot yok bakım yok gürültü yok. denemek için çamaşır makinesini bile çalıştırdım, çalıştı.",
        daysAgo: 11,
      },
      {
        name: "Erkan Sağlam",
        masked: true,
        rating: 5,
        comment:
          "Atölyemde kompresör hariç tüm el aletlerini taşıyor. Sahada priz aramaktan kurtuldum.",
        daysAgo: 76,
      },
      {
        name: "Bülent Kaya",
        masked: true,
        rating: 5,
        comment:
          "Ürün piyasadaki muadillerinden avantajlı görünüyor. Satıcı ilgili ve sorulara yeterli cevap veriyor. İhtiyacı olanlara tavsiye edilir.",
        daysAgo: 6,
      },
    ],
  },

  // ============================================================
  // SP400 — 8 yorum, 1 tane 4 yıldız (ortalama 4.9)
  // ============================================================
  {
    label: "SP400",
    type: "product",
    keywords: ["sp400", "sp-400"],
    reviews: [
      {
        name: "Barış Tekin",
        masked: true,
        rating: 5,
        title: "verimli panel",
        comment:
          "istasyonla beraber kullanıyorum. öğlen saatlerinde beklediğimin üstünde güç aldığım oluyor, akşam üstü doğal olarak düşüyor. katlanınca da az yer kaplıyor",
        daysAgo: 28,
      },
      {
        name: "Cansu Yalçın",
        masked: false,
        rating: 5,
        comment:
          "Kampta istasyonu gündüz bununla dolduruyoruz, akşam elektrik hazır. Ayakları sağlam, açısını ayarlamak kolay.",
        daysAgo: 53,
      },
      {
        name: "Metin Koçak",
        masked: true,
        rating: 4,
        comment:
          "panel gayet iyi çalışıyor, verimden memnunum. taşıma kılıfı biraz daha kaliteli olabilirdi, fermuarı naif geldi bana. dikkatli kullanınca sorun yok",
        daysAgo: 39,
      },
      {
        name: "Gül Ayhan",
        masked: true,
        rating: 5,
        comment:
          "bağ evinde kullanıyoruz, istasyonla beraber mini güneş santrali gibi olduk. bulutlu günde bile az da olsa dolduruyor",
        daysAgo: 87,
      },
      {
        name: "Sinan Ak",
        masked: false,
        rating: 5,
        comment:
          "İki tane aldım paralel bağlıyorum, dolum süresi ciddi kısaldı. Kabloları ve bağlantıları kaliteli.",
        daysAgo: 16,
      },
      {
        name: "Hülya Başaran",
        masked: true,
        rating: 5,
        comment:
          "verimi güzel, kurulumu kolay. kampta arabadan alana eşim taşıyor, bana da açması kalıyor :) iki kamptır güneşten şarj ediyoruz her şeyi",
        daysAgo: 61,
      },
      {
        name: "Kadir Ünal",
        masked: true,
        rating: 5,
        comment:
          "karavanın yanına gölge düşmeyecek şekilde seriyorum, gün boyu bedava elektrik. bu fiyata bu verim gayet iyi",
        daysAgo: 44,
      },
      {
        name: "Neslihan Vural",
        masked: false,
        rating: 5,
        comment: "istasyonla birlikte aldık, fişe hiç takmadık daha :) güneş gördüğü sürece işini yapıyor",
        daysAgo: 7,
      },
    ],
  },

  // ============================================================
  // SP200 — 8 yorum, 1 tane 4 yıldız (ortalama 4.9)
  // ============================================================
  {
    label: "SP200",
    type: "product",
    keywords: ["sp200", "sp-200"],
    reviews: [
      {
        name: "Orhan Karaman",
        masked: true,
        rating: 5,
        comment:
          "P800 le birlikte kullanıyorum, tam uyumlu. güneşli günde birkaç saatte dolduruyor. kampçıya bu ikili yeter de artar",
        daysAgo: 32,
      },
      {
        name: "Yasemin Er",
        masked: false,
        rating: 5,
        title: "balkon için ideal",
        comment:
          "Balkona koydum, gün boyu istasyonu şarj ediyor. Apartmanda yaşayanlar için güzel çözüm, kimseye bir şey sormanıza gerek yok :)",
        daysAgo: 48,
      },
      {
        name: "Süleyman Us",
        masked: true,
        rating: 4,
        comment:
          "ürün iyi de kablosu bence biraz kısa, uzatma almak zorunda kaldım. panelin kendisi verimli, güneşi görsün yeter",
        daysAgo: 70,
      },
      {
        name: "Esra Çınar",
        masked: true,
        rating: 5,
        comment:
          "hafif olması en büyük artısı, çadırın yanına açıp kuruyorum. ilk defa panel kullanıyorum, hiç zorlanmadım",
        daysAgo: 25,
      },
      {
        name: "Fikret Aydoğan",
        masked: false,
        rating: 5,
        comment:
          "Beklediğimden kaliteli çıktı. Bulutlu havada verim düşüyor tabi ama bu her panelde böyle. Güneşte performansı gayet iyi.",
        daysAgo: 58,
      },
      {
        name: "Şeyma Kurtuluş",
        masked: true,
        rating: 5,
        comment:
          "babam bağda kullanıyor, telefonu ve ışıkları güneşten çeviriyor artık. ufak tefek ama işini yapıyor",
        daysAgo: 93,
      },
      {
        name: "Levent Işıklar",
        masked: true,
        rating: 5,
        comment:
          "öğlen güneşinde verimi gerçekten iyi, istasyonu gün içinde rahat dolduruyor. katlayıp kaldırması da 1 dakika",
        daysAgo: 14,
      },
      {
        name: "Melike Ödemiş",
        masked: false,
        rating: 5,
        comment:
          "eşimle kamp setimizi tamamladık bununla. kurulumu 1 dakika, katla çantasına koy git. tavsiye ederiz",
        daysAgo: 41,
      },
    ],
  },

  // ============================================================
  // Solar Başlangıç Paketi — 8 yorum, 1 tane 4 yıldız (ortalama 4.9)
  // ============================================================
  {
    label: "Solar Başlangıç Paketi",
    type: "bundle",
    keywords: ["başlangıç", "baslangic"],
    reviews: [
      {
        name: "Adem Yüce",
        masked: true,
        rating: 5,
        title: "başlangıç için tam isabet",
        comment:
          "solar işine yeni giriyorsanız düşünmeyin, panel ve istasyon zaten uyumlu geliyor, kablo derdi yok. paket almak ayrı ayrı almaktan mantıklı",
        daysAgo: 27,
      },
      {
        name: "Buse Karataş",
        masked: false,
        rating: 5,
        comment:
          "İlk kamp setimiz. Kurulum diye bir şey yok, panel istasyona takılıyor o kadar. İki kamptır elektrik derdimiz olmadı.",
        daysAgo: 54,
      },
      {
        name: "Coşkun Demirel",
        masked: true,
        rating: 4,
        comment:
          "paket güzel, ürünler kaliteli. keşke pakete bir de taşıma çantası ekleseler, iki parçayı ayrı ayrı taşıyoruz. onun dışında memnunum",
        daysAgo: 38,
      },
      {
        name: "Damla Öcal",
        masked: true,
        rating: 5,
        comment:
          "babama emeklilik hediyesi :) bağda telefonunu şarj ediyor, radyosunu çalıştırıyor, akşam feneriyle etrafı aydınlatıyor. çok sevdi",
        daysAgo: 66,
      },
      {
        name: "Engin Polater",
        masked: false,
        rating: 5,
        comment:
          "ÜRÜN ELİME SORUNSUZ ULAŞTI GAYET KALİTELİ KAMP İÇİN ALDIK ÇOK MEMNUN KALDIK KÜÇÜK HEDİYE İÇİN DE AYRICA TEŞEKKÜR EDERİM",
        daysAgo: 19,
      },
      {
        name: "Feride Susuz",
        masked: true,
        rating: 5,
        comment:
          "kızım yurtta kalıyor, kesintilerde modem ve laptop için aldık. panel de yaz tatilinde bizde iş görüyor, iki taraf da memnun",
        daysAgo: 81,
      },
      {
        name: "Gökhan Tan",
        masked: true,
        rating: 5,
        comment:
          "Ürün son derece kaliteli, bilindik markalarla aynı işi görüyor. Diğerlerinde güneş panelini ayrı ücretle alıyorsun, bunda set halinde geliyor. Çadır kampım için aldım fazlasıyla iş görüyor, gönül rahatlığıyla alabilirsiniz.",
        daysAgo: 46,
      },
      {
        name: "Hilal Avcı",
        masked: false,
        rating: 5,
        title: "yeni başlayanlara",
        comment:
          "hangi panel hangi istasyonla uyumlu diye günlerce araştırmıştım, meğer hazır paket varmış. uğraşmadan aldım kullanıyorum",
        daysAgo: 10,
      },
    ],
  },

  // ============================================================
  // Solar Operatör Paketi — 6 yorum, 1 tane 4 yıldız (ortalama 4.8)
  // ============================================================
  {
    label: "Solar Operatör Paketi",
    type: "bundle",
    keywords: ["operatör", "operator"],
    reviews: [
      {
        name: "İlker Baştürk",
        masked: true,
        rating: 5,
        comment:
          "drone ve kamera ekipmanı için sahada kullanıyorum, çekim aralarında her şey şarja giriyor. gündüz panel destekliyor, uzun çekim günlerinde kurtarıcı",
        daysAgo: 23,
      },
      {
        name: "Kübra Salman",
        masked: false,
        rating: 5,
        title: "işimizin parçası oldu",
        comment:
          "Kırsalda saha çalışması yapıyoruz, ölçüm cihazları ve laptoplar hep bundan besleniyor. Paket olarak almak hem daha uygun hem uyum garantisi demek.",
        daysAgo: 59,
      },
      {
        name: "Latif Toprak",
        masked: true,
        rating: 4,
        comment:
          "set olarak güzel düşünülmüş. yoğun kullanımda panelin dolumu yetişmeyebiliyor, biz bir panel daha ekledik sorun çözüldü. onun dışında dört dörtlük",
        daysAgo: 35,
      },
      {
        name: "Mine Erbaş",
        masked: true,
        rating: 5,
        comment:
          "karavan hayatına bu paketle başladık, 2 aydır yoldayız. buzdolabı ışıklar telefonlar hepsi bu sistemde. bir kere bile ters bir şey yapmadı",
        daysAgo: 72,
      },
      {
        name: "Necati Gür",
        masked: false,
        rating: 5,
        comment:
          "şantiyede ofis konteynerini mesai boyunca bu sistemle döndürüyoruz. jeneratörün mazot parasını düşününce kendini amorti ediyor",
        daysAgo: 12,
      },
      {
        name: "Özge Duran",
        masked: true,
        rating: 5,
        comment:
          "eşimle uzun yol kampları yapıyoruz, minibüste artık bu set var. satıcı da çok ilgili, kurulumla ilgili sorularımıza tek tek cevap verdiler",
        daysAgo: 88,
      },
    ],
  },

  // ============================================================
  // Solar Veteran Paketi — 6 yorum, 1 tane 4 yıldız (ortalama 4.8)
  // ============================================================
  {
    label: "Solar Veteran Paketi",
    type: "bundle",
    keywords: ["veteran"],
    reviews: [
      {
        name: "Polat Kayalar",
        masked: true,
        rating: 5,
        title: "bilenlerin tercihi",
        comment:
          "3 yıldır solar sistemlerle uğraşıyorum, bu paketteki denge güzel kurulmuş. istasyon ve panel birbirini tam karşılıyor, darboğaz yok",
        daysAgo: 30,
      },
      {
        name: "Rabia Sönmez",
        masked: false,
        rating: 5,
        comment:
          "Bağ evimizi neredeyse şebekeden bağımsız hale getirdik. Gündüz doluyor, akşam ev bundan dönüyor. Kesinti olunca haberimiz bile olmuyor.",
        daysAgo: 64,
      },
      {
        name: "Sedat Karlı",
        masked: true,
        rating: 4,
        comment:
          "panel istasyonla uyumlu geliyor, kurulum 10 dakika sürmedi. bağ evinde kullanıyoruz, memnunuz",
        daysAgo: 43,
      },
      {
        name: "Tamer Boz",
        masked: true,
        rating: 5,
        comment:
          "ikinci solar setim, ilkini yazlığa kurmuştum bunu eve aldık. markanın ürünlerini 2 senedir kullanıyorum, beni hiç üzmediler",
        daysAgo: 77,
      },
      {
        name: "Ümit Aksu",
        masked: false,
        rating: 5,
        comment:
          "kesintilerin arttığı dönemde aldık, evin kritik yükleri artık bu sistemde. eşim başta fiyata itiraz etti, şimdi en çok o kullanıyor :)",
        daysAgo: 18,
      },
      {
        name: "Vildan Ceylan",
        masked: true,
        rating: 5,
        comment:
          "çiftlik evinde kullanıyoruz, buzdolabı su pompası aydınlatma hepsi bunda. panel sabit duruyor, sistem kendi kendine işliyor",
        daysAgo: 51,
      },
    ],
  },

  // ============================================================
  // Solar Elite Paketi — 7 yorum, 1 tane 4 yıldız (ortalama 4.9)
  // ============================================================
  {
    label: "Solar Elite Paketi",
    type: "bundle",
    keywords: ["elite", "elit"],
    reviews: [
      {
        name: "Yavuz Kartal",
        masked: true,
        rating: 5,
        title: "tam bağımsızlık",
        comment:
          "en üst paketi aldım, pişman değilim. ev tipi cihazların hepsini taşıyor, panel sayesinde dolum da hızlı. kesintili bölgede yaşayanlara özellikle tavsiye ederim",
        daysAgo: 21,
      },
      {
        name: "Zehra Akman",
        masked: false,
        rating: 5,
        comment:
          "Yazlıkta elektrik çok kesiliyordu, bu sistemle dert bitti. Fiyatı yüksek ama karşılığını fazlasıyla veriyor.",
        daysAgo: 56,
      },
      {
        name: "Abdullah Koçer",
        masked: true,
        rating: 4,
        comment:
          "sistemden memnunum, gücü kapasitesi yerinde. 4 yıldızın tek sebebi fiyat, biraz tuzlu. ama kalite de belli, ona göre değerlendirin",
        daysAgo: 42,
      },
      {
        name: "Bahar Sezer",
        masked: true,
        rating: 5,
        comment:
          "eşim mühendis, haftalarca karşılaştırma yaptı bu pakette karar kıldı. teknik detayları bilmem ama evde her şey çalışıyor, kesintiyi unuttuk",
        daysAgo: 69,
      },
      {
        name: "Cihan Ersoy",
        masked: false,
        rating: 5,
        comment:
          "dağ evinde 3 aydır tamamen şebekesiz yaşıyoruz, sistem bu paket üzerine kurulu. yaz güneşiyle fazlasıyla yetiyor, kış için ek panel düşünüyorum",
        daysAgo: 33,
      },
      {
        name: "Dilara Uz",
        masked: true,
        rating: 5,
        comment: "Çok iyi çıktı",
        daysAgo: 85,
      },
      {
        name: "Erdem Çolak",
        masked: true,
        rating: 5,
        comment:
          "işyerim için aldım, soğuk hava dolabı kesintide bozulmasın diye. iki kesinti atlattık, dolap fark etmedi bile. yatırımın karşılığı bu",
        daysAgo: 9,
      },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // EK YORUMLAR (Aralık 2025 - Temmuz 2026)
  // ════════════════════════════════════════════════════════════

  // ============================================================
  // P800 — ek 5 yorum
  // ============================================================
  {
    label: "P800 (ek)",
    type: "product",
    keywords: ["p800", "p-800"],
    reviews: [
      {
        name: "Tarık Sözen",
        masked: true,
        rating: 5,
        comment:
          "yılbaşında bağ evine götürdük, ışıklar ve telefonlar hep bundan çalıştı. boyutu küçük diye şüpheyle almıştım, fazlasıyla yetti",
        date: "2025-12-14",
      },
      {
        name: "Seda Yıldırım",
        masked: false,
        rating: 5,
        comment: "süperrr",
        date: "2026-02-08",
      },
      {
        name: "Mert Karaca",
        masked: true,
        rating: 5,
        comment: "arkadaşımda görüp aldım. kesintide modem çalışsın yeter bana, fazlasını yapıyor",
        date: "2026-03-19",
      },
      {
        name: "Yıldız Şener",
        masked: true,
        rating: 4,
        comment: "güzel ürün, beklentimi karşıladı",
        date: "2026-05-30",
      },
      {
        name: "Emirhan Duman",
        masked: false,
        rating: 5,
        comment: "kamp sezonu öncesi aldım, iki hafta sonu kullandım. şarjı uzun gidiyor, memnunum",
        date: "2026-07-12",
      },
    ],
  },

  // ============================================================
  // P1800 — ek 5 yorum
  // ============================================================
  {
    label: "P1800 (ek)",
    type: "product",
    keywords: ["p1800", "p-1800"],
    reviews: [
      {
        name: "Gökçe Sarıkaya",
        masked: true,
        rating: 5,
        comment:
          "aralıkta kar yağınca 6 saat elektrik yoktu, kombi ve modem bundan çalıştı. parasını o gece çıkardı bence",
        date: "2025-12-21",
      },
      {
        name: "Halime Uslu",
        masked: true,
        rating: 5,
        comment: "on numara, eşim çok memnun",
        date: "2026-01-17",
      },
      {
        name: "Aylin Ceber",
        masked: false,
        rating: 4,
        comment: "ürün güzel, kargo hızlıydı",
        date: "2026-03-28",
      },
      {
        name: "Daniel Weber",
        masked: false,
        rating: 5,
        comment: "good product. easy to use, charges fast. i use it in my camper van",
        date: "2026-04-02",
      },
      {
        name: "Serdar Tokgöz",
        masked: true,
        rating: 5,
        comment: "singo ile arada kaldım bunu aldım, çıkış gücü bana yetiyor. uygulaması da pratik",
        date: "2026-06-06",
      },
    ],
  },

  // ============================================================
  // Singo 2000 Pro — ek 5 yorum
  // ============================================================
  {
    label: "Singo 2000 Pro (ek)",
    type: "product",
    keywords: ["singo2000", "singo-2000", "singo 2000"],
    reviews: [
      {
        name: "Nazlı Gökmen",
        masked: false,
        rating: 5,
        comment: "babama aldık, bağ evinde kullanıyor. memnun",
        date: "2025-12-05",
      },
      {
        name: "Furkan Delice",
        masked: true,
        rating: 5,
        comment: "kablosuz şarj olayı hoşuma gitti, telefonu üstüne bırakıyorum. gücü zaten yeterli",
        date: "2026-02-14",
      },
      {
        name: "Sevgi Balaban",
        masked: false,
        rating: 4,
        comment: "kaliteli ürün, tavsiye ederim",
        date: "2026-04-16",
      },
      {
        name: "Oğuz Kandemir",
        masked: true,
        rating: 5,
        comment: "şantiyede kullanıyorum, sabah tam doluyla çıkıyorum akşama kadar idare ediyor",
        date: "2026-05-11",
      },
      {
        name: "Melih Arıkan",
        masked: true,
        rating: 5,
        comment: "süper bir alet, iyi ki almışım",
        date: "2026-07-08",
      },
    ],
  },

  // ============================================================
  // P3200 — ek 5 yorum
  // ============================================================
  {
    label: "P3200 (ek)",
    type: "product",
    keywords: ["p3200", "p-3200"],
    reviews: [
      {
        name: "Necdet Özbek",
        masked: true,
        rating: 5,
        comment:
          "yılbaşı öncesi geldi, iki kesinti gördük şimdiden. buzdolabı tv modem hepsi çalıştı, ses yok koku yok",
        date: "2025-12-27",
      },
      {
        name: "Cavit Örnek",
        masked: true,
        rating: 5,
        comment:
          "tekerlekli olması büyük avantaj, evde istediğim odaya çekip götürüyorum. kesintide kombiyi bile çalıştırdı",
        date: "2026-01-09",
      },
      {
        name: "İrem Batur",
        masked: false,
        rating: 5,
        comment: "çok memnun kaldık, babamlara da alacağız",
        date: "2026-03-14",
      },
      {
        name: "Şenol Dinçer",
        masked: true,
        rating: 4,
        comment: "iyi ürün",
        date: "2026-05-02",
      },
      {
        name: "Nedim Aksakal",
        masked: true,
        rating: 5,
        comment: "gücü yetmez diye korkuyordum, yazın klimayı bile çalıştırdı",
        date: "2026-06-20",
      },
    ],
  },

  // ============================================================
  // SH4000 — 6 yorum (ilk kez)
  // ============================================================
  {
    label: "SH4000",
    type: "product",
    // "sh4000" tek başına B5120'nin adındaki "SH4000 Uyumlu" ile de eşleşiyor,
    // o yüzden SH4000'e özgü slug parçaları kullanıldı
    keywords: ["8000w-max", "bms-sh4000"],
    reviews: [
      {
        name: "Doğan Kervan",
        masked: true,
        rating: 5,
        comment: "jeneratörden kurtulduk, mazot gürültü egzoz hepsi tarih oldu",
        date: "2025-12-11",
      },
      {
        name: "Kaan Yörük",
        masked: true,
        rating: 5,
        title: "ev için tam çözüm",
        comment:
          "ats ile bağladık, elektrik kesilince otomatik devreye giriyor. evdekiler kesintiyi fark etmiyor bile",
        date: "2026-01-22",
      },
      {
        name: "Rukiye Taşkın",
        masked: false,
        rating: 5,
        comment: "eşim elektrikçi, kurulumunu kendi yaptı. koca ev bundan dönüyor kesintide",
        date: "2026-03-08",
      },
      {
        name: "Selami Dursun",
        masked: true,
        rating: 5,
        comment: "ip54 olması dış mekan için güven veriyor, bahçedeki depoda duruyor sorunsuz",
        date: "2026-04-27",
      },
      {
        name: "Ferit Solmaz",
        masked: true,
        rating: 4,
        comment: "cihaz sağlam, gücü fazlasıyla yeterli",
        date: "2026-06-15",
      },
      {
        name: "Hazal Ergün",
        masked: false,
        rating: 5,
        comment: "iş yerine aldık, soğutucular kesintide durmuyor artık. iyi yatırım",
        date: "2026-07-19",
      },
    ],
  },

  // ============================================================
  // B5120 Genişletme Bataryası — 5 yorum (ilk kez)
  // ============================================================
  {
    label: "B5120",
    type: "product",
    keywords: ["b5120", "b-5120", "genisletme-batarya"],
    reviews: [
      {
        name: "Veli Okur",
        masked: true,
        rating: 5,
        comment: "kış için almıştık, iyi ki almışız. sistemin nefesi uzadı",
        date: "2025-12-18",
      },
      {
        name: "Turgut Özsoy",
        masked: true,
        rating: 5,
        comment: "sh4000 e ekledik, kapasite ikiye katlandı. uzun kesintilerde farkı çok belli",
        date: "2026-02-03",
      },
      {
        name: "Cemre Uçan",
        masked: true,
        rating: 4,
        comment: "beklediğim gibi, sorunsuz çalışıyor",
        date: "2026-04-09",
      },
      {
        name: "Aysel Mutlu",
        masked: false,
        rating: 5,
        comment: "takması 5 dakika sürdü, kablo bağlantıları hazır geliyor",
        date: "2026-05-21",
      },
      {
        name: "Bekir Sancak",
        masked: false,
        rating: 5,
        comment: "yazlık için aldım 3 tane aracımı şarj ediyorum",
        date: "2026-07-05",
      },
    ],
  },

  // ============================================================
  // SP100 — 5 yorum (ilk kez)
  // ============================================================
  {
    label: "SP100",
    type: "product",
    keywords: ["sp100", "sp-100"],
    reviews: [
      {
        name: "Sait Yorulmaz",
        masked: true,
        rating: 5,
        comment: "kışın bile öğlen saatlerinde iş görüyor, yazın tadından yenmez herhalde",
        date: "2025-12-09",
      },
      {
        name: "Musa Çiftçi",
        masked: false,
        rating: 4,
        comment: "güzel panel, işini yapıyor",
        date: "2026-01-30",
      },
      {
        name: "Nuri Ekinci",
        masked: true,
        rating: 5,
        comment: "p800 için aldım, güneşli günde rahat dolduruyor. hafif, tek elle taşınıyor",
        date: "2026-03-23",
      },
      {
        name: "Duygu Karahan",
        masked: false,
        rating: 5,
        comment: "balkonda kullanıyorum, küçük istasyonuma yetiyor",
        date: "2026-06-02",
      },
      {
        name: "Eda Berk",
        masked: true,
        rating: 5,
        comment: "hafif ve pratik, kampta işimizi gördü",
        date: "2026-07-16",
      },
    ],
  },

  // ============================================================
  // SP200 — ek 5 yorum
  // ============================================================
  {
    label: "SP200 (ek)",
    type: "product",
    keywords: ["sp200", "sp-200"],
    reviews: [
      {
        name: "Yasin Demirtaş",
        masked: true,
        rating: 5,
        comment: "bungalovda kullanıyorum gayet keyifli iş görüyor",
        date: "2025-12-30",
      },
      {
        name: "Harun Keskin",
        masked: true,
        rating: 5,
        comment: "ikinci panelim, paralel bağladım şarj süresi yarıya indi",
        date: "2026-02-26",
      },
      {
        name: "Nesrin Ata",
        masked: true,
        rating: 4,
        comment: "memnunum, tavsiye ederim",
        date: "2026-04-04",
      },
      {
        name: "Gizem Olgun",
        masked: false,
        rating: 5,
        comment: "kamp için ideal boyut, arabanın bagajında yerini aldı",
        date: "2026-05-15",
      },
      {
        name: "Anna Schmidt",
        masked: false,
        rating: 5,
        comment: "works great with my power station. good quality, easy to fold",
        date: "2026-06-28",
      },
    ],
  },

  // ============================================================
  // SP400 — ek 5 yorum
  // ============================================================
  {
    label: "SP400 (ek)",
    type: "product",
    keywords: ["sp400", "sp-400"],
    reviews: [
      {
        name: "Fadime Şeker",
        masked: true,
        rating: 5,
        comment: "eşime hediye almıştım, balığa çıkarken kullanıyor. memnun",
        date: "2025-12-23",
      },
      {
        name: "Suat Erim",
        masked: true,
        rating: 5,
        comment: "400w gerçekten farkını gösteriyor",
        date: "2026-01-05",
      },
      {
        name: "Berna Toksöz",
        masked: false,
        rating: 5,
        comment: "bağ evindeki sistemimize ekledik, dolum süresi belirgin kısaldı",
        date: "2026-03-31",
      },
      {
        name: "Tuncay Bilgin",
        masked: false,
        rating: 4,
        comment: "iyi panel, beklentiyi karşılıyor",
        date: "2026-05-08",
      },
      {
        name: "Ozan Karayel",
        masked: true,
        rating: 5,
        comment: "okul için aldım, sorunsuz çalışıyor",
        date: "2026-07-21",
      },
    ],
  },

  // ============================================================
  // Solar Başlangıç Paketi — ek 5 yorum
  // ============================================================
  {
    label: "Solar Başlangıç Paketi (ek)",
    type: "bundle",
    keywords: ["başlangıç", "baslangic"],
    reviews: [
      {
        name: "Ercan Vardar",
        masked: true,
        rating: 5,
        comment: "yeni başlayan için doğru paket, ayrı ayrı almaktan hesaplı geldi",
        date: "2025-12-13",
      },
      {
        name: "Zafer Kuru",
        masked: true,
        rating: 5,
        comment: "ilk setim, hiç uğraşmadan kurdum. kampta telefon ışık derdi bitti",
        date: "2026-02-17",
      },
      {
        name: "Hamdi Öge",
        masked: true,
        rating: 4,
        comment: "paket güzel, kargo hızlı geldi",
        date: "2026-04-22",
      },
      {
        name: "Melis Aydemir",
        masked: false,
        rating: 5,
        comment: "kız kardeşime de aldık aynı setten :) ikimiz de memnunuz",
        date: "2026-06-12",
      },
      {
        name: "Selin Koparan",
        masked: false,
        rating: 5,
        comment: "tatil için aldık, plajda bile telefonları güneşten şarj ettik",
        date: "2026-07-09",
      },
    ],
  },

  // ============================================================
  // Solar Usta Paketi (P800 + SP200) — 5 yorum (ilk kez)
  // ============================================================
  {
    label: "Solar Usta Paketi",
    type: "bundle",
    keywords: ["usta"],
    reviews: [
      {
        name: "Adnan Söz",
        masked: true,
        rating: 5,
        comment: "kesintiler için almıştık, panel sayesinde prize bile takmıyoruz",
        date: "2025-12-06",
      },
      {
        name: "Rıza Bulut",
        masked: true,
        rating: 5,
        comment: "p800 e büyük panel mantıklı, küçük panelle dolum uzun sürüyormuş. bu ikili dengeli",
        date: "2026-01-26",
      },
      {
        name: "Kerem Ünver",
        masked: false,
        rating: 4,
        comment: "memnunum, sorunsuz set",
        date: "2026-03-11",
      },
      {
        name: "Şebnem Işıl",
        masked: false,
        rating: 5,
        comment: "güzel ikili, gündüz doluyor akşam kullanıyoruz",
        date: "2026-05-04",
      },
      {
        name: "Lale Orhan",
        masked: true,
        rating: 5,
        comment: "iyi ki bu paketi seçmişim, 200w panel gerçekten hızlı dolduruyor",
        date: "2026-06-24",
      },
    ],
  },

  // ============================================================
  // Solar Performans Paketi (Singo2000PRO + SP200) — 5 yorum (ilk kez)
  // ============================================================
  {
    label: "Solar Performans Paketi",
    type: "bundle",
    keywords: ["performans"],
    reviews: [
      {
        name: "Cüneyt Barlas",
        masked: true,
        rating: 5,
        comment: "dükkan için almıştık, kesintide kasa ve internet çalışıyor.",
        date: "2025-12-19",
      },
      {
        name: "Ercüment Kale",
        masked: true,
        rating: 5,
        comment: "karavan için aldık, singo nun gücü panelin desteğiyle tam olmuş. uzun yolculuklarda rahatız",
        date: "2026-02-10",
      },
      {
        name: "Peri Somer",
        masked: true,
        rating: 5,
        comment: "set uyumlu, kablolar dahil çıkıyor.",
        date: "2026-04-13",
      },
      {
        name: "Nazan Ilgaz",
        masked: false,
        rating: 5,
        comment: "eşim araştırdı bu sette karar kıldı, 3 aydır kampta sorunsuz",
        date: "2026-06-17",
      },
      {
        name: "Umut Karagöz",
        masked: false,
        rating: 4,
        comment: "güzel paket",
        date: "2026-07-02",
      },
    ],
  },

  // ============================================================
  // Solar Operatör Paketi — ek 5 yorum
  // ============================================================
  {
    label: "Solar Operatör Paketi (ek)",
    type: "bundle",
    keywords: ["operatör", "operator"],
    reviews: [
      {
        name: "Taner Kısa",
        masked: true,
        rating: 5,
        comment: "kış kampında bile panel iş gördü, istasyon zaten sağlam",
        date: "2025-12-15",
      },
      {
        name: "Bora Sayar",
        masked: true,
        rating: 5,
        comment: "saha işlerinde kullanıyoruz, ekipmanlar gün boyu şarjda. paket fiyatı ayrı almaktan iyi",
        date: "2026-01-12",
      },
      {
        name: "Salih Ertem",
        masked: false,
        rating: 4,
        comment: "iyi set, tavsiye ederim",
        date: "2026-03-06",
      },
      {
        name: "Havva Çoban",
        masked: false,
        rating: 5,
        comment: "çiftliğe aldık, 2 aydır sorunsuz kullanıyoruz",
        date: "2026-05-26",
      },
      {
        name: "Buket Alkan",
        masked: true,
        rating: 5,
        comment: "babam bağda kullanıyor, çok memnun",
        date: "2026-07-14",
      },
    ],
  },

  // ============================================================
  // Solar Elite Paketi — ek 5 yorum
  // ============================================================
  {
    label: "Solar Elite Paketi (ek)",
    type: "bundle",
    keywords: ["elite", "elit"],
    reviews: [
      {
        name: "Sarp Erez",
        masked: true,
        rating: 5,
        comment: "yılbaşında kurduk, kar kesintisinde evi bu döndürdü",
        date: "2025-12-28",
      },
      {
        name: "Vedat Sinanoğlu",
        masked: true,
        rating: 5,
        comment: "ev için aldık, kesintide neredeyse her şey çalışıyor. panel dolumu hızlandırıyor",
        date: "2026-02-22",
      },
      {
        name: "Emine Sözlü",
        masked: true,
        rating: 5,
        comment: "on numara paket",
        date: "2026-04-30",
      },
      {
        name: "İnci Yaman",
        masked: false,
        rating: 5,
        comment: "fiyatı düşündürdü ama kalitesi belli, pişman değiliz",
        date: "2026-06-08",
      },
      {
        name: "Cenk Baturalp",
        masked: false,
        rating: 4,
        comment: "kaliteli set, kargo sağlam geldi",
        date: "2026-07-18",
      },
    ],
  },

  // ============================================================
  // Solar Veteran Paketi — ek 5 yorum
  // ============================================================
  {
    label: "Solar Veteran Paketi (ek)",
    type: "bundle",
    keywords: ["veteran"],
    reviews: [
      {
        name: "Orçun Sever",
        masked: true,
        rating: 5,
        comment: "400w panel bu istasyona tam uyum, kışın bile doldurdu",
        date: "2025-12-10",
      },
      {
        name: "Nevzat Kılıçarslan",
        masked: true,
        rating: 5,
        comment: "p3200 tekerlekli olduğu için yerleşimi de kolay, panelle beraber bağ evinde tam sistem oldu",
        date: "2026-01-19",
      },
      {
        name: "Mahir Özden",
        masked: false,
        rating: 4,
        comment: "güzel paket, sorunsuz",
        date: "2026-03-17",
      },
      {
        name: "Aygül Demirbaş",
        masked: false,
        rating: 5,
        comment: "sallanan beşik ve mama makineleri için aldım, kesinti derdimiz kalmadı",
        date: "2026-05-19",
      },
      {
        name: "Feyza Kurnaz",
        masked: true,
        rating: 5,
        comment: "çok memnunuz, komşuya da tavsiye ettik o da aldı",
        date: "2026-07-06",
      },
    ],
  },

  // ============================================================
  // Solar Titan Paket (SH4000 + 800W Solar) — 5 yorum (ilk kez)
  // ============================================================
  {
    label: "Solar Titan Paket",
    type: "bundle",
    keywords: ["titan"],
    reviews: [
      {
        name: "Erol Tanrıverdi",
        masked: true,
        rating: 5,
        comment: "jeneratörü sattık, yerine bu geldi. ne mazot ne gürültü",
        date: "2025-12-20",
      },
      {
        name: "Şahin Erkoç",
        masked: true,
        rating: 5,
        comment:
          "evin tamamını taşıyan sistem, 800w panelle dolum da ciddi hızlı. kesintili bölgedeyiz, hayatımız değişti",
        date: "2026-02-06",
      },
      {
        name: "Sema Akbaş",
        masked: true,
        rating: 5,
        comment: "eşimin işyerine kurduk, soğuk hava dolapları güvende artık",
        date: "2026-04-25",
      },
      {
        name: "Gülten Sarp",
        masked: false,
        rating: 5,
        comment: "çiftlikte kullanıyoruz, her şey çalışıyor",
        date: "2026-06-21",
      },
      {
        name: "Hikmet Yalın",
        masked: false,
        rating: 4,
        comment: "sağlam sistem",
        date: "2026-07-11",
      },
    ],
  },

  // ============================================================
  // 10.24 kWh SH4000 Enerji Depolama Paketi — 5 yorum (ilk kez)
  // ============================================================
  {
    label: "SH4000 ESS Paketi",
    type: "bundle",
    keywords: ["enerji-paketi", "enerji depolama", "kwh"],
    reviews: [
      {
        name: "Yalçın Koru",
        masked: true,
        rating: 5,
        comment: "kış boyu sorunsuz çalıştı, modül eklenebilir olması geleceğe yatırım",
        date: "2025-12-22",
      },
      {
        name: "Sabri Denizci",
        masked: true,
        rating: 5,
        comment:
          "kapasite dev gibi, iki günlük kesintiyi bile götürür. hibrit inverter ile kurulum profesyonel oldu",
        date: "2026-01-28",
      },
      {
        name: "Fulya Sağ",
        masked: true,
        rating: 4,
        comment: "sistem başarılı, kurulumda satıcı destek oldu",
        date: "2026-03-26",
      },
      {
        name: "Nurten Ateşoğlu",
        masked: false,
        rating: 5,
        comment: "müstakil eve kurduk, elektrik faturası da düştü kesinti derdi de bitti",
        date: "2026-05-13",
      },
      {
        name: "Cemal Ilıcalı",
        masked: false,
        rating: 5,
        comment: "atölyeye kurduk, makineler kesintide durmuyor. memnunuz",
        date: "2026-07-15",
      },
    ],
  },
];
