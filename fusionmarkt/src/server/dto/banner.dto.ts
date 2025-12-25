/**
 * Banner DTO (Data Transfer Object)
 * Maps DB models to API responses with validation
 */

import { z } from "zod";
import type { BannerPublic, BannerAdmin } from "./select-presets";

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

export const BannerCardDTOSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  subtitle: z.string().nullable(),
  badge: z.string().nullable(),
  buttonText: z.string().nullable(),
  buttonLink: z.string(),
  icon: z.string().nullable(),
  gradientFrom: z.string().nullable(),
  gradientTo: z.string().nullable(),
  desktopColSpan: z.number().int().min(1).max(4),
  desktopRowSpan: z.number().int().min(1).max(2),
  mobileColSpan: z.number().int().min(1).max(2),
  mobileRowSpan: z.number().int().min(1).max(2),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export const BannerPublicDTOSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  bannerType: z.string(), // Enum as string for frontend
  placement: z.string(),  // Enum as string for frontend
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  buttonText: z.string().nullable(),
  buttonLink: z.string().nullable(),
  desktopImage: z.string().nullable(),
  mobileImage: z.string().nullable(),
  gradientFrom: z.string().nullable(),
  gradientTo: z.string().nullable(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
  cards: z.array(BannerCardDTOSchema),
});

export const BannerAdminDTOSchema = BannerPublicDTOSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================
// DTO TYPES
// ============================================

export type BannerCardDTO = z.infer<typeof BannerCardDTOSchema>;
export type BannerPublicDTO = z.infer<typeof BannerPublicDTOSchema>;
export type BannerAdminDTO = z.infer<typeof BannerAdminDTOSchema>;

// ============================================
// MAPPER FUNCTIONS
// ============================================

/**
 * Maps BannerCard from Prisma to DTO
 * Converts enums to strings
 */
export function mapBannerCardToDTO(card: BannerPublic['cards'][0]): BannerCardDTO {
  return BannerCardDTOSchema.parse({
    id: card.id,
    title: card.title,
    subtitle: card.subtitle,
    badge: card.badge,
    buttonText: card.buttonText,
    buttonLink: card.buttonLink,
    icon: card.icon,
    gradientFrom: card.gradientFrom,
    gradientTo: card.gradientTo,
    desktopColSpan: card.desktopColSpan,
    desktopRowSpan: card.desktopRowSpan,
    mobileColSpan: card.mobileColSpan,
    mobileRowSpan: card.mobileRowSpan,
    order: card.order,
    isActive: card.isActive,
  });
}

/**
 * Maps Banner from Prisma to Public DTO
 * Enums → Strings for frontend compatibility
 */
export function mapBannerToPublicDTO(banner: BannerPublic): BannerPublicDTO {
  return BannerPublicDTOSchema.parse({
    id: banner.id,
    name: banner.name,
    bannerType: String(banner.bannerType), // Enum → String
    placement: String(banner.placement),   // Enum → String
    title: banner.title,
    subtitle: banner.subtitle,
    buttonText: banner.buttonText,
    buttonLink: banner.buttonLink,
    desktopImage: banner.desktopImage,
    mobileImage: banner.mobileImage,
    gradientFrom: banner.gradientFrom,
    gradientTo: banner.gradientTo,
    order: banner.order,
    isActive: banner.isActive,
    cards: banner.cards.map(mapBannerCardToDTO),
  });
}

/**
 * Maps Banner from Prisma to Admin DTO
 * Includes timestamp fields
 */
export function mapBannerToAdminDTO(banner: BannerAdmin): BannerAdminDTO {
  return BannerAdminDTOSchema.parse({
    id: banner.id,
    name: banner.name,
    bannerType: String(banner.bannerType),
    placement: String(banner.placement),
    title: banner.title,
    subtitle: banner.subtitle,
    buttonText: banner.buttonText,
    buttonLink: banner.buttonLink,
    desktopImage: banner.desktopImage,
    mobileImage: banner.mobileImage,
    gradientFrom: banner.gradientFrom,
    gradientTo: banner.gradientTo,
    order: banner.order,
    isActive: banner.isActive,
    cards: banner.cards.map(mapBannerCardToDTO),
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
  });
}

// ============================================
// ARRAY MAPPERS
// ============================================

export function mapBannersToPublicDTO(banners: BannerPublic[]): BannerPublicDTO[] {
  return banners.map(mapBannerToPublicDTO);
}

export function mapBannersToAdminDTO(banners: BannerAdmin[]): BannerAdminDTO[] {
  return banners.map(mapBannerToAdminDTO);
}
