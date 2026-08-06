/**
 * IndexNow — Bing / Yandex / Seznam anlık URL bildirimi
 *
 * Anahtar dosyası: /public/{key}.txt (canlıda https://fusionmarkt.com/{key}.txt)
 * Ürün veya sayfa güncellenince revalidate endpoint'i bu modülü çağırır.
 */

import { siteConfig } from "@/lib/seo";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/** Canlıda da aynı anahtar public/{key}.txt olarak yayınlanır. */
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY || "176831d0ac617c9099b57befea5e6f18";

function baseUrl() {
  return siteConfig.url.replace(/\/$/, "");
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${baseUrl()}${path}`;
}

/**
 * IndexNow'a URL listesi gönderir. Hata revalidate'i bozmasın diye
 * başarısızlıkta throw etmez; sonucu loglar.
 */
export async function submitIndexNow(urls: string[]): Promise<{
  submitted: number;
  status: number | null;
  skipped?: string;
}> {
  const unique = Array.from(
    new Set(urls.map(toAbsoluteUrl).filter((url) => url.startsWith(baseUrl()))),
  ).slice(0, 10000);

  if (!unique.length) {
    return { submitted: 0, status: null, skipped: "empty" };
  }

  if (!INDEXNOW_KEY) {
    return { submitted: 0, status: null, skipped: "no-key" };
  }

  const host = new URL(baseUrl()).host;
  const keyLocation = `${baseUrl()}/${INDEXNOW_KEY}.txt`;

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation,
        urlList: unique,
      }),
      // IndexNow yanıtı revalidate'i geciktirmesin
      signal: AbortSignal.timeout(8000),
    });

    // 200 = OK, 202 = Accepted — ikisi de başarı
    if (response.status === 200 || response.status === 202) {
      console.log(`✅ IndexNow: ${unique.length} URL bildirildi (${response.status})`);
    } else {
      const body = await response.text().catch(() => "");
      console.warn(`⚠️ IndexNow HTTP ${response.status}: ${body.slice(0, 200)}`);
    }

    return { submitted: unique.length, status: response.status };
  } catch (error) {
    console.warn("⚠️ IndexNow bildirimi başarısız:", error);
    return { submitted: 0, status: null, skipped: "error" };
  }
}
