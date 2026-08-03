/**
 * İYS/KVKK izin yönetimi
 *
 * İzin alanları ÜÇ DURUMLUDUR:
 *   true  → izin verdi
 *   false → reddetti
 *   null  → hiç sorulmadı
 *
 * `false` ile `null` aynı şey değildir. Mevcut üyelerin izni hiç kaydedilmediği
 * için hepsi `null` durumundadır; onlara `false` yazmak, alınmamış bir kullanıcı
 * beyanını veritabanına kaydetmek olurdu.
 *
 * Bu yüzden izin kontrolleri DAİMA `=== true` ile yapılır, `!== false` ile ASLA.
 */

export const CONSENT_CHANNELS = {
  SMS: "SMS",
  EMAIL: "EMAIL",
  CALL: "CALL",
  PERSONALIZATION: "PERSONALIZATION",
} as const;

export type ConsentChannel = (typeof CONSENT_CHANNELS)[keyof typeof CONSENT_CHANNELS];

/** İznin nereden alındığı — denetimde farklı kaynaklar farklı ispat yükü taşır. */
export const CONSENT_SOURCES = {
  REGISTER: "REGISTER",
  ACCOUNT_SETTINGS: "ACCOUNT_SETTINGS",
  CHECKOUT: "CHECKOUT",
  ADMIN: "ADMIN",
  CALL_CENTER: "CALL_CENTER",
} as const;

export type ConsentSource = (typeof CONSENT_SOURCES)[keyof typeof CONSENT_SOURCES];

/**
 * İzin metinlerinin sayfa yolları ve SÜRÜMLERİ.
 *
 * ⚠️ METİN HER DEĞİŞTİĞİNDE `version` ELLE GÜNCELLENMELİDİR.
 *
 * Sürüm, izin kaydının kanıt değerinin çekirdeğidir: denetimde "kullanıcı hangi
 * metne onay verdi" sorusu ancak bu damga ile yanıtlanabilir. Metinler kod
 * içinde sabit sayfa olarak durduğu için sürüm de kodda tutulur — otomatik
 * türetilecek bir `updatedAt` alanı yok.
 *
 * Metinler ileride `LegalPage` kayıtlarına taşınırsa, sürüm kaynağı o kaydın
 * `updatedAt` damgası olacak şekilde değiştirilmelidir.
 */
export const CONSENT_TEXTS = {
  commercial: {
    slug: "ticari-elektronik-ileti-bilgilendirmesi",
    version: "2026-07-30",
  },
  personalization: {
    slug: "acik-riza-metni",
    version: "2026-07-30",
  },
} as const;

function textForChannel(channel: ConsentChannel) {
  return channel === CONSENT_CHANNELS.PERSONALIZATION
    ? CONSENT_TEXTS.personalization
    : CONSENT_TEXTS.commercial;
}

export interface ConsentChange {
  channel: ConsentChannel;
  granted: boolean;
  previousValue: boolean | null;
}

export interface ConsentContext {
  userId: string;
  source: ConsentSource;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * İzin değişikliklerini `UserConsentLog`'a yazılacak veri satırlarına çevirir.
 *
 * Kayıtları doğrudan yazmak yerine veri döndürür; böylece çağıran taraf bunları
 * kullanıcı güncellemesiyle aynı transaction içinde yazabilir. İzin kaydı kanıt
 * belgesidir: kullanıcının değeri değişip kaydın yazılmaması (veya tersi)
 * denetimde savunulamaz bir tutarsızlık üretir.
 */
export function buildConsentLogRows(changes: ConsentChange[], ctx: ConsentContext) {
  return changes.map((change) => {
    const text = textForChannel(change.channel);
    return {
      userId: ctx.userId,
      channel: change.channel,
      granted: change.granted,
      previousValue: change.previousValue,
      source: ctx.source,
      consentTextKey: text.slug,
      consentTextVer: text.version,
      ipAddress: ctx.ipAddress ?? null,
      userAgent: ctx.userAgent ?? null,
    };
  });
}
