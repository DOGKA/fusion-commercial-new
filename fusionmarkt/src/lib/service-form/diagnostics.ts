/**
 * Servis formunun teşhis adımı: koşullu soru seti + doğrulama.
 *
 * Ürün kataloğu `models.ts` içinde; bu dosya yalnızca anket sorularını
 * tutar ve Adım 2 chunk'ında yüklenir.
 */

import type {
  DiagnosticAnswers,
  ProductCategoryId,
  ProductModel,
} from "./models";

export type {
  ProductCategoryId,
  ProductCategory,
  ProductModel,
  ModelTrait,
  DiagnosticAnswers,
} from "./models";

export {
  PRODUCT_CATEGORIES,
  PRODUCT_MODELS,
  getModelsByCategory,
  findModel,
  getCategoryLabel,
} from "./models";

/** Admin paneli ve e-posta için saklanan diagnostics JSON şekli. */
export type StoredDiagnostics = {
  answers: DiagnosticAnswers;
  summary: { group: string; label: string; value: string }[];
};

/**
 * Tarih soruları ya `YYYY-MM-DD` biçiminde kesin bir tarih ya da bu sabiti
 * tutar. Kullanıcı günü hatırlamıyorsa kesin tarihe zorlamak yerine bunu
 * seçebiliyor; "Bugün" seçeneği de bugünün tarihi olarak kaydediliyor, çünkü
 * talep birkaç gün sonra okunduğunda "bugün" anlamını yitiriyor.
 */
export const APPROX_DATE_LABEL = "Birkaç gün önce";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function formatAnswerDate(value: string): string {
  if (!ISO_DATE.test(value)) return value;
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

export type QuestionType = "single" | "multi" | "text" | "textarea" | "date";

export type DiagnosticQuestion = {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  /** Seçenekleri modelden türeten sorular (çıkış portları gibi). */
  optionsFor?: (model: ProductModel) => string[];
  /** Seçildiğinde diğer tüm seçenekleri temizleyen "hiçbiri" tipi cevaplar. */
  exclusiveOptions?: string[];
  hint?: string;
  hintFor?: (model: ProductModel) => string | undefined;
  placeholder?: string;
  required?: boolean;
  showIf?: (answers: DiagnosticAnswers, model: ProductModel) => boolean;
};

export type DiagnosticGroup = {
  id: string;
  title: string;
  description?: string;
  category: ProductCategoryId;
  questions: DiagnosticQuestion[];
};

const has = (answers: DiagnosticAnswers, id: string, value: string): boolean => {
  const answer = answers[id];
  return Array.isArray(answer) ? answer.includes(value) : answer === value;
};

const NONE_OF_THESE = "Hiçbiri";

const POWER_STATION_GROUPS: DiagnosticGroup[] = [
  {
    id: "usage",
    title: "Kullanım Geçmişi",
    description: "Arızanın ne zaman ve hangi koşullarda ortaya çıktığını anlamamıza yardımcı olur.",
    category: "power-station",
    questions: [
      {
        id: "workedOnArrival",
        label: "Cihaz size ulaştığında sorunsuz çalışıyor muydu?",
        type: "single",
        required: true,
        options: [
          "Evet, sorunsuz çalıştı",
          "Hayır, kutudan çıktığında da çalışmadı",
        ],
      },
      {
        id: "lastUsedDate",
        label: "Cihazı en son hangi tarihte çalıştırdınız?",
        type: "date",
        required: true,
        hint: "Günü tam hatırlamıyorsanız \"Birkaç gün önce\" seçeneğini kullanabilirsiniz.",
      },
      {
        id: "faultStartDate",
        label: "Arıza ilk hangi tarihte ortaya çıktı?",
        type: "date",
        required: true,
        showIf: (a) => !has(a, "workedOnArrival", "Hayır, kutudan çıktığında da çalışmadı"),
      },
      {
        id: "faultTrigger",
        label: "Arıza belirli bir olaydan sonra mı başladı?",
        type: "single",
        required: true,
        options: [
          "Hayır, kendiliğinden başladı",
          "Düşme veya darbeden sonra",
          "Su veya neme maruz kaldıktan sonra",
          "Aşırı yük bağladıktan sonra",
          "Solar panel bağladıktan sonra",
          "Jeneratörle şarj ettikten sonra",
        ],
      },
      {
        id: "frequency",
        label: "Sorun ne sıklıkta yaşanıyor?",
        type: "single",
        required: true,
        options: ["Her seferinde", "Ara sıra, belirli durumlarda", "Yalnızca bir kez oldu"],
      },
      {
        id: "longStorage",
        label: "Cihaz 3 aydan uzun süre şarj edilmeden bekletildi mi?",
        type: "single",
        required: true,
        hint: "Uzun süre şarj edilmeden bekleyen lityum bataryalarda koruma devresi cihazı uyku moduna alabilir. Bu bilgi teşhis için önemlidir.",
        options: ["Evet", "Hayır", "Emin değilim"],
      },
      {
        id: "storageChargeLevel",
        label: "Bekletmeye başlarken şarj seviyesi yaklaşık ne kadardı?",
        type: "single",
        showIf: (a) => has(a, "longStorage", "Evet"),
        options: ["%80 üzeri", "%50 - %80", "%20 - %50", "%20 altı", "Bilmiyorum"],
      },
      {
        id: "conditions",
        label: "Cihaz aşağıdaki koşullardan hangilerine maruz kaldı?",
        type: "multi",
        required: true,
        exclusiveOptions: [NONE_OF_THESE],
        options: [
          "0°C altı ortamda kaldı",
          "45°C üstü ortamda veya doğrudan güneş altında kaldı",
          "Yağmur, nem veya suya maruz kaldı",
          "Düşme veya darbe aldı",
          "Kapalı, tozlu bir alanda havalandırmasız çalıştı",
          NONE_OF_THESE,
        ],
      },
    ],
  },
  {
    id: "input",
    title: "Giriş (Şarj) Tarafı",
    description: "Arıza sırasında cihazın nereden beslendiğini belirtin.",
    category: "power-station",
    questions: [
      {
        id: "inputSources",
        label: "Arıza öncesinde veya sırasında cihazın giriş kısmına ne bağlıydı?",
        type: "multi",
        required: true,
        exclusiveOptions: ["Hiçbiri, cihaz boştaydı"],
        options: [
          "Şebeke AC şarj (priz)",
          "Solar panel (MPPT girişi)",
          "Araç 12V çakmak girişi",
          "Jeneratör",
          "Hiçbiri, cihaz boştaydı",
        ],
      },
      {
        id: "solarPanelModel",
        label: "Hangi solar panel bağlıydı?",
        type: "single",
        required: true,
        showIf: (a) => has(a, "inputSources", "Solar panel (MPPT girişi)"),
        options: [
          "FusionMarkt SP100 (100 W)",
          "FusionMarkt SP200 (200 W)",
          "FusionMarkt SP400 (400 W)",
          "Başka marka / model",
        ],
      },
      {
        id: "solarPanelOther",
        label: "Panelin markası, modeli ve açık devre voltajı (Voc)",
        type: "text",
        required: true,
        placeholder: "Örn: XYZ 200W, Voc 24V",
        hint: "Voc değeri panelin arkasındaki etikette yazar. Bulamıyorsanız marka ve modeli yazmanız yeterlidir.",
        showIf: (a) => has(a, "solarPanelModel", "Başka marka / model"),
      },
      {
        id: "solarSetup",
        label: "Kaç panel ve nasıl bağlıydı?",
        type: "single",
        required: true,
        showIf: (a) => has(a, "inputSources", "Solar panel (MPPT girişi)"),
        options: [
          "Tek panel",
          "2 panel — seri bağlı",
          "2 panel — paralel bağlı",
          "3 veya daha fazla panel",
          "Bilmiyorum",
        ],
      },
      {
        id: "solarInputPort",
        label: "Hangi solar girişi kullanıldı?",
        type: "single",
        required: true,
        showIf: (a, model) =>
          model.traits.includes("dualMppt") && has(a, "inputSources", "Solar panel (MPPT girişi)"),
        hint: "Cihazın iki ayrı solar girişi vardır. Kullandığınız girişin üzerindeki etikete bakabilirsiniz.",
        options: ["HV MC4 girişi (70-450V)", "LV XT60 girişi (12-50V)", "Bilmiyorum"],
      },
      {
        id: "generatorType",
        label: "Kullanılan jeneratör saf sinüs (pure sine wave) çıkışlı mı?",
        type: "single",
        required: true,
        showIf: (a) => has(a, "inputSources", "Jeneratör"),
        options: ["Evet, saf sinüs", "Hayır / modifiye sinüs", "Bilmiyorum"],
      },
      {
        id: "chargingStatus",
        label: "Cihaz şu anda şarj alıyor mu?",
        type: "single",
        required: true,
        options: [
          "Evet, normal şarj oluyor",
          "Şarj oluyor ama çok yavaş",
          "Ekranda şarj görünüyor ama yüzde artmıyor",
          "Hayır, hiç şarj almıyor",
          "Denemedim",
        ],
      },
      {
        id: "chargingWatt",
        label: "Şarj sırasında ekranda görünen giriş gücü (W)",
        type: "text",
        placeholder: "Örn: 600 W",
        showIf: (a, model) =>
          model.traits.includes("screen") && !has(a, "chargingStatus", "Hayır, hiç şarj almıyor"),
      },
    ],
  },
  {
    id: "output",
    title: "Çıkış (Yük) Tarafı",
    description: "Arıza anında cihaza bağlı olan yükleri belirtin.",
    category: "power-station",
    questions: [
      {
        id: "activeOutputs",
        label: "Arıza anında hangi çıkışlar kullanılıyordu?",
        type: "multi",
        required: true,
        exclusiveOptions: ["Hiçbiri, çıkışlar boştaydı"],
        optionsFor: (model) => [...(model.outputs ?? []), "Hiçbiri, çıkışlar boştaydı"],
      },
      {
        id: "connectedLoad",
        label: "Çıkışa bağlı olan cihazları yazınız",
        type: "textarea",
        required: true,
        placeholder: "Örn: Buzdolabı 150W + LED TV 100W + modem 10W",
        hint: "Bağlı olan tüm cihazları ve etiketlerinde yazan güç değerini (W) yazın. Etiketi bulamıyorsanız yalnızca cihazın adını yazmanız yeterlidir. Birden fazla cihaz bağlıysa hepsini belirtin — hangi yükün arızayı tetiklediğini bulmamız buna bağlı.",
        showIf: (a) => !has(a, "activeOutputs", "Hiçbiri, çıkışlar boştaydı"),
      },
      {
        id: "totalLoadWatt",
        label: "Bağlı yüklerin toplam gücü yaklaşık kaç W idi?",
        type: "text",
        placeholder: "Örn: 850 W",
        showIf: (a) => !has(a, "activeOutputs", "Hiçbiri, çıkışlar boştaydı"),
      },
      {
        id: "motorLoad",
        label: "Bağlı yükler arasında motorlu veya kompresörlü cihaz var mıydı?",
        type: "single",
        required: true,
        hint: "Buzdolabı, klima, su pompası, kompresör ve elektrikli el aletleri ilk çalışma anında etiket değerinin birkaç katı güç çeker.",
        options: ["Evet", "Hayır", "Bilmiyorum"],
        showIf: (a) => !has(a, "activeOutputs", "Hiçbiri, çıkışlar boştaydı"),
      },
      {
        id: "faultyOutput",
        label: "Sorun hangi tarafta yaşanıyor?",
        type: "single",
        required: true,
        options: [
          "Sadece AC prizlerde",
          "Sadece USB çıkışlarında",
          "Sadece DC / araç çıkışında",
          "Tüm çıkışlarda",
          "Çıkışlarda değil, şarj tarafında",
          "Cihaz hiç açılmadığı için test edemiyorum",
        ],
      },
      {
        id: "outputBehavior",
        label: "Yük bağlandığında cihaz nasıl davranıyor?",
        type: "single",
        required: true,
        options: [
          "Hiç çıkış vermiyor",
          "Çıkış veriyor ama kısa sürede kesiliyor",
          "Yük bağlanır bağlanmaz cihaz kapanıyor",
          "Çalışıyor ama batarya beklenenden çok hızlı bitiyor",
          "Uyarı sesi verip çıkışı kapatıyor",
          "Bu durumla ilgisi yok",
        ],
      },
    ],
  },
  {
    id: "symptoms",
    title: "Cihaz Belirtileri",
    description: "Cihazın şu anki fiziksel durumunu işaretleyin.",
    category: "power-station",
    questions: [
      {
        id: "powerOn",
        label: "Cihaz açılıyor mu?",
        type: "single",
        required: true,
        options: [
          "Normal açılıyor",
          "Açılıyor ama çıkış vermiyor",
          "Açılıp hemen kapanıyor",
          "Güç tuşuna basınca hiçbir tepki vermiyor",
        ],
      },
      {
        id: "screenState",
        label: "Cihazın ekranı nasıl davranıyor?",
        type: "single",
        required: true,
        showIf: (_a, model) => model.traits.includes("screen"),
        options: [
          "Normal çalışıyor",
          "Hiç yanmıyor",
          "Yanıp sönüyor",
          "Kısmen görünüyor / eksik segmentler var",
          "Anormal veya hatalı değer gösteriyor",
        ],
      },
      {
        id: "errorCode",
        label: "Ekranda hata kodu veya uyarı sembolü görünüyor mu?",
        type: "text",
        placeholder: "Örn: E03 / kırmızı üçgen uyarı",
        hint: "Görünüyorsa buraya yazın ve son adımda ekranın fotoğrafını da yükleyin. Görünmüyorsa boş bırakabilirsiniz.",
        showIf: (_a, model) => model.traits.includes("screen"),
      },
      {
        id: "fanState",
        label: "Cihazın fanı çalışıyor mu?",
        type: "single",
        required: true,
        showIf: (_a, model) => model.traits.includes("fan"),
        options: [
          "Normal çalışıyor",
          "Hiç çalışmıyor",
          "Sürekli yüksek devirde çalışıyor",
          "Anormal ses çıkarıyor",
          "Fark etmedim",
        ],
      },
      {
        id: "ledPanelState",
        label: "Cihaz üzerindeki LED panel / gösterge ışıkları yanıyor mu?",
        type: "single",
        required: true,
        showIf: (_a, model) => model.traits.includes("ledPanel"),
        options: [
          "Normal yanıyor",
          "Hiç yanmıyor",
          "Yanıp sönüyor",
          "Bir kısmı yanmıyor",
          "Normalden farklı renkte yanıyor",
        ],
      },
      {
        id: "outputSwitches",
        label: "Cihazın AC ve DC çıkış anahtarları açık konumda mı?",
        type: "single",
        required: true,
        hint: "Bu cihazlarda çıkışlar ayrı anahtarlarla açılır. Anahtar kapalıyken cihaz açık görünse de priz ve DC çıkışları çalışmaz.",
        options: [
          "Evet, ikisi de açık",
          "AC açık, DC kapalı",
          "DC açık, AC kapalı",
          "Emin değilim / anahtarları bulamadım",
        ],
      },
      {
        id: "soundSmell",
        label: "Cihazdan anormal bir ses veya koku geliyor mu?",
        type: "multi",
        required: true,
        exclusiveOptions: ["Hayır, yok"],
        options: [
          "Hayır, yok",
          "Röle tıkırtısı / sürekli klik sesi",
          "Cızırtı veya çıtırtı",
          "Yüksek uğultu / vınlama",
          "Yanık kokusu",
        ],
      },
      {
        id: "physicalState",
        label: "Cihazın dış görünümünde bir sorun var mı?",
        type: "multi",
        required: true,
        exclusiveOptions: ["Sorun yok"],
        options: [
          "Sorun yok",
          "Gövdede şişme veya deformasyon",
          "Sızıntı veya akıntı",
          "Kırık, çatlak veya darbe izi",
          "Port / konnektör hasarlı",
          "Ekran camı çatlak",
        ],
      },
      {
        id: "overheating",
        label: "Cihaz aşırı ısınıyor mu?",
        type: "single",
        required: true,
        options: [
          "Hayır",
          "Evet, yük verirken",
          "Evet, şarj olurken",
          "Evet, boştayken bile",
          "Fark etmedim",
        ],
      },
    ],
  },
  {
    id: "app",
    title: "Uygulama Bağlantısı",
    category: "power-station",
    questions: [
      {
        id: "appConnection",
        label: "Cihaza mobil uygulamadan bağlanabiliyor musunuz?",
        type: "single",
        required: true,
        showIf: (_a, model) => model.traits.includes("app"),
        options: [
          "Evet, sorunsuz bağlanıyor",
          "Hayır, uygulama cihazı bulamıyor",
          "Bağlanıyor ama veri gelmiyor / donuyor",
          "Denemedim",
        ],
      },
      {
        id: "appReading",
        label: "Uygulamada görünen batarya yüzdesi ve varsa hata mesajı",
        type: "text",
        placeholder: "Örn: %0 gösteriyor, 'iletişim hatası' yazıyor",
        showIf: (a, model) =>
          model.traits.includes("app") && !has(a, "appConnection", "Denemedim"),
      },
    ],
  },
  {
    id: "expansion",
    title: "Genişletme Bataryası",
    category: "power-station",
    questions: [
      {
        id: "hostDevice",
        label: "Batarya hangi ana cihaza bağlı?",
        type: "text",
        required: true,
        placeholder: "Örn: SH4000",
        showIf: (_a, model) => model.traits.includes("expansionBattery"),
      },
      {
        id: "hostRecognizes",
        label: "Ana cihaz genişletme bataryasını görüyor mu?",
        type: "single",
        required: true,
        showIf: (_a, model) => model.traits.includes("expansionBattery"),
        options: [
          "Evet, kapasite artmış görünüyor",
          "Hayır, hiç görmüyor",
          "Görüyor ama şarj olmuyor",
          "Görüyor ama deşarj olmuyor",
          "Aralıklı görüyor, bağlantı kesiliyor",
        ],
      },
      {
        id: "expansionIndicator",
        label: "Batarya üzerindeki gösterge ışıkları nasıl davranıyor?",
        type: "single",
        required: true,
        showIf: (_a, model) => model.traits.includes("expansionBattery"),
        options: ["Normal yanıyor", "Hiç yanmıyor", "Yanıp sönüyor", "Kırmızı / hata rengi yanıyor"],
      },
    ],
  },
  {
    id: "tried",
    title: "Denediğiniz Adımlar",
    category: "power-station",
    questions: [
      {
        id: "triedSteps",
        label: "Aşağıdakilerden hangilerini denediniz?",
        type: "multi",
        required: true,
        exclusiveOptions: ["Hiçbirini denemedim"],
        options: [
          "Güç tuşunu 10 saniye basılı tutarak sıfırlama",
          "AC şarja takıp en az 30 dakika bekleme",
          "Farklı priz ve farklı kablo ile deneme",
          "Tüm yükleri çıkarıp cihazı boşta çalıştırma",
          "Çıkış anahtarlarını kapatıp yeniden açma",
          "Hiçbirini denemedim",
        ],
      },
    ],
  },
];

const SOLAR_PANEL_GROUPS: DiagnosticGroup[] = [
  {
    id: "solar-usage",
    title: "Kullanım Geçmişi",
    category: "solar-panel",
    questions: [
      {
        id: "workedOnArrival",
        label: "Panel size ulaştığında sorunsuz çalışıyor muydu?",
        type: "single",
        required: true,
        options: ["Evet, sorunsuz çalıştı", "Hayır, kutudan çıktığında da çalışmadı"],
      },
      {
        id: "lastUsedDate",
        label: "Paneli en son hangi tarihte kullandınız?",
        type: "date",
        required: true,
        hint: "Günü tam hatırlamıyorsanız \"Birkaç gün önce\" seçeneğini kullanabilirsiniz.",
      },
      {
        id: "faultStartDate",
        label: "Sorun ilk hangi tarihte ortaya çıktı?",
        type: "date",
        required: true,
        showIf: (a) => !has(a, "workedOnArrival", "Hayır, kutudan çıktığında da çalışmadı"),
      },
      {
        id: "faultTrigger",
        label: "Sorun belirli bir olaydan sonra mı başladı?",
        type: "single",
        required: true,
        options: [
          "Hayır, kendiliğinden başladı",
          "Fırtına veya dolu sonrası",
          "Düşme veya darbeden sonra",
          "Su birikintisinde kaldıktan sonra",
          "Katlayıp taşıdıktan sonra",
        ],
      },
    ],
  },
  {
    id: "solar-problem",
    title: "Sorunun Tanımı",
    category: "solar-panel",
    questions: [
      {
        id: "problemType",
        label: "Panelde yaşadığınız sorun nedir?",
        type: "single",
        required: true,
        options: [
          "Hiç güç üretmiyor",
          "Beklenenden çok az güç üretiyor",
          "Aralıklı çalışıyor, bağlantı kesiliyor",
          "Fiziksel hasar var",
          "Konnektör veya kablo sorunu",
        ],
      },
      {
        id: "connectedDevice",
        label: "Panel hangi cihaza bağlıydı?",
        type: "single",
        required: true,
        options: [
          "FusionMarkt taşınabilir güç kaynağı",
          "Şarj kontrol cihazı (regülatör)",
          "Başka marka güç kaynağı veya invertör",
          "Doğrudan aküye",
          "Hiçbiri, test etmedim",
        ],
      },
      {
        id: "connectedDeviceModel",
        label: "Bağlı olduğu cihazın modeli",
        type: "text",
        required: true,
        placeholder: "Örn: P3200",
        showIf: (a) => !has(a, "connectedDevice", "Hiçbiri, test etmedim"),
      },
      {
        id: "producedWatt",
        label: "Bağlı cihazın ekranında görünen üretim gücü (W)",
        type: "text",
        placeholder: "Örn: 35 W",
        showIf: (a) =>
          has(a, "problemType", "Beklenenden çok az güç üretiyor") ||
          has(a, "problemType", "Aralıklı çalışıyor, bağlantı kesiliyor"),
      },
      {
        id: "measuredVoc",
        label: "Multimetre ile ölçtüğünüz açık devre voltajı (Voc)",
        type: "text",
        placeholder: "Örn: 21.4 V",
        hintFor: (model) =>
          model.vocV
            ? `Panelinizin beklenen açık devre voltajı yaklaşık ${model.vocV} V'tur. Ölçüm için paneli güneşe çıkarın, hiçbir cihaza bağlamadan MC4 uçları arasındaki DC voltajı ölçün. Ölçüm yapamıyorsanız bu alanı boş bırakabilirsiniz.`
            : "Ölçüm için paneli güneşe çıkarın, hiçbir cihaza bağlamadan MC4 uçları arasındaki DC voltajı ölçün. Ölçüm yapamıyorsanız bu alanı boş bırakabilirsiniz.",
      },
    ],
  },
  {
    id: "solar-conditions",
    title: "Test Koşulları",
    description: "Panel verimi hava koşuluna ve açıya doğrudan bağlıdır.",
    category: "solar-panel",
    questions: [
      {
        id: "weather",
        label: "Test sırasındaki hava durumu nasıldı?",
        type: "single",
        required: true,
        options: [
          "Açık ve güneşli",
          "Parçalı bulutlu",
          "Kapalı / bulutlu",
          "Sabah veya akşam, güneş alçaktayken",
        ],
      },
      {
        id: "shading",
        label: "Panel üzerinde gölge veya kirlilik var mıydı?",
        type: "single",
        required: true,
        options: [
          "Hayır, panel temiz ve tamamen güneşteydi",
          "Bir kısmı gölgedeydi",
          "Ağaç veya bina gölgesi vardı",
          "Panel yüzeyi kirli / tozluydu",
        ],
      },
      {
        id: "panelAngle",
        label: "Panel güneşe doğru yönlendirilmiş miydi?",
        type: "single",
        required: true,
        options: [
          "Evet, ayaklar açıktı ve güneşe dönüktü",
          "Yere düz serilmişti",
          "Hayır / dikkat etmedim",
        ],
      },
    ],
  },
  {
    id: "solar-physical",
    title: "Fiziksel Durum",
    category: "solar-panel",
    questions: [
      {
        id: "physicalState",
        label: "Panelde gözle görülür bir hasar var mı?",
        type: "multi",
        required: true,
        exclusiveOptions: ["Hasar yok"],
        options: [
          "Hasar yok",
          "Panel yüzeyinde çatlak veya kırık",
          "Laminat kabarması / delinme",
          "Katlama menteşesi veya dikişi yırtık",
          "Ayak / stand kırık",
          "Taşıma çantası veya fermuar hasarlı",
        ],
      },
      {
        id: "connectorState",
        label: "MC4 konnektör ve kablo durumu nasıl?",
        type: "single",
        required: true,
        options: [
          "Sorun yok",
          "Konnektör kırık veya gevşek",
          "Konnektör içine su girmiş / oksitlenmiş",
          "Kablo kesik, ezik veya yanmış",
          "Bağlantı sürekli gevşiyor",
        ],
      },
      {
        id: "waterExposure",
        label: "Panel suya maruz kaldı mı?",
        type: "single",
        required: true,
        options: [
          "Hayır",
          "Yağmura maruz kaldı",
          "Su birikintisinde kaldı veya suya düştü",
          "Bilmiyorum",
        ],
      },
    ],
  },
  {
    id: "solar-tried",
    title: "Denediğiniz Adımlar",
    category: "solar-panel",
    questions: [
      {
        id: "triedSteps",
        label: "Aşağıdakilerden hangilerini denediniz?",
        type: "multi",
        required: true,
        exclusiveOptions: ["Hiçbirini denemedim"],
        options: [
          "Farklı bir cihaza bağlayarak test ettim",
          "Farklı kablo veya uzatma ile denedim",
          "Konnektörleri temizleyip yeniden taktım",
          "Panel yüzeyini temizledim",
          "Panelin açısını değiştirerek denedim",
          "Hiçbirini denemedim",
        ],
      },
    ],
  },
];

export const DIAGNOSTIC_GROUPS: DiagnosticGroup[] = [
  ...POWER_STATION_GROUPS,
  ...SOLAR_PANEL_GROUPS,
];

export function getQuestionOptions(
  question: DiagnosticQuestion,
  model: ProductModel
): string[] {
  if (question.optionsFor) return question.optionsFor(model);
  return question.options ?? [];
}

export function getQuestionHint(
  question: DiagnosticQuestion,
  model: ProductModel
): string | undefined {
  if (question.hintFor) return question.hintFor(model);
  return question.hint;
}

/** Modelin özelliklerine ve şu ana kadarki cevaplara göre görünen gruplar. */
export function getVisibleGroups(
  model: ProductModel,
  answers: DiagnosticAnswers
): { group: DiagnosticGroup; questions: DiagnosticQuestion[] }[] {
  return DIAGNOSTIC_GROUPS.filter((g) => g.category === model.category)
    .map((group) => ({
      group,
      questions: group.questions.filter((q) => !q.showIf || q.showIf(answers, model)),
    }))
    .filter((entry) => entry.questions.length > 0);
}

/**
 * Cevabı verilmemiş zorunlu soruları döndürür. Görünürlük cevaplara bağlı
 * olduğu için gizlenen bir sorunun eski cevabı doğrulamaya dahil edilmez.
 */
export function validateDiagnostics(
  model: ProductModel,
  answers: DiagnosticAnswers
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const { questions } of getVisibleGroups(model, answers)) {
    for (const question of questions) {
      if (!question.required) continue;
      const answer = answers[question.id];
      const isEmpty = Array.isArray(answer)
        ? answer.length === 0
        : !answer || !answer.trim();
      if (isEmpty) {
        errors[question.id] =
          question.type === "multi"
            ? "En az bir seçenek işaretleyin"
            : question.type === "single"
              ? "Bu soruyu yanıtlayın"
              : question.type === "date"
                ? "Tarih seçiniz"
                : "Bu alan zorunludur";
      }
    }
  }
  return errors;
}

/** Gizlenen soruların artık geçerli olmayan cevaplarını temizler. */
export function pruneHiddenAnswers(
  model: ProductModel,
  answers: DiagnosticAnswers
): DiagnosticAnswers {
  const visibleIds = new Set(
    getVisibleGroups(model, answers).flatMap(({ questions }) => questions.map((q) => q.id))
  );
  const pruned: DiagnosticAnswers = {};
  for (const [id, value] of Object.entries(answers)) {
    if (visibleIds.has(id)) pruned[id] = value;
  }
  return pruned;
}

/** Admin paneli ve e-posta için okunabilir soru-cevap listesi. */
export function buildDiagnosticSummary(
  model: ProductModel,
  answers: DiagnosticAnswers
): { group: string; label: string; value: string }[] {
  const summary: { group: string; label: string; value: string }[] = [];
  for (const { group, questions } of getVisibleGroups(model, answers)) {
    for (const question of questions) {
      const answer = answers[question.id];
      const value = Array.isArray(answer) ? answer.join(", ") : (answer ?? "").trim();
      if (!value) continue;
      summary.push({
        group: group.title,
        label: question.label,
        value: question.type === "date" ? formatAnswerDate(value) : value,
      });
    }
  }
  return summary;
}
