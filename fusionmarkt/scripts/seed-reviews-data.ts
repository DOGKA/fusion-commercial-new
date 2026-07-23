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
 */

export type SeedReview = {
  name: string; // Gerçek görünümlü ad soyad (kullanıcı kaydı bu isimle açılır)
  masked: boolean;
  rating: 4 | 5;
  title?: string;
  comment: string;
  daysAgo: number;
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
        title: "güçlü ama hantal",
        comment:
          "gücü tartışılmaz, evin ihtiyacını görüyor. 4 yıldızımın tek sebebi taşımasının zor olması, iki kişi lazım. sabit kullanacaksanız hiç düşünmeyin",
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
          "sistem sağlam, kurulumu kolay. tek dezavantajı toplam ağırlık, sabit kurulum düşünün derim. mobil kullanım için küçük paketler daha mantıklı",
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
];
