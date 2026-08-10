/**
 * Çerez onayının hem sunucu hem istemci tarafından okunması için ortak sabitler.
 *
 * Onay `CookieConsentContext` tarafından localStorage'a ve aynı anda
 * `cookie_consent` çerezine yazılıyor. Kök layout bandı ilk HTML'e koyup
 * koymayacağına bu çereze bakarak karar verdiği için sabitlerin iki tarafta
 * ayrışmaması kritik: sürüm uyuşmazsa sunucu "onay yok" deyip bandı basar,
 * istemci "onay var" deyip anında söker ve kullanıcı bir titreme görür.
 *
 * Context bir istemci modülü ("use client"), bu yüzden sabitler sunucudan
 * import edilebilsin diye burada duruyor.
 */

export const COOKIE_CONSENT_COOKIE_NAME = "cookie_consent";
export const COOKIE_CONSENT_STORAGE_KEY = "fusionmarkt-cookie-consent";
export const COOKIE_CONSENT_VERSION = "1.0";
