export interface PartnerFeature {
  icon: string;
  title: string;
  description: string;
}

export interface Partner {
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  heroImage?: string;
  about: string[];
  features: PartnerFeature[];
  categories: string[];
  mission?: string;
  vision?: string;
  extraSection?: {
    title: string;
    content: string;
  };
  useCases?: string[];
  globalService?: string[];
  website?: string;
  productLink: string;
}

export const partners: Record<string, Partner> = {
  "ieetek": {
    slug: "ieetek",
    name: "IEETek",
    tagline: "Güneş Enerjisi Depolama Çözümlerinin Lideri",
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765898303842-jrbbwi-ieetek-logo-white.png",
    about: [
      "Zhuhai İlk Entropy Energy Co., Ltd. (IEETek), güneş enerjisi depolama çözümlerinin lider sağlayıcısı ve üreticisidir. Dünya çapında evler, işletmeler ve bireysel kullanıcılar için emniyetli, güvenilir ve temiz enerji çözümleri sunmaktadır.",
      "10.000 metrekarelik Ar-Ge merkezi ve akıllı fabrikası ile IEETek, enerji teknolojisi alanında ortalama 15 yılı aşkın deneyime sahip mühendis kadrosuyla sektörde öncü konumdadır.",
      "Ürünleri ABD, Japonya, Almanya, Birleşik Krallık, Avustralya, Türkiye ve 20'den fazla ülkeye ihraç edilmektedir.",
      "IEETek, LiFePO4 batarya teknolojisi ile 4000+ döngü ömrü sunan ürünleriyle, taşınabilir güç istasyonlarından ev tipi enerji depolama sistemlerine kadar geniş bir ürün yelpazesi sunmaktadır."
    ],
    features: [
      { icon: "sun", title: "Güneş Enerjisi Depolama", description: "Ev ve işletmeler için yenilenebilir enerji çözümleri" },
      { icon: "battery", title: "Taşınabilir Güç İstasyonları", description: "Her senaryoya uygun mobil enerji sistemleri" },
      { icon: "zap", title: "Güç Dönüşüm Sistemleri", description: "PCS, BMS ve HEMS teknolojileri" },
      { icon: "factory", title: "10.000m² Akıllı Fabrika", description: "Zhuhai, Çin merkezli üretim tesisi" }
    ],
    categories: [
      "Taşınabilir Hepsi Bir Arada ESS",
      "Taşınabilir Güç İstasyonu",
      "Güneş Jeneratörü",
      "Bölünmüş Fazlı Taşınabilir Güç İstasyonu",
      "İstiflenebilir Taşınabilir Güç İstasyonu",
      "Taşınabilir Güneş Paneli"
    ],
    useCases: [
      "Kamp ve Outdoor",
      "Acil Durum Yedekleme",
      "Karavan ve Tekne",
      "Ev Enerji Depolama",
      "Profesyonel Kullanım",
      "Off-Grid Yaşam"
    ],
    mission: "Sürdürülebilir yeşil yaşamı herkes için erişilebilir kılmak.",
    vision: "Küresel enerji devriminde önemli bir rol oynamak ve değişimin itici gücü olmak.",
    website: "https://www.ieetek.com",
    productLink: "/urunler?marka=ieetek"
  },
  
  "rgp-balls": {
    slug: "rgp-balls",
    name: "RGP Balls",
    tagline: "Avrupa'nın Lider Hassas Bilya Üreticisi",
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765898303622-oblcj-rgp-logo-white.svg",
    about: [
      "50 yılı aşkın süredir RGP Balls, hassas bilyalar, makaralar ve bilya transfer üniteleri üretimi, ticareti ve dağıtımında Avrupa'nın lider şirketleri arasında yer almaktadır.",
      "İtalya, Cinisello Balsamo'daki merkezimizde 70'ten fazla çalışanımız ve 10.000 m²'lik tesisimiz ile yenilikçi çözümler sunmaya devam ediyoruz.",
      "\"Dağları hareket ettirmek için detayları mükemmelleştiriyoruz\" - Her şey kalite ile ilgili.",
      "5.000 ton stok kapasitesi ile hızlı teslimat garantisi sunuyoruz. ISO sertifikalı üretim süreçlerimiz, uluslararası kalite standartlarına tam uyumu sağlamaktadır."
    ],
    features: [
      { icon: "clock", title: "50+ Yıllık Deneyim", description: "Yarım asrı aşkın sektör tecrübesi" },
      { icon: "package", title: "5.000 Ton Stok", description: "Geniş ürün yelpazesi ve hızlı teslimat" },
      { icon: "users", title: "3.000+ Müşteri", description: "Dünya çapında güvenilir ortaklıklar" },
      { icon: "award", title: "ISO Sertifikalı", description: "Uluslararası kalite standartları" }
    ],
    categories: [
      "Çelik Bilyalar",
      "Metal Alaşım Bilyaları",
      "Plastik Bilyalar",
      "Seramik Bilyalar",
      "Kauçuk Bilyalar",
      "Cam Bilyalar",
      "Özel Bilyalar",
      "Bilya Transfer Üniteleri",
      "Silindirik Makaralar"
    ],
    useCases: [
      "Otomotiv",
      "Havacılık",
      "Medikal",
      "Endüstriyel Makine",
      "Gıda İşleme",
      "Enerji Sektörü"
    ],
    extraSection: {
      title: "Global Hizmet",
      content: "Ekibimiz İtalyanca, Almanca, İngilizce, Fransızca, İspanyolca, Ukraynaca, Rusça, Çince ve Romence dillerinde hizmet vermektedir. Uzmanlık, metot ve hız - bu üç değer RGP Balls'un temelini oluşturur."
    },
    website: "https://www.rgpballs.com",
    productLink: "/urunler?marka=rgp-balls"
  },
  
  "telesteps": {
    slug: "telesteps",
    name: "Telesteps",
    tagline: "Teleskopik Merdiven Teknolojisinde Devrim",
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765898302743-wbcw3c-telescopics-white.png",
    about: [
      "Telesteps merdivenleri, merdiven tasarımı ve teknolojisinde devrim niteliğinde bir atılımdır. TAŞIMASI KOLAY, KULLANIMI KOLAY, DEPOLAMASI KOLAY prensipleriyle üretilen merdivenler, birçok sektörde kullanılmaktadır.",
      "Dünyanın ilk ve tek iletken olmayan Kevlar® Teleskopik Merdivenleri ile yüksek voltaj ortamlarında maksimum güvenlik sağlanmaktadır. DuPont™ Kevlar® ile üretilen bu merdivenler, elektrik güvenliği için tasarlanmıştır.",
      "Patentli Tek Dokunuş teknolojisi sayesinde merdiven kilitlendiğinde, Tek Dokunuşla Serbest Bırakma Düğmelerini sıkıştırarak basamakları orijinal kompakt boyutuna kolayca indirebilirsiniz.",
      "Güvenlik Gösterge Penceresi sistemi ile KIRMIZI tırmanmayın, YEŞİL tırmanmak güvenli demektir prensibi uygulanmaktadır."
    ],
    features: [
      { icon: "minimize", title: "Teleskopik Tasarım", description: "Taşıması kolay, kullanımı pratik, depolaması zahmetsiz" },
      { icon: "shield", title: "Güvenlik Göstergesi", description: "Kırmızı/Yeşil güvenlik penceresi sistemi" },
      { icon: "pointer", title: "Tek Dokunuş", description: "Patentli tek dokunuşla açma/kapama mekanizması" },
      { icon: "plane", title: "Havacılık Alüminyumu", description: "Uçak kalitesinde alüminyum malzeme" }
    ],
    categories: [
      "Kevlar Teleskopik Merdivenler",
      "Kombi Merdivenler",
      "Uzatma Merdivenleri",
      "Çatı/Tavan Merdivenleri",
      "STIK Merdivenler",
      "Basamak Tabureleri"
    ],
    useCases: [
      "İnşaat",
      "Güneş Enerjisi Kurulum",
      "Karavan",
      "Kolluk Kuvvetleri",
      "Askeri",
      "Devlet Kurumları",
      "Ev Sahipleri",
      "Müfettişler",
      "Güvenlik",
      "Tarım",
      "Bina Bakımı",
      "Avcılar",
      "Endüstriyel Kurulum"
    ],
    extraSection: {
      title: "Güvenlik Gösterge Penceresi",
      content: "Güvenliğinizi ciddiye alıyoruz. KIRMIZI tırmanmayın, YEŞİL tırmanmak güvenli demektir. Patentli Tek Dokunuş teknolojisi ile merdiveninizi saniyeler içinde kompakt hale getirin."
    },
    website: "https://telestepsladders.com",
    productLink: "/urunler?marka=telesteps"
  },
  
  "traffi": {
    slug: "traffi",
    name: "Traffi Gloves",
    tagline: "El Koruma Alanında Sektör Lideri",
    logo: "https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1765962257332-0dpfvn-traffi-black-logo.svg",
    about: [
      "Traffi, el koruma uzmanları ve kesime dayanıklı iş eldivenleri konusunda sektör lideri sağlayıcısıdır. Güvenlik ve sürdürülebilirliği ön planda tutan müşteriler için tercih edilen el koruma ortağıdır.",
      "3 Renkli TraffiSystem'in orijinal mucitleri olarak, müşteri odaklı yaklaşımımız ve Sınıfının En İyisi ürünler sunma kararlılığımızla yolumuza öncülük etmeye devam ediyoruz.",
      "Sürdürülebilirlikte öncü olmaya olan tutkumuz, geleceğimizin temelidir. FOR HANDS. FOR LIFE.",
      "British Safety Industry Federation (BSIF) ve Registered Safety Supplier Scheme (RSSS) üyesiyiz. Bu, size sağladığımız tüm ürünlerin ilgili mevzuat ve standartlara tam uyumlu olduğu konusunda tam bir gönül rahatlığı sağlar.",
      "TraffiSystem - Renk Kodlu Güvenlik: İş kazalarını azaltmak için herkesin doğru KKD giydiğinden emin olmak hayati önem taşır. Yeşil = Düşük Risk, Amber = Orta Risk, Kırmızı = Yüksek Risk."
    ],
    features: [
      { icon: "hand", title: "El Koruma Uzmanı", description: "Kesime dayanıklı iş eldivenleri konusunda sektör lideri" },
      { icon: "palette", title: "TraffiSystem", description: "3 renkli devrim niteliğinde güvenlik eldiven sistemi" },
      { icon: "leaf", title: "Sürdürülebilirlik", description: "SBTi onaylı karbon nötr hedefleri" },
      { icon: "badge", title: "BSIF Üyesi", description: "British Safety Industry Federation akreditasyonu" }
    ],
    categories: [
      "Güvenlik Eldivenleri",
      "LXT Eldivenleri",
      "Tek Kullanımlık Eldiven",
      "Kesime Dayanıklı Eldiven",
      "Kimyasal Dayanıklı Eldiven",
      "Isı Dayanıklı Eldiven"
    ],
    useCases: [
      "İnşaat",
      "Otomotiv",
      "Cam İşleme",
      "Metal İşleme",
      "Gıda İşleme",
      "Petrokimya",
      "Lojistik",
      "Maden"
    ],
    extraSection: {
      title: "TraffiSystem - Renk Kodlu Güvenlik",
      content: "İş kazalarını azaltmak için herkesin doğru KKD giydiğinden emin olmak hayati önem taşır. Yeşil = Düşük Risk (hafif kesik riski), Amber = Orta Risk (orta düzey kesik riski), Kırmızı = Yüksek Risk (yüksek kesik riski)."
    },
    website: "https://www.traffiglove.com",
    productLink: "/urunler?marka=traffi"
  }
};

export function getPartnerBySlug(slug: string): Partner | undefined {
  return partners[slug];
}

export function getAllPartnerSlugs(): string[] {
  return Object.keys(partners);
}
