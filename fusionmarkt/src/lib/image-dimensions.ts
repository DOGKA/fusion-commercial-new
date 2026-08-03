import "server-only";

import { siteConfig } from "@/lib/seo";

/**
 * Ürün açıklamalarındaki uzaktan görsellerin gerçek boyutlarını okuyup `<img>`
 * etiketlerine `width`/`height` olarak yazar.
 *
 * Açıklama HTML'i editörden boyutsuz geliyor; boyutsuz + lazy görseller yüklenene
 * kadar 0px yer kapladığı için sayfa scroll sırasında sıçrıyordu. Dosyanın ilk
 * baytlarını Range isteğiyle çekip başlıktan boyutu okumak, tam görseli indirmeden
 * yer ayırmayı mümkün kılıyor.
 */

export interface ImageSize {
  width: number;
  height: number;
}

// WebP/PNG/GIF boyutu ilk 32 baytta; JPEG'de SOF çerçevesi EXIF önizlemesinin
// arkasına düşebildiği için gerekirse ikinci ve daha geniş bir istek yapılır.
const HEADER_BYTES = 4 * 1024;
const JPEG_FALLBACK_BYTES = 64 * 1024;
const FETCH_TIMEOUT_MS = 4000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_IMAGES_PER_DOCUMENT = 40;
const MAX_PARALLEL_PROBES = 8;

type CacheEntry = { size: ImageSize | null; expiresAt: number };

const sizeCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<ImageSize | null>>();

function readUint16BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUint16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] << 24) >>> 0) +
    (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) +
    bytes[offset + 3]
  );
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function parseWebp(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 30) return null;
  const format = ascii(bytes, 12, 4);

  // Genişletilmiş format: canvas boyutu 24 bit, "eksi bir" olarak saklanır
  if (format === "VP8X") {
    return {
      width: (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)) + 1,
      height: (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) + 1,
    };
  }

  // Kayıpsız: 14+14 bit paketlenmiş
  if (format === "VP8L") {
    const packed =
      bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
    return {
      width: (packed & 0x3fff) + 1,
      height: ((packed >> 14) & 0x3fff) + 1,
    };
  }

  // Kayıplı: 0x9d 0x01 0x2a start code'undan sonra 14'er bit
  if (format === "VP8 ") {
    return {
      width: readUint16LE(bytes, 26) & 0x3fff,
      height: readUint16LE(bytes, 28) & 0x3fff,
    };
  }

  return null;
}

function parseJpeg(bytes: Uint8Array): ImageSize | null {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    // SOF0-SOF15, DHT/JPG/DAC hariç: boyut bilgisini taşıyan çerçeve başlıkları
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      return {
        width: readUint16BE(bytes, offset + 7),
        height: readUint16BE(bytes, offset + 5),
      };
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9) || marker === 0x01) {
      offset += 2;
      continue;
    }
    const segmentLength = readUint16BE(bytes, offset + 2);
    if (segmentLength < 2) return null;
    offset += 2 + segmentLength;
  }
  return null;
}

export function parseImageSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 16) return null;

  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return parseWebp(bytes);
  }

  // PNG: IHDR chunk'ı her zaman ilk chunk'tır
  if (bytes[0] === 0x89 && ascii(bytes, 1, 3) === "PNG") {
    return { width: readUint32BE(bytes, 16), height: readUint32BE(bytes, 20) };
  }

  if (ascii(bytes, 0, 3) === "GIF") {
    return { width: readUint16LE(bytes, 6), height: readUint16LE(bytes, 8) };
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return parseJpeg(bytes);
  }

  return null;
}

function toAbsoluteUrl(src: string): string | null {
  try {
    return new URL(src, siteConfig.url).toString();
  } catch {
    return null;
  }
}

async function fetchHeader(url: string, byteCount: number): Promise<Uint8Array | null> {
  const response = await fetch(url, {
    headers: { Range: `bytes=0-${byteCount - 1}` },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    next: { revalidate: 60 * 60 * 24 * 30 },
  });
  if (!response.ok) return null;

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer.slice(0, byteCount));
}

async function probeImageSize(src: string): Promise<ImageSize | null> {
  const url = toAbsoluteUrl(src);
  if (!url || !/^https?:$/.test(new URL(url).protocol)) return null;

  try {
    const header = await fetchHeader(url, HEADER_BYTES);
    if (!header) return null;

    const size = parseImageSize(header);
    if (size) return size;

    const isJpeg = header[0] === 0xff && header[1] === 0xd8;
    if (!isJpeg) return null;

    const largerHeader = await fetchHeader(url, JPEG_FALLBACK_BYTES);
    return largerHeader ? parseImageSize(largerHeader) : null;
  } catch {
    return null;
  }
}

async function getImageSize(src: string): Promise<ImageSize | null> {
  const cached = sizeCache.get(src);
  if (cached && cached.expiresAt > Date.now()) return cached.size;

  const pending = inFlight.get(src);
  if (pending) return pending;

  const promise = probeImageSize(src)
    .then((size) => {
      sizeCache.set(src, { size, expiresAt: Date.now() + CACHE_TTL_MS });
      return size;
    })
    .finally(() => {
      inFlight.delete(src);
    });

  inFlight.set(src, promise);
  return promise;
}

async function resolveSizes(sources: string[]): Promise<Map<string, ImageSize>> {
  const sizes = new Map<string, ImageSize>();

  for (let i = 0; i < sources.length; i += MAX_PARALLEL_PROBES) {
    const chunk = sources.slice(i, i + MAX_PARALLEL_PROBES);
    const results = await Promise.all(chunk.map((src) => getImageSize(src)));
    chunk.forEach((src, index) => {
      const size = results[index];
      if (size) sizes.set(src, size);
    });
  }

  return sizes;
}

const IMG_TAG_PATTERN = /<img\b([^>]*)>/gi;

function readSrc(attrs: string): string | undefined {
  return attrs.match(/\ssrc\s*=\s*["']([^"']+)["']/i)?.[1];
}

function hasBothSizeAttrs(attrs: string): boolean {
  return /\swidth\s*=\s*["']\d+["']/i.test(attrs) && /\sheight\s*=\s*["']\d+["']/i.test(attrs);
}

/**
 * Açıklama HTML'indeki boyutsuz `<img>` etiketlerine gerçek `width`/`height`
 * ekler. Boyut okunamayan görseller olduğu gibi bırakılır.
 */
export async function withImageDimensions(html: string | null | undefined): Promise<string> {
  if (!html) return html ?? "";

  const pendingSources = new Set<string>();
  for (const match of html.matchAll(IMG_TAG_PATTERN)) {
    const attrs = match[1];
    if (hasBothSizeAttrs(attrs)) continue;
    const src = readSrc(attrs);
    if (src) pendingSources.add(src);
    if (pendingSources.size >= MAX_IMAGES_PER_DOCUMENT) break;
  }

  if (pendingSources.size === 0) return html;

  const sizes = await resolveSizes([...pendingSources]);
  if (sizes.size === 0) return html;

  return html.replace(IMG_TAG_PATTERN, (match, attrs: string) => {
    if (hasBothSizeAttrs(attrs)) return match;
    const src = readSrc(attrs);
    const size = src ? sizes.get(src) : undefined;
    if (!size) return match;

    const cleanedAttrs = attrs
      .replace(/\/\s*$/, "")
      .replace(/\s(width|height)\s*=\s*["'][^"']*["']/gi, "")
      .trim();

    return `<img ${cleanedAttrs} width="${size.width}" height="${size.height}">`;
  });
}
