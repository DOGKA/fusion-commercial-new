/**
 * Hesabım — navigasyon yardımcıları
 *
 * Kayıt defterini (`account-nav.ts`) sorgulayan saf fonksiyonlar.
 * Hepsi senkron: kabuk başlığı ilk boyamada doğru olsun diye (plan 01 §2.6).
 */

import { ACCOUNT_ROUTES, type AccountRoute } from "./account-nav";

const segmentsOf = (pathname: string) =>
  pathname.replace(/\/+$/, "").split("/").filter(Boolean);

/**
 * Bir route şablonunun pathname ile eşleşip eşleşmediğini söyler.
 * ":param" segmentleri joker sayılır.
 */
function matchTemplate(
  template: string,
  pathname: string
): Record<string, string> | null {
  const t = segmentsOf(template);
  const p = segmentsOf(pathname);
  if (t.length !== p.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < t.length; i++) {
    if (t[i].startsWith(":")) {
      params[t[i].slice(1)] = decodeURIComponent(p[i]);
    } else if (t[i] !== p[i]) {
      return null;
    }
  }
  return params;
}

/**
 * Pathname'i kayıt defterindeki bir route'a eşler.
 * Statik eşleşmeler dinamik olanlara tercih edilir; böylece
 * `/hesabim/degerlendirmelerim/bekleyenler` yanlışlıkla bir ":param"a düşmez.
 */
export function matchAccountRoute(pathname: string): AccountRoute | null {
  const candidates = ACCOUNT_ROUTES.filter(
    (r) => matchTemplate(r.href, pathname) !== null
  );
  if (candidates.length === 0) return null;
  return candidates.find((r) => !r.href.includes(":")) ?? candidates[0];
}

/** Eşleşen route'un dinamik parametreleri. */
export function matchAccountParams(pathname: string): Record<string, string> {
  const route = matchAccountRoute(pathname);
  if (!route) return {};
  return matchTemplate(route.href, pathname) ?? {};
}

/** Kabuğun bastığı h1 metni. */
export function accountPageTitle(pathname: string): string {
  const route = matchAccountRoute(pathname);
  if (!route) return "Hesabım";
  if (route.titleFn) return route.titleFn(matchAccountParams(pathname));
  return route.title;
}

/** Mobil geri okunun hedefi. */
export function accountParentHref(pathname: string): string {
  return matchAccountRoute(pathname)?.parent ?? "/hesabim";
}

/** Mobil üst çubukta gösterilecek geri dönüş hedefinin adı. */
export function accountParentTitle(pathname: string): string {
  return accountPageTitle(accountParentHref(pathname));
}

/**
 * Aktif işaretleme.
 *
 * `/hesabim` yalnızca tam eşitlikte aktiftir — aksi halde her hesap sayfasında
 * aktif görünürdü. Diğer öğeler alt route'larında da aktif kalır
 * (`/hesabim/siparisler/FM-1` → "Siparişlerim" aktif).
 */
export function isAccountRouteActive(
  itemHref: string,
  pathname: string
): boolean {
  if (itemHref === "/hesabim") return pathname === "/hesabim";
  return pathname === itemHref || pathname.startsWith(itemHref + "/");
}
