/** Yeni kurulumda önerilen kategoriler; yazılarda kullanılanlar listeye eklenir. */
export const DEFAULT_BLOG_CATEGORIES = [
  "Enerji",
  "Solar",
  "Teknik",
  "Rehber",
  "Karşılaştırma",
  "Karavan",
  "İş Güvenliği",
] as const;

export const BLOG_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export const BLOG_STATUS_LABEL: Record<BlogStatus, string> = {
  DRAFT: "Taslak",
  PUBLISHED: "Yayında",
  ARCHIVED: "Arşiv",
};

export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  status: BlogStatus;
  featuredImage: string | null;
  viewCount: number;
  publishedAt: string | null;
  updatedAt: string | null;
}

export interface BlogPost extends BlogListItem {
  content: string;
  excerpt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export type BlogPostInput = Pick<
  BlogPost,
  | "slug"
  | "title"
  | "category"
  | "status"
  | "featuredImage"
  | "content"
  | "excerpt"
  | "metaTitle"
  | "metaDescription"
>;

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
  ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
};

export function slugify(text: string): string {
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 90)
    .replace(/-+$/, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function storeOrigin(): string {
  return (process.env.NEXT_PUBLIC_FRONTEND_URL || "https://fusionmarkt.com").replace(/\/+$/, "");
}

export function sitePostUrl(slug: string): string {
  return `${storeOrigin()}/blog/${slug}`;
}

/** Listede küçük sürüm yeter. */
export function coverThumb(src: string | null | undefined): string | null {
  return src ? src.replace(/-1600\.webp$/, "-800.webp") : null;
}
