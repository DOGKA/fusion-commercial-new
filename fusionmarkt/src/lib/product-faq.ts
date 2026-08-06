/**
 * Ürüne özel soru-cevaplar.
 *
 * Sorular teknik özellik tablosunu tekrar etmiyor; tablodaki ham değerlerden
 * satın alma kararını etkileyen sonuçlar türetiyor ("2048 Wh" yerine
 * "buzdolabını ≈12 saat çalıştırır"). Kullanıcı da yapay zekâ araçları da ürünü
 * bu cümlelerle arıyor, tablo satırıyla değil.
 *
 * Her kategorinin kendi soru seti var (CATEGORY_PROFILES): güç kaynağında
 * çalışma süresi ve kesinti desteği, panelde günlük üretim, eldivende koruma
 * seviyesi ve beden sorulur. Profili tanımlanmamış kategoriler — ileride
 * açılacak aksesuar kategorileri dâhil — DEFAULT_PROFILE'a düşer ve elde hangi
 * özellik varsa ondan üretilen sorularla çalışır.
 *
 * Kurallar yalnızca ilgili özellik dolu olduğunda çalışıyor. Ürüne özel soru
 * sayısı beşle sınırlı: uzun listelerde alt sıradaki sorular dolgu hâline
 * geliyor.
 *
 * Cevaplar üründen ve sitenin başka yerlerinde zaten verilen taahhütlerden
 * (14 gün cayma hakkı, 2 yıl garanti, 12 taksit) türetiliyor; buraya yeni bir
 * vaat eklenmiyor.
 */

export interface ProductFaqItem {
  question: string;
  /** FAQPage şemasına giden tam metin; tablo satırları da cümleye katılıyor. */
  answer: string;
  /** Sayfada görünen giriş cümlesi. Tablo varsa tablonun üstünde duruyor. */
  intro: string;
  /** Cevabın ölçülebilir kısmı; sayfada tabloya basılıyor. */
  rows?: ProductFaqRow[];
}

export interface ProductFaqRow {
  name: string;
  /** Birimi de içeren, kullanıcıya gösterilen hâli: "≈ 12 saat". */
  value: string;
}

export interface ProductFaqVariant {
  type: string;
  value: string;
  inStock: boolean;
}

export interface ProductFaqBundle {
  items: Array<{ name: string; quantity: number }>;
  /** Paket fiyatı ve içindekilerin tek tek toplamı; tasarruf buradan çıkıyor. */
  price: number;
  totalValue: number;
}

export interface ProductFaqInput {
  name: string;
  inStock: boolean;
  freeShipping: boolean;
  specs: ProductFaqRow[];
  categorySlug?: string;
  variants?: ProductFaqVariant[];
  bundle?: ProductFaqBundle;
}

export interface ProductFaqSection {
  eyebrow: string;
  title: string;
  items: ProductFaqItem[];
}

/** Ürüne özel soru üst sınırı: fazlası cevapları dolguya çeviriyor. */
const MAX_SPECIFIC_ITEMS = 5;

/** Çevirici verimi hesaba katılmış, ölçüme değil kataloğa dayalı kaba oran. */
const INVERTER_EFFICIENCY = 0.85;

/** Türkiye ortalaması: panelin gün içinde tam güce yakın çalıştığı süre. */
const PEAK_SUN_HOURS = 4.5;

const RUNTIME_DEVICES: Array<{ label: string; watt: number }> = [
  { label: "Wi-Fi modem", watt: 10 },
  { label: "Dizüstü bilgisayar", watt: 65 },
  { label: "LED televizyon", watt: 100 },
  { label: "Buzdolabı (ortalama)", watt: 150 },
  { label: "Elektrikli ısıtıcı", watt: 1500 },
  { label: "Su ısıtıcısı", watt: 2000 },
];

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------

type SpecReader = (key: string) => string | undefined;

interface FaqContext {
  /** Sorularda kullanılan kısa ürün adı: "P3200 taşınabilir güç kaynağı". */
  label: string;
  name: string;
  spec: SpecReader;
  variants: ProductFaqVariant[];
  bundle?: ProductFaqBundle;
}

type FaqRule = (context: FaqContext) => ProductFaqItem | null;

/**
 * Sorularda ürünün nasıl anılacağı: tekil ürünlerde model kodu ("P3200 güç
 * kaynağı"), paketlerde paketin kendi adı ("Solar Elite Paketi").
 */
type LabelMode = "model" | "name";

function normalizeKey(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (char) => "cgiosu"["çğıöşü".indexOf(char)])
    .replace(/[^a-z0-9]/g, "");
}

/** "≈ 1,5 saat" / "<65 dB" / "12–80 V" gibi değerlerden ilk sayıyı çıkarır. */
function toNumber(value?: string) {
  if (!value) return null;
  const match = value.replace(",", ".").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function isYes(value?: string) {
  return value ? /^(evet|var)/i.test(value.trim()) : false;
}

function formatNumber(value: number, digits = 1) {
  return value.toFixed(digits).replace(/[.,]0$/, "").replace(".", ",");
}

function formatDuration(hours: number) {
  if (hours >= 10) return `≈ ${Math.round(hours)} saat`;
  if (hours >= 1) return `≈ ${formatNumber(hours)} saat`;
  return `≈ ${Math.round(hours * 60)} dakika`;
}

/** "~1.5 saat (AC)" → "~1.5 saat": parantezli ek tabloda başlıkta zaten var. */
function stripParenthetical(value: string) {
  return value.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

/** Panelde girilen değerler serbest metin: "pu" → "PU", "nitril" → "Nitril". */
function displayValue(value: string) {
  const trimmed = value.trim();
  if (trimmed.length <= 3) return trimmed.toLocaleUpperCase("tr-TR");
  return trimmed.charAt(0).toLocaleUpperCase("tr-TR") + trimmed.slice(1);
}

/** "21-23 %" → "%21-23": yüzde işareti Türkçede sayının önünde durur. */
function displayPercent(value: string) {
  const cleaned = value.replace(/%/g, "").trim();
  return `%${cleaned}`;
}

function createItem(
  question: string,
  intro: string,
  rows?: ProductFaqRow[],
): ProductFaqItem {
  const answer = rows?.length
    ? `${intro} ${rows.map((row) => `${row.name}: ${row.value}`).join(", ")}.`
    : intro;
  return { question, intro, answer, ...(rows?.length ? { rows } : {}) };
}

/** "400W", "3.8M", "2048Wh" gibi ölçü belirten parçalar model kodu değildir. */
const MEASUREMENT_TOKEN = /^\d+([.,]\d+)?(w|wh|kwh|v|a|ah|m|mm|cm|kg|db)?$/i;

function modelCode(name: string) {
  for (const raw of name.split(/[\s|/(),]+/)) {
    const token = raw.replace(/[.,;:]+$/, "");
    if (token.length < 3 || token.length > 14) continue;
    if (!/[A-Za-zÇĞİÖŞÜ]/.test(token) || !/\d/.test(token)) continue;
    if (MEASUREMENT_TOKEN.test(token)) continue;
    if (/^(IP|EN|USB|TYPE)\d*/i.test(token)) continue;
    return token;
  }
  return null;
}

/**
 * Ürün adından tür adı: kategori profilinin varsayılanı yanlış kalabiliyor
 * (genişletme bataryası güç kaynakları kategorisinde duruyor).
 */
const NOUN_PATTERNS: Array<[RegExp, string]> = [
  [/batarya modül|genişletme batarya/i, "genişletme batarya modülü"],
  [/güç kaynağ|güç istasyon|jeneratör/i, "taşınabilir güç kaynağı"],
  [/güneş paneli|solar panel/i, "güneş paneli"],
  [/tek kullanımlık eldiven/i, "tek kullanımlık eldiven"],
  [/eldiven/i, "iş eldiveni"],
  [/merdiven/i, "teleskopik merdiven"],
];

/**
 * Katalogdaki adlar tam bir cümle uzunluğunda ("SH4000 5120Wh | 8000W Max.
 * Taşınabilir Güç Kaynağı / Solar Jeneratör"). Her soruda bunu tekrarlamak
 * metni okunamaz hâle getiriyor; model kodu + tür adı hem kısa hem de
 * kullanıcıların arama kutusuna yazdığı ifade.
 */
function buildLabel(name: string, fallbackNoun: string, mode: LabelMode) {
  if (mode === "name") {
    const cleaned = name.replace(/\([^)]*\)/g, "").replace(/\s{2,}/g, " ").trim();
    return cleaned.length > 0 && cleaned.length <= 45 ? cleaned : name;
  }

  const code = modelCode(name);
  const noun = NOUN_PATTERNS.find(([pattern]) => pattern.test(name))?.[1] ?? fallbackNoun;

  if (code) return noun ? `${code} ${noun}` : code;
  if (noun) return noun.charAt(0).toLocaleUpperCase("tr-TR") + noun.slice(1);

  const words = name.trim().split(/\s+/);
  const short: string[] = [];
  for (const word of words) {
    if ([...short, word].join(" ").length > 45) break;
    short.push(word);
  }
  return short.join(" ") || name;
}

// ---------------------------------------------------------------------------
// Ürüne özel kurallar
// ---------------------------------------------------------------------------

/** Kapasite değerinin karşılığı olan asıl soru: kaç saat çalıştırır. */
const runtimeRule: FaqRule = ({ label, spec }) => {
  const capacity = toNumber(spec("Kapasite"));
  const output = toNumber(spec("Çıkış Gücü"));
  if (!capacity || !output) return null;

  const usableWh = capacity * INVERTER_EFFICIENCY;
  const rows = RUNTIME_DEVICES.filter((device) => device.watt <= output)
    .slice(0, 5)
    .map((device) => ({
      name: `${device.label} (${device.watt} W)`,
      value: formatDuration(usableWh / device.watt),
    }));

  if (rows.length === 0) return null;

  return createItem(
    `${label} hangi cihazı ne kadar süre çalıştırır?`,
    `${spec("Kapasite")} kapasitenin yaklaşık ${Math.round(usableWh)} Wh'ı çevirici kayıpları sonrası cihaza ulaşır; ${spec("Çıkış Gücü")} sürekli güce kadar yük beslenebilir. Cihazın çektiği güce göre yaklaşık süreler:`,
    rows,
  );
};

const chargingRule: FaqRule = ({ label, spec }) => {
  const acDuration = spec("Şarj Süresi (AC)");
  const solarDuration = spec("Şarj Süresi (Solar)");
  if (!acDuration && !solarDuration) return null;

  const rows: ProductFaqRow[] = [];
  const acPower = spec("AC Şarj Gücü");
  const solarPower = spec("Max. Solar Şarj");

  if (acDuration) {
    rows.push({
      name: acPower ? `Prizden (${acPower})` : "Prizden",
      value: stripParenthetical(acDuration),
    });
  }
  if (solarDuration) {
    rows.push({
      name: solarPower ? `Güneş paneliyle (${solarPower})` : "Güneş paneliyle",
      value: stripParenthetical(solarDuration),
    });
  }

  return createItem(
    `${label} ne kadar sürede şarj olur?`,
    `Boş bataryadan tam doluma kadar geçen süreler aşağıdaki gibidir. Ünite şarj olurken cihazları beslemeye devam edebilir.`,
    rows,
  );
};

const backupPowerRule: FaqRule = ({ label, spec }) => {
  if (!isYes(spec("UPS/EPS Fonksiyonu"))) return null;

  const output = spec("Çıkış Gücü");

  return createItem(
    `${label} elektrik kesintisinde otomatik devreye girer mi?`,
    `Evet. UPS/EPS fonksiyonu sayesinde cihazlarınızı ünitenin AC çıkışına bağlı tutarsanız şebeke gittiğinde besleme otomatik olarak bataryadan sürer${output ? `; ${output} sınırına kadar yük desteklenir` : ""}. Buzdolabı, modem, kamera sistemi ve masaüstü bilgisayar gibi kesintiye duyarlı cihazlar için uygundur.`,
  );
};

const solarInputRule: FaqRule = ({ label, spec }) => {
  const maxSolar = spec("Max. Solar Şarj");
  const voltage = spec("Solar Giriş Voltajı");
  if (!maxSolar || !voltage) return null;

  const current = spec("Max. DC PV Akımı");

  return createItem(
    `${label} hangi güneş paneliyle şarj edilir?`,
    `${maxSolar} gücüne kadar, ${voltage} aralığında çalışan MC4 konnektörlü paneller bağlanabilir${current ? ` (maksimum ${current})` : ""}. Panelleri seri bağlarken toplam voltajın, paralel bağlarken toplam akımın bu sınırların içinde kalması gerekir. FusionMarkt'taki katlanabilir SP serisi paneller bu değerlerle uyumludur.`,
  );
};

/**
 * Çıkış gücü olmayan ürünlerde (genişletme bataryası) kapasitenin karşılığı:
 * runtimeRule çalışmadığı için soru-cevap bölümü tek maddeye düşüyordu.
 */
const capacityRule: FaqRule = ({ label, spec }) => {
  const capacity = toNumber(spec("Kapasite"));
  if (!capacity || spec("Çıkış Gücü")) return null;

  const usableWh = capacity * INVERTER_EFFICIENCY;
  const fridgeHours = usableWh / 150;

  return createItem(
    `${label} ne kadar ek enerji sağlar?`,
    `${spec("Kapasite")} kapasite ekler; çevirici kayıpları sonrası yaklaşık ${Math.round(usableWh)} Wh kullanılabilir enerjiye denk gelir. Bu, ortalama 150 W çeken bir buzdolabını tek başına ${formatDuration(fridgeHours)} besleyecek büyüklüktedir.`,
  );
};

/** "B5120 ... | SH4000 Uyumlu" gibi adlar uyumluluğu zaten taşıyor. */
const namedCompatibilityRule: FaqRule = ({ label, name }) => {
  const match = name.match(/([A-Za-z]{1,4}\d{2,5}[A-Za-z]*)\s+uyumlu/i);
  if (!match) return null;

  return createItem(
    `${label} hangi cihazla kullanılır?`,
    `${match[1]} modeliyle uyumludur ve doğrudan ona bağlanır. Farklı marka veya modellerde kullanılmadan önce bağlantı tipi ve voltaj aralığının uyduğundan emin olun.`,
  );
};

const cycleLifeRule: FaqRule = ({ label, spec }) => {
  const cycles = toNumber(spec("Döngü Ömrü"));
  if (!cycles) return null;

  const battery = spec("Batarya Tipi");
  const years = Math.round(cycles / 365);

  return createItem(
    `${label} kaç yıl kullanılır?`,
    `Batarya ${spec("Döngü Ömrü")} şarj-deşarj döngüsü sonunda kapasitesinin büyük bölümünü korur; günde bir tam döngüyle bu yaklaşık ${years} yıl demektir.${
      battery ? ` ${battery} hücreler, kurşun asit ve NMC bataryalara göre daha uzun ömürlüdür.` : ""
    }`,
  );
};

/** Hafif ürünlerde ağırlık satın alma engeli değil; soru dolgu olur. */
const HEAVY_PRODUCT_KG = 5;

const portabilityRule: FaqRule = ({ label, spec }) => {
  const weight = spec("Ağırlık");
  const kilos = toNumber(weight);
  if (!weight || !kilos || kilos < HEAVY_PRODUCT_KG) return null;

  // Bazı ürünlerde ölçü alanı parça parça girilmiş ("gövde / batarya / kaide");
  // cümlede yalnızca ilki anlamlı, tamamı sekmede duruyor.
  const dimensions = (spec("Boyutlar") || spec("Katlanmış Boyutlar"))?.split("/")[0].trim();
  const capacityWh = toNumber(spec("Kapasite"));

  return createItem(
    `${label} kaç kilo, taşıması kolay mı?`,
    `${weight} ağırlığında${dimensions ? ` ve ${dimensions} ölçülerinde` : ""}. ${
      capacityWh && capacityWh > 100
        ? "Kapasitesi 100 Wh üzerinde olduğu için havayolu kurallarına göre uçakta kabin veya bagajda taşınamaz; kara kargosuyla gönderilir."
        : "Standart kargoyla gönderilir."
    }`,
  );
};

const panelOutputRule: FaqRule = ({ label, spec }) => {
  const panelWatt = toNumber(spec("Panel Gücü"));
  if (!panelWatt) return null;

  const dailyKwh = (panelWatt * PEAK_SUN_HOURS) / 1000;
  const efficiency = spec("Dönüşüm Verimliliği");

  return createItem(
    `${label} günde ne kadar enerji üretir?`,
    `Açık havada güneşe dik konumlandırıldığında günde yaklaşık ${formatNumber(dailyKwh)} kWh üretir; hesap ${spec("Panel Gücü")} panel gücü ve Türkiye ortalaması olan ${formatNumber(PEAK_SUN_HOURS)} saatlik verimli güneşlenme üzerinden yapılmıştır${
      efficiency ? `. Hücre dönüşüm verimliliği ${displayPercent(efficiency)}` : ""
    }. Bulutlu havada ve kış aylarında üretim düşer.`,
  );
};

const panelCompatibilityRule: FaqRule = ({ label, spec }) => {
  const workingVoltage = spec("Çalışma Voltajı");
  const openVoltage = spec("Açık Devre Gerilimi");
  if (!workingVoltage && !openVoltage) return null;

  const rows: ProductFaqRow[] = [];
  if (workingVoltage) rows.push({ name: "Çalışma voltajı", value: workingVoltage });
  if (openVoltage) rows.push({ name: "Açık devre gerilimi", value: openVoltage });

  const workingCurrent = spec("Çalışma Akımı");
  if (workingCurrent) rows.push({ name: "Çalışma akımı", value: workingCurrent });

  const connectorVoltage = spec("MC4 Nominal Voltaj");
  if (connectorVoltage) rows.push({ name: "MC4 nominal voltaj", value: connectorVoltage });

  return createItem(
    `${label} hangi güç kaynağına bağlanabilir?`,
    "MC4 konnektörlü olduğu için solar giriş aralığı bu değerleri kapsayan tüm taşınabilir güç kaynaklarıyla çalışır. Bağlamadan önce güç kaynağının solar giriş voltajını ve akım sınırını karşılaştırmanız yeterli:",
    rows,
  );
};

const foldedSizeRule: FaqRule = ({ label, spec }) => {
  const folded = spec("Katlanmış Boyutlar");
  const weight = spec("Ağırlık");
  if (!folded) return null;

  const rows: ProductFaqRow[] = [{ name: "Katlanmış", value: folded }];
  const open = spec("Açılmış Boyutlar");
  if (open) rows.push({ name: "Açılmış", value: open });
  if (weight) rows.push({ name: "Ağırlık", value: weight });

  return createItem(
    `${label} katlanınca ne kadar yer kaplar?`,
    "Katlanabilir gövdesi sayesinde araç bagajında ve depoda az yer kaplar; ölçüler aşağıdaki gibidir.",
    rows,
  );
};

const weatherproofRule: FaqRule = ({ label, spec }) => {
  const ip = spec("IP Koruma");
  const rating = ip ? Number.parseInt(ip.replace(/\D/g, "").slice(0, 2) || "0", 10) : 0;
  if (!ip || !rating) return null;

  const waterResistant = rating % 10 >= 4;

  return createItem(
    `${label} yağmurda veya dış mekânda kullanılabilir mi?`,
    waterResistant
      ? `Evet. ${ip} koruma sınıfı sayesinde yağmur ve toz altında çalışabilir. Yine de suya batırılmamalı, konnektör uçları kuru tutulmalıdır.`
      : `Koruma sınıfı ${ip} olduğu için yağmura ve doğrudan suya karşı korumasızdır. Dış mekânda üstü kapalı, kuru bir zeminde kullanılmalıdır.`,
  );
};

const gloveProtectionRule: FaqRule = ({ label, spec }) => {
  const cutLevel = spec("Kesim Seviyesi");
  const coating = spec("Kaplama");
  if (!cutLevel && !coating) return null;

  return createItem(
    `${label} hangi işlerde kullanılır?`,
    `${
      cutLevel
        ? `EN 388 kesilme direnci ${cutLevel} seviyesindedir; bu seviye montaj, depo, sac ve cam işleri gibi kesilme riski bulunan işler için tanımlanır.`
        : "Genel amaçlı elleçleme ve montaj işleri için tasarlanmıştır."
    }${coating ? ` ${displayValue(coating)} kaplama, yağlı ve ıslak yüzeylerde kavramayı artırır.` : ""}`,
  );
};

const gloveSizeRule: FaqRule = ({ label, variants }) => {
  const sizes = variants.filter((variant) => /size|beden/i.test(variant.type));
  if (sizes.length === 0) return null;

  const available = sizes.filter((size) => size.inStock).map((size) => size.value);
  const all = sizes.map((size) => size.value);

  return createItem(
    `${label} hangi bedenlerde satılıyor?`,
    `${all.join(", ")} bedenleri üretiliyor. ${
      available.length === all.length
        ? "Tüm bedenler şu anda stokta."
        : available.length > 0
          ? `Şu anda ${available.join(", ")} bedeni stokta; diğer bedenler için ürünü favorilerinize ekleyip stok bildirimini bekleyebilirsiniz.`
          : "Bedenlerin tamamı şu anda tükendi; ürünü favorilerinize ekleyerek stok bildirimi alabilirsiniz."
    } EN 420 beden ölçüsü avuç çevresine göre belirlenir.`,
  );
};

const gloveTouchRule: FaqRule = ({ label, spec }) => {
  const touch = spec("Dokunmatik Ekran Uyumlu");
  if (!touch) return null;

  return createItem(
    `${label} takılıyken telefon kullanılabilir mi?`,
    isYes(touch)
      ? "Evet, parmak uçları dokunmatik ekran uyumludur; eldiveni çıkarmadan telefon ve el terminali kullanılabilir."
      : "Hayır, bu model dokunmatik ekran uyumlu değildir. Sahada sık telefon kullanıyorsanız dokunmatik uyumlu modellerimizi tercih edebilirsiniz.",
  );
};

const glovePackRule: FaqRule = ({ label, spec }) => {
  const pack = spec("Paket Adedi");
  if (!pack) return null;

  return createItem(
    `${label} paketinde kaç adet var?`,
    `Bir pakette ${pack} bulunur. Sepetteki adet, paket sayısını ifade eder.`,
  );
};

const ladderReachRule: FaqRule = ({ label, spec }) => {
  const height = spec("Maksimum Yükseklik");
  const capacity = spec("Taşıma Kapasitesi");
  if (!height && !capacity) return null;

  const rows: ProductFaqRow[] = [];
  if (height) rows.push({ name: "Maksimum yükseklik", value: height });
  if (capacity) rows.push({ name: "Taşıma kapasitesi", value: capacity });

  const steps = spec("Basamak Sayısı");
  if (steps) rows.push({ name: "Basamak sayısı", value: steps });

  return createItem(
    `${label} kaç metreye çıkar, kaç kilo taşır?`,
    `${height ? `${height} yüksekliğe kadar açılır` : "Katlanabilir gövdeye sahiptir"}${
      capacity ? ` ve ${capacity} taşıma kapasitesi vardır` : ""
    }. Değerler tek kişilik kullanım içindir.`,
    rows,
  );
};

const ladderSafetyRule: FaqRule = ({ label, spec }) => {
  const insulated = spec("Yalıtkan");
  const material = spec("Merdiven Malzemesi");
  if (!insulated && !material) return null;

  return createItem(
    `${label} elektrik işlerinde kullanılabilir mi?`,
    isYes(insulated)
      ? `Evet, yalıtkan gövdelidir${material ? ` (${material})` : ""}; enerji altındaki panolara yakın çalışmalarda tercih edilir. Yine de kullanım öncesi gövdede çatlak ve nem olmadığından emin olun.`
      : `Bu model yalıtkan değildir${material ? `; gövde ${material} malzemedir` : ""}. Enerji altında çalışılacak işlerde yalıtkan sınıfı merdiven kullanılmalıdır.`,
  );
};

const bundleContentRule: FaqRule = ({ label, bundle }) => {
  if (!bundle?.items.length) return null;

  return createItem(
    `${label} içinden neler çıkıyor?`,
    "Paket aşağıdaki ürünlerden oluşur; hepsi birbiriyle uyumlu seçilmiştir ve tek siparişte, kendi orijinal kutularında gönderilir.",
    bundle.items.map((item) => ({
      name: item.name,
      value: `${item.quantity} adet`,
    })),
  );
};

const bundleSavingRule: FaqRule = ({ label, bundle }) => {
  if (!bundle) return null;

  const saving = bundle.totalValue - bundle.price;
  if (saving <= 0) return null;

  const ratio = Math.round((saving / bundle.totalValue) * 100);

  /*
   * Tutarlar bilerek yazılmıyor: fiyat değiştiğinde cevabın içindeki rakam
   * sayfadaki fiyat kutusuyla çelişebiliyor ve aynı metin FAQPage şemasına da
   * gidiyor. Oran her render'da yeniden hesaplanıyor, güncel tutar ise zaten
   * sayfanın kendisinde.
   */
  return createItem(
    `${label} ürünleri tek tek almaktan daha mı avantajlı?`,
    `Evet. Paket fiyatı, içindeki ürünleri ayrı ayrı almaya göre yaklaşık %${ratio} daha uygun. Güncel tutarı ve kazancınızı sayfadaki fiyat alanında görebilirsiniz.`,
  );
};

/** Beden/renk gibi seçenekleri olan, profili tanımlanmamış ürünler için. */
const variantOptionRule: FaqRule = ({ label, variants }) => {
  if (variants.length === 0) return null;

  const groups = new Map<string, ProductFaqVariant[]>();
  for (const variant of variants) {
    groups.set(variant.type, [...(groups.get(variant.type) ?? []), variant]);
  }

  const rows = [...groups.entries()].map(([type, options]) => ({
    name: variantTypeLabel(type),
    value: options.map((option) => option.value).join(", "),
  }));

  const soldOut = variants.filter((variant) => !variant.inStock).map((v) => v.value);

  return createItem(
    `${label} hangi seçeneklerle satılıyor?`,
    `Ürün aşağıdaki seçeneklerle sunuluyor.${
      soldOut.length > 0
        ? ` ${soldOut.join(", ")} seçeneği şu anda tükendi; favorilere ekleyerek stok bildirimi alabilirsiniz.`
        : " Seçeneklerin tamamı stokta."
    }`,
    rows,
  );
};

function variantTypeLabel(type: string) {
  const labels: Record<string, string> = {
    size: "Beden",
    color: "Renk",
    material: "Malzeme",
  };
  return labels[type.toLowerCase()] ?? type;
}

/**
 * Son çare: ürüne özel hiçbir kural çalışmadıysa eldeki ölçülebilir değerler
 * tabloya basılıyor. Yeni açılacak aksesuar kategorilerinde, kategoriye özel
 * profil yazılana kadar bölüm boş kalmasın diye var.
 */
function buildKeySpecItem(label: string, specs: ProductFaqRow[]) {
  if (specs.length < 2) return null;

  return createItem(
    `${label} için öne çıkan teknik değerler neler?`,
    "Satın alma kararında en çok sorulan değerler aşağıdaki gibidir; tüm liste sayfadaki Teknik Özellikler sekmesinde yer alır.",
    specs.slice(0, 5),
  );
}

const commerceRules = {
  delivery: (label: string, inStock: boolean, freeShipping: boolean) =>
    createItem(
      `${label} ne zaman teslim edilir, kargo ücretli mi?`,
      `${
        inStock
          ? "Ürün stokta; siparişler en geç 1 iş günü içinde kargoya verilir ve teslimat Türkiye genelinde 1-3 iş günü sürer."
          : "Ürün şu anda stokta değil. Stok girişinde sayfadaki durum güncellenir; favorilere ekleyerek bildirim alabilirsiniz."
      } ${
        freeShipping
          ? "Kargo ücretsizdir."
          : "Kargo ücreti sepet tutarına göre hesaplanır; belirlenen tutarın üzerindeki siparişlerde kargo ücretsizdir."
      }`,
    ),
  warranty: (label: string) =>
    createItem(
      `${label} iade edilebilir mi, garanti süresi ne kadar?`,
      "Teslim tarihinden itibaren 14 gün içinde cayma hakkınızı kullanarak ürünü iade edebilirsiniz. Ürün 2 yıl garanti kapsamındadır; garanti süresi teslimat tarihinde başlar.",
    ),
  returnsUnused: (label: string) =>
    createItem(
      `${label} iade edilebilir mi?`,
      "Kişisel koruyucu donanım olduğu için iade, ürünün kullanılmamış ve orijinal ambalajının açılmamış olması koşuluyla kabul edilir. Cayma hakkı süresi teslim tarihinden itibaren 14 gündür.",
    ),
  installment: (label: string) =>
    createItem(
      `${label} taksitle satın alınabilir mi?`,
      "Evet, kredi kartına 12 taksit imkânı sunuluyor. Taksit seçenekleri ödeme adımında kart bilgisi girildikten sonra listelenir.",
    ),
  bulk: (label: string) =>
    createItem(
      `${label} için toplu alım yapılabilir mi?`,
      "Evet. Kurumsal ve toplu alımlar için iletişim sayfasındaki formdan adet bilgisiyle teklif isteyebilirsiniz; fatura ve sevkiyat süreçleri firma adına yürütülür.",
    ),
} as const;

type CommerceKey = keyof typeof commerceRules;

// ---------------------------------------------------------------------------
// Kategori profilleri
// ---------------------------------------------------------------------------

interface CategoryProfile {
  eyebrow: string;
  title: string;
  /** Model kodundan sonra kullanılacak tür adı; ad eşleşmesi öncelikli. */
  noun: string;
  labelMode?: LabelMode;
  rules: FaqRule[];
  commerce: CommerceKey[];
}

/**
 * Profili tanımlanmamış kategoriler buraya düşüyor: ileride açılacak aksesuar
 * kategorileri, kendi profili yazılana kadar eldeki özellik ve seçeneklerden
 * üretilen sorularla çalışır.
 */
const DEFAULT_PROFILE: CategoryProfile = {
  eyebrow: "Ürün hakkında",
  title: "Sıkça Sorulan Sorular",
  noun: "",
  rules: [
    namedCompatibilityRule,
    variantOptionRule,
    weatherproofRule,
    cycleLifeRule,
    portabilityRule,
  ],
  commerce: ["delivery", "warranty", "installment"],
};

const CATEGORY_PROFILES: Record<string, CategoryProfile> = {
  "tasinabilir-guc-kaynaklari": {
    eyebrow: "Enerji hesabı",
    title: "Satın almadan önce merak edilenler",
    noun: "taşınabilir güç kaynağı",
    rules: [
      runtimeRule,
      capacityRule,
      chargingRule,
      backupPowerRule,
      solarInputRule,
      namedCompatibilityRule,
      cycleLifeRule,
      portabilityRule,
    ],
    commerce: ["delivery", "warranty", "installment"],
  },
  "gunes-panelleri": {
    eyebrow: "Verim ve kurulum",
    title: "Panel hakkında sık sorulanlar",
    noun: "güneş paneli",
    rules: [panelOutputRule, panelCompatibilityRule, weatherproofRule, foldedSizeRule],
    commerce: ["delivery", "warranty", "installment"],
  },
  "endustriyel-eldivenler": {
    eyebrow: "Koruma sınıfı ve beden",
    title: "Eldiven hakkında sık sorulanlar",
    noun: "iş eldiveni",
    rules: [gloveProtectionRule, gloveSizeRule, gloveTouchRule, glovePackRule],
    commerce: ["delivery", "returnsUnused", "bulk"],
  },
  "teleskopik-merdivenler": {
    eyebrow: "Saha kullanımı",
    title: "Merdiven hakkında sık sorulanlar",
    noun: "teleskopik merdiven",
    rules: [ladderReachRule, ladderSafetyRule, foldedSizeRule, portabilityRule],
    commerce: ["delivery", "warranty", "bulk"],
  },
  "bundle-paket-urunler": {
    eyebrow: "Paket içeriği",
    title: "Paket hakkında sık sorulanlar",
    noun: "",
    labelMode: "name",
    rules: [bundleContentRule, bundleSavingRule],
    commerce: ["delivery", "warranty", "installment"],
  },
};

export function buildProductFaq({
  name,
  inStock,
  freeShipping,
  specs,
  categorySlug,
  variants = [],
  bundle,
}: ProductFaqInput): ProductFaqSection {
  const profile =
    (categorySlug ? CATEGORY_PROFILES[categorySlug] : undefined) ?? DEFAULT_PROFILE;

  const bySpec = new Map(specs.map((entry) => [normalizeKey(entry.name), entry.value]));
  const context: FaqContext = {
    label: buildLabel(name, profile.noun, profile.labelMode ?? "model"),
    name,
    spec: (key) => bySpec.get(normalizeKey(key)),
    variants,
    bundle,
  };

  const specific: ProductFaqItem[] = [];
  for (const rule of profile.rules) {
    if (specific.length >= MAX_SPECIFIC_ITEMS) break;
    const item = rule(context);
    if (item) specific.push(item);
  }

  if (specific.length < 2) {
    const fallback = buildKeySpecItem(context.label, specs);
    if (fallback) specific.push(fallback);
  }

  /**
   * Varyantlı üründe ana stok alanı dolu kalabiliyor; alınabilirliği belirleyen
   * seçeneklerin stoğu, teslimat cevabı da onu söylemeli.
   */
  const available = variants.length > 0 ? variants.some((variant) => variant.inStock) : inStock;

  const commerce = profile.commerce.map((key) =>
    key === "delivery"
      ? commerceRules.delivery(context.label, available, freeShipping)
      : commerceRules[key](context.label),
  );

  return {
    eyebrow: profile.eyebrow,
    title: profile.title,
    items: [...specific, ...commerce],
  };
}
