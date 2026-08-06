/**
 * Katalog feed katmanı
 *
 * Google Merchant XML feed'i, AI sistemleri için JSON katalog ve llms.txt
 * dosyaları aynı normalize veriden beslenir. Böylece bir kanalda görünen fiyat
 * veya stok, diğerinden farklı olmaz.
 */

import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";
import { isOnSale } from "@/lib/badge-config";

export const BASE_URL = siteConfig.url.replace(/\/$/, "");

export const CURRENCY = "TRY";

/** Ürün sayfasındaki JSON-LD ile aynı kargo/iade koşulları. */
export const SHIPPING_POLICY = {
  country: "TR",
  price: 0,
  service: "Standart",
  minHandlingDays: 0,
  maxHandlingDays: 1,
  minTransitDays: 1,
  maxTransitDays: 3,
  returnDays: 14,
  warrantyMonths: 24,
} as const;

export type CatalogAvailability = "in_stock" | "out_of_stock";

export interface CatalogSpec {
  label: string;
  value: string;
  group: string | null;
}

export interface CatalogItem {
  /** Feed içindeki benzersiz kimlik; varyantlarda ürün kimliğine son ek eklenir. */
  id: string;
  /** Varyantları tek üründe toplayan grup kimliği. */
  groupId: string | null;
  kind: "product" | "variant" | "bundle";
  slug: string;
  url: string;
  title: string;
  /** Varyant ekseni hariç ürün adı; llms listelerinde tekrarı önler. */
  baseTitle: string;
  description: string;
  brand: string;
  brandSlug: string | null;
  categoryName: string;
  categorySlug: string;
  productType: string;
  sku: string | null;
  gtin: string | null;
  mpn: string | null;
  image: string | null;
  additionalImages: string[];
  availability: CatalogAvailability;
  stock: number;
  price: number;
  /** İndirim aktifse üstü çizili liste fiyatı. */
  listPrice: number | null;
  weightKg: number | null;
  variantAxis: "size" | "color" | null;
  variantValue: string | null;
  bundleItems: { name: string; quantity: number }[];
  specs: CatalogSpec[];
  highlights: string[];
  rating: { value: number; count: number } | null;
  updatedAt: Date;
}

export interface CatalogCategory {
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
}

export interface Catalog {
  items: CatalogItem[];
  categories: CatalogCategory[];
  generatedAt: Date;
}

/**
 * Katalogdaki `brand` alanı markanın pazarlama adıyla her zaman aynı değil
 * (IEETek ürünleri üretici unvanı "Initial Entropy Energy" ile kayıtlı).
 * Merchant Center farklı yazımları ayrı marka sayar, bu yüzden tek isme indiriyoruz.
 */
const BRAND_ALIASES: { match: RegExp; name: string; slug: string }[] = [
  { match: /(ieetek|initial\s*entropy)/i, name: "IEETek", slug: "ieetek" },
  { match: /traffi/i, name: "Traffi", slug: "traffi" },
  { match: /telesteps/i, name: "Telesteps", slug: "telesteps" },
  { match: /rgp/i, name: "RGP Balls", slug: "rgp-balls" },
];

function normalizeBrand(raw: string | null | undefined, productName: string) {
  const haystack = `${raw ?? ""} ${productName}`;
  const alias = BRAND_ALIASES.find((entry) => entry.match.test(haystack));
  if (alias) return { name: alias.name, slug: alias.slug };
  const trimmed = (raw ?? "").trim();
  return { name: trimmed || siteConfig.name, slug: null };
}

export function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Merchant Center açıklama sınırı 5000 karakter. */
function buildDescription(short: string | null, long: string | null, fallback: string) {
  const parts = [short, long].filter(Boolean).map((part) => stripHtml(part as string));
  const merged = parts.join(" ").trim() || fallback;
  if (merged.length <= 4900) return merged;
  return `${merged.slice(0, 4897).trimEnd()}...`;
}

/** GTIN yalnızca 8/12/13/14 haneli olabilir; barkod alanı serbest metin. */
function normalizeGtin(barcode: string | null | undefined) {
  if (!barcode) return null;
  const digits = barcode.replace(/\D/g, "");
  return [8, 12, 13, 14].includes(digits.length) ? digits : null;
}

function absoluteImage(url: string | null | undefined) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function collectImages(thumbnail: string | null, images: string[]) {
  const all = [thumbnail, ...images]
    .map(absoluteImage)
    .filter((url): url is string => Boolean(url));
  const unique = Array.from(new Set(all));
  return { image: unique[0] ?? null, additionalImages: unique.slice(1, 11) };
}

const COLOR_HINTS = /(renk|color|siyah|beyaz|kırmızı|mavi|yeşil|sarı|turuncu|gri|lacivert)/i;

function resolveVariantAxis(type: string | null, value: string | null, colorCode: string | null) {
  if (colorCode) return "color" as const;
  if (type && /(renk|color)/i.test(type)) return "color" as const;
  if (type && /(beden|size|numara|ölçü)/i.test(type)) return "size" as const;
  if (value && COLOR_HINTS.test(value)) return "color" as const;
  return "size" as const;
}

function averageRating(reviews: { rating: number }[]) {
  if (!reviews.length) return null;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    value: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Şemada `price` zaten aktif satış fiyatı, `comparePrice` üstü çizili olan.
 * İndirim süresi dolmuşsa comparePrice yok sayılır.
 */
function resolvePricing(
  price: unknown,
  comparePrice: unknown,
  saleEndDate: Date | null,
) {
  const current = toNumber(price) ?? 0;
  const compare = toNumber(comparePrice);
  const saleActive = isOnSale(current, compare, saleEndDate);
  return { price: current, listPrice: saleActive ? compare : null };
}

function buildProductType(categoryName: string, parentName?: string | null) {
  return parentName ? `${parentName} > ${categoryName}` : categoryName;
}

export async function getCatalog(): Promise<Catalog> {
  const [products, bundles, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        comparePrice: true,
        saleEndDate: true,
        sku: true,
        barcode: true,
        stock: true,
        images: true,
        thumbnail: true,
        brand: true,
        weight: true,
        productType: true,
        updatedAt: true,
        category: {
          select: { name: true, slug: true, parent: { select: { name: true } } },
        },
        brandRef: { select: { name: true } },
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            type: true,
            value: true,
            sku: true,
            barcode: true,
            price: true,
            salePrice: true,
            stock: true,
            image: true,
            weight: true,
            colorCode: true,
          },
        },
        technicalSpecs: {
          orderBy: { order: "asc" },
          select: { label: true, value: true, group: true },
        },
        keyFeatures: {
          orderBy: { order: "asc" },
          select: { title: true },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    }),
    prisma.bundle.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        comparePrice: true,
        sku: true,
        thumbnail: true,
        images: true,
        brand: true,
        updatedAt: true,
        brandRef: { select: { name: true } },
        categories: {
          orderBy: { sortOrder: "asc" },
          select: {
            isPrimary: true,
            category: { select: { name: true, slug: true, parent: { select: { name: true } } } },
          },
        },
        items: {
          orderBy: { sortOrder: "asc" },
          select: {
            quantity: true,
            product: { select: { name: true, stock: true } },
          },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { name: true, slug: true, description: true },
    }),
  ]);

  const items: CatalogItem[] = [];

  for (const product of products) {
    const brand = normalizeBrand(product.brandRef?.name ?? product.brand, product.name);
    const { image, additionalImages } = collectImages(product.thumbnail, product.images);
    const description = buildDescription(
      product.shortDescription,
      product.description,
      `${product.name} - ${siteConfig.name}`,
    );
    const productType = buildProductType(product.category.name, product.category.parent?.name);
    const url = `${BASE_URL}/urun/${product.slug}`;
    const rating = averageRating(product.reviews);
    const basePricing = resolvePricing(product.price, product.comparePrice, product.saleEndDate);
    const specs = product.technicalSpecs.map((spec) => ({
      label: spec.label,
      value: spec.value,
      group: spec.group,
    }));
    const highlights = product.keyFeatures.map((feature) => feature.title);

    const shared = {
      groupId: product.sku || product.id,
      slug: product.slug,
      url,
      baseTitle: product.name,
      description,
      brand: brand.name,
      brandSlug: brand.slug,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      productType,
      image,
      additionalImages,
      bundleItems: [],
      specs,
      highlights,
      rating,
      updatedAt: product.updatedAt,
    };

    const sellableVariants =
      product.productType === "VARIABLE" ? product.variants.filter((variant) => variant.value || variant.name) : [];

    if (sellableVariants.length === 0) {
      items.push({
        ...shared,
        id: product.sku || product.id,
        kind: "product",
        title: product.name,
        sku: product.sku,
        gtin: normalizeGtin(product.barcode),
        mpn: product.sku,
        availability: product.stock > 0 ? "in_stock" : "out_of_stock",
        stock: product.stock,
        price: basePricing.price,
        listPrice: basePricing.listPrice,
        weightKg: toNumber(product.weight),
        variantAxis: null,
        variantValue: null,
      });
      continue;
    }

    for (const variant of sellableVariants) {
      const label = (variant.value || variant.name || "").trim();
      const variantBase = toNumber(variant.price);
      const variantSale = toNumber(variant.salePrice);
      const hasVariantSale = variantBase !== null && variantSale !== null && variantSale > 0 && variantSale < variantBase;
      const price = hasVariantSale ? variantSale : variantBase ?? basePricing.price;
      const listPrice = hasVariantSale ? variantBase : variantBase === null ? basePricing.listPrice : null;
      const variantImages = collectImages(variant.image ?? product.thumbnail, product.images);

      items.push({
        ...shared,
        ...variantImages,
        id: variant.sku || `${product.sku || product.id}-${variant.id}`,
        kind: "variant",
        title: label ? `${product.name} - ${label}` : product.name,
        sku: variant.sku ?? product.sku,
        // GTIN varyant başına benzersizdir; ürün barkodunu tüm bedenlere
        // kopyalamak Merchant Center'da "duplicate identifier" hatası verir.
        gtin: normalizeGtin(variant.barcode),
        // Varyant SKU'su dahili bir kod. MPN üretici model numarası olmalı,
        // bu da ürün seviyesindeki SKU (TD04, TG1290, P800 gibi).
        mpn: product.sku,
        availability: variant.stock > 0 ? "in_stock" : "out_of_stock",
        stock: variant.stock,
        price: price ?? 0,
        listPrice,
        weightKg: toNumber(variant.weight) ?? toNumber(product.weight),
        variantAxis: resolveVariantAxis(variant.type, label, variant.colorCode),
        variantValue: label || null,
      });
    }
  }

  for (const bundle of bundles) {
    const brand = normalizeBrand(bundle.brandRef?.name ?? bundle.brand, bundle.name);
    const { image, additionalImages } = collectImages(bundle.thumbnail, bundle.images);
    const primaryCategory =
      bundle.categories.find((entry) => entry.isPrimary)?.category ?? bundle.categories[0]?.category;
    const pricing = resolvePricing(bundle.price, bundle.comparePrice, null);
    // Pakette stok yok; içindeki her ürün istenen adette bulunmalı.
    const inStock =
      bundle.items.length > 0 && bundle.items.every((entry) => entry.product.stock >= entry.quantity);

    items.push({
      id: bundle.sku || bundle.id,
      groupId: null,
      kind: "bundle",
      slug: bundle.slug,
      url: `${BASE_URL}/urun/${bundle.slug}`,
      title: bundle.name,
      baseTitle: bundle.name,
      description: buildDescription(
        bundle.shortDescription,
        bundle.description,
        `${bundle.name} - ${siteConfig.name}`,
      ),
      brand: brand.name,
      brandSlug: brand.slug,
      categoryName: primaryCategory?.name ?? "Paket Ürünler",
      categorySlug: primaryCategory?.slug ?? "bundle-paket-urunler",
      productType: primaryCategory
        ? buildProductType(primaryCategory.name, primaryCategory.parent?.name)
        : "Paket Ürünler",
      sku: bundle.sku,
      gtin: null,
      mpn: bundle.sku,
      image,
      additionalImages,
      availability: inStock ? "in_stock" : "out_of_stock",
      stock: inStock ? 1 : 0,
      price: pricing.price,
      listPrice: pricing.listPrice,
      weightKg: null,
      variantAxis: null,
      variantValue: null,
      bundleItems: bundle.items.map((entry) => ({
        name: entry.product.name,
        quantity: entry.quantity,
      })),
      specs: [],
      highlights: [],
      rating: averageRating(bundle.reviews),
      updatedAt: bundle.updatedAt,
    });
  }

  // Varyantlar aynı ürünü temsil ettiği için kategori sayımında bir kez sayılır.
  const distinctBySlug = new Map<string, string>();
  for (const item of items) {
    distinctBySlug.set(item.slug, item.categorySlug);
  }

  return {
    items,
    categories: categories.map((category) => ({
      name: category.name,
      slug: category.slug,
      description: category.description,
      productCount: [...distinctBySlug.values()].filter((slug) => slug === category.slug).length,
    })),
    generatedAt: new Date(),
  };
}

export function formatFeedPrice(value: number) {
  return `${value.toFixed(2)} ${CURRENCY}`;
}

export function formatTryPrice(value: number) {
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value)} TL`;
}

/**
 * Feed satırları varyant bazlı; llms.txt gibi insan/model okuyan metinlerde ise
 * aynı ürünün her bedenini ayrı satır yapmak gürültü yaratıyor. Burada satırlar
 * tekrar ürün sayfası düzeyine toplanır.
 */
export interface CatalogPage {
  slug: string;
  url: string;
  title: string;
  kind: CatalogItem["kind"];
  brand: string;
  categoryName: string;
  categorySlug: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  listPrice: number | null;
  availability: CatalogAvailability;
  specs: CatalogSpec[];
  highlights: string[];
  rating: { value: number; count: number } | null;
  variants: { value: string; availability: CatalogAvailability; price: number }[];
  bundleItems: { name: string; quantity: number }[];
  updatedAt: Date;
}

export function groupCatalogByPage(items: CatalogItem[]): CatalogPage[] {
  const pages = new Map<string, CatalogPage>();

  for (const item of items) {
    const existing = pages.get(item.slug);

    if (!existing) {
      pages.set(item.slug, {
        slug: item.slug,
        url: item.url,
        title: item.baseTitle,
        kind: item.kind === "variant" ? "product" : item.kind,
        brand: item.brand,
        categoryName: item.categoryName,
        categorySlug: item.categorySlug,
        description: item.description,
        minPrice: item.price,
        maxPrice: item.price,
        listPrice: item.listPrice,
        availability: item.availability,
        specs: item.specs,
        highlights: item.highlights,
        rating: item.rating,
        variants: item.variantValue
          ? [{ value: item.variantValue, availability: item.availability, price: item.price }]
          : [],
        bundleItems: item.bundleItems,
        updatedAt: item.updatedAt,
      });
      continue;
    }

    existing.minPrice = Math.min(existing.minPrice, item.price);
    existing.maxPrice = Math.max(existing.maxPrice, item.price);
    if (item.availability === "in_stock") existing.availability = "in_stock";
    if (item.variantValue) {
      existing.variants.push({
        value: item.variantValue,
        availability: item.availability,
        price: item.price,
      });
    }
  }

  return [...pages.values()];
}
