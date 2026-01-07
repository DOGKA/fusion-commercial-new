/**
 * Prisma Select Presets
 * Define what fields each consumer (public/admin) should receive
 * 
 * Philosophy:
 * - Public (Frontend): Minimal data for display
 * - Admin: Full data for management
 */

import { Prisma } from "@repo/db";

// ============================================
// BANNER SELECT PRESETS
// ============================================

export const selectBannerPublic = {
  id: true,
  name: true,
  bannerType: true,
  placement: true,
  title: true,
  subtitle: true,
  buttonText: true,
  buttonLink: true,
  desktopImage: true,
  mobileImage: true,
  gradientFrom: true,
  gradientTo: true,
  order: true,
  isActive: true,
  cards: {
    select: {
      id: true,
      title: true,
      subtitle: true,
      badge: true,
      buttonText: true,
      buttonLink: true,
      icon: true,
      gradientFrom: true,
      gradientTo: true,
      desktopColSpan: true,
      desktopRowSpan: true,
      mobileColSpan: true,
      mobileRowSpan: true,
      order: true,
      isActive: true,
    },
    orderBy: { order: 'asc' as const },
  },
} satisfies Prisma.BannerSelect;

export const selectBannerAdmin = {
  ...selectBannerPublic,
  createdAt: true,
  updatedAt: true,
  cards: {
    select: {
      ...selectBannerPublic.cards.select,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { order: 'asc' as const },
  },
} satisfies Prisma.BannerSelect;

// ============================================
// SLIDER SELECT PRESETS
// ============================================

export const selectSliderPublic = {
  id: true,
  name: true,
  badge: true,
  badgeIcon: true,
  title: true,
  titleHighlight: true,
  subtitle: true,
  buttonText: true,
  buttonLink: true,
  buttonStyle: true,
  button2Text: true,
  button2Link: true,
  button2Style: true,
  desktopImage: true,
  mobileImage: true,
  backgroundVideo: true,
  // Overlay - Dark Theme
  overlayColor: true,
  overlayOpacity: true,
  // Overlay - Light Theme
  overlayColorLight: true,
  overlayOpacityLight: true,
  // Content Colors - Dark Theme
  titleColor: true,
  subtitleColor: true,
  badgeBgColor: true,
  badgeTextColor: true,
  buttonBgColor: true,
  buttonTextColor: true,
  button2BgColor: true,
  button2TextColor: true,
  // Content Colors - Light Theme
  titleColorLight: true,
  subtitleColorLight: true,
  badgeBgColorLight: true,
  badgeTextColorLight: true,
  buttonBgColorLight: true,
  buttonTextColorLight: true,
  button2BgColorLight: true,
  button2TextColorLight: true,
  // Title Highlight Gradient
  titleHighlightFrom: true,
  titleHighlightTo: true,
  titleHighlightFromLight: true,
  titleHighlightToLight: true,
  textAlign: true,
  theme: true,
  order: true,
  isActive: true,
  showOnMobile: true,
  showOnDesktop: true,
  startDate: true,
  endDate: true,
} satisfies Prisma.SliderSelect;

export const selectSliderAdmin = {
  ...selectSliderPublic,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SliderSelect;

// ============================================
// CATEGORY SELECT PRESETS
// ============================================

export const selectCategoryPublic = {
  id: true,
  name: true,
  slug: true,
  description: true,
  image: true,
  icon: true,
  themeColor: true, // Kategori tema rengi (shimmer, banner, filtre paneli için)
  order: true,
  isActive: true,
} satisfies Prisma.CategorySelect;

export const selectCategoryAdmin = {
  ...selectCategoryPublic,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      products: true,
      children: true,
    },
  },
} satisfies Prisma.CategorySelect;

// ============================================
// PRODUCT SELECT PRESETS
// ============================================

export const selectProductPublic = {
  id: true,
  name: true,
  slug: true,
  description: true,
  shortDescription: true,
  price: true,
  comparePrice: true,
  // Sistem rozetleri için gerekli alanlar
  // NOT: Schema'da price = indirimli fiyat, comparePrice = orijinal fiyat
  saleEndDate: true,    // İndirim bitiş tarihi
  createdAt: true,      // Yeni ürün kontrolü için
  sku: true,
  stock: true,
  images: true,
  thumbnail: true,
  videoUrl: true,
  brand: true,
  weight: true,
  dimensions: true,
  isActive: true,
  isFeatured: true,
  isNew: true,
  freeShipping: true,
  productType: true,    // Basit/Varyasyonlu ürün kontrolü için
  categoryId: true,
  category: {
    select: selectCategoryPublic,
  },
  productBadges: {
    where: {
      badge: {
        isActive: true,
      },
    },
    select: {
      position: true,
      badge: {
        select: {
          id: true,
          label: true,
          slug: true,
          color: true,
          bgColor: true,
          icon: true,
          priority: true,
        },
      },
    },
    orderBy: {
      position: 'asc' as const,
    },
  },
}; // Note: Run `prisma generate` after schema changes

// Variant include for public API - separate to avoid type issues
export const includeProductVariantsPublic = {
  variants: {
    where: { isActive: true },
    include: {
      variantOptions: {
        include: {
          attribute: true,
          attributeValue: true,
        },
      },
    },
  },
};

export const selectProductAdmin = {
  ...selectProductPublic,
  costPrice: true,
  barcode: true,
  lowStockAlert: true,
  metaTitle: true,
  metaDescription: true,
  metaKeywords: true,
  shippingClass: true,
  productType: true,
  publishedAt: true,
  // createdAt zaten selectProductPublic'te var
  updatedAt: true,
  _count: {
    select: {
      variants: true,
      reviews: true,
      orderItems: true,
      // productBadges: true, // Prisma generate gerekli
    },
  },
}; // Note: Run `prisma generate` after schema changes

// ============================================
// TYPE INFERENCE
// ============================================

export type BannerPublic = Prisma.BannerGetPayload<{ select: typeof selectBannerPublic }>;
export type BannerAdmin = Prisma.BannerGetPayload<{ select: typeof selectBannerAdmin }>;
export type SliderPublic = Prisma.SliderGetPayload<{ select: typeof selectSliderPublic }>;
export type SliderAdmin = Prisma.SliderGetPayload<{ select: typeof selectSliderAdmin }>;
export type CategoryPublic = Prisma.CategoryGetPayload<{ select: typeof selectCategoryPublic }>;
export type CategoryAdmin = Prisma.CategoryGetPayload<{ select: typeof selectCategoryAdmin }>;
export type ProductPublic = Prisma.ProductGetPayload<{ select: typeof selectProductPublic }>;
export type ProductAdmin = Prisma.ProductGetPayload<{ select: typeof selectProductAdmin }>;
