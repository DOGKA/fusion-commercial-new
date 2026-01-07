/**
 * Slider DTO (Data Transfer Object)
 * Maps DB models to API responses with validation
 */

import { z } from "zod";
import type { SliderPublic, SliderAdmin } from "./select-presets";

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

export const SliderPublicDTOSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  badge: z.string().nullable(),
  badgeIcon: z.string().nullable(),
  title: z.string(),
  titleHighlight: z.string().nullable(),
  subtitle: z.string().nullable(),
  buttonText: z.string().nullable(),
  buttonLink: z.string().nullable(),
  buttonStyle: z.string(), // Enum as string
  button2Text: z.string().nullable(),
  button2Link: z.string().nullable(),
  button2Style: z.string(), // Enum as string
  desktopImage: z.string().nullable(),
  mobileImage: z.string().nullable(),
  backgroundVideo: z.string().nullable(),
  // Overlay - Dark Theme
  overlayColor: z.string().nullable(),
  overlayOpacity: z.number().int().min(0).max(100),
  // Overlay - Light Theme
  overlayColorLight: z.string().nullable(),
  overlayOpacityLight: z.number().int().min(0).max(100).nullable(),
  // Content Colors - Dark Theme
  titleColor: z.string().nullable(),
  subtitleColor: z.string().nullable(),
  badgeBgColor: z.string().nullable(),
  badgeTextColor: z.string().nullable(),
  buttonBgColor: z.string().nullable(),
  buttonTextColor: z.string().nullable(),
  button2BgColor: z.string().nullable(),
  button2TextColor: z.string().nullable(),
  // Content Colors - Light Theme
  titleColorLight: z.string().nullable(),
  subtitleColorLight: z.string().nullable(),
  badgeBgColorLight: z.string().nullable(),
  badgeTextColorLight: z.string().nullable(),
  buttonBgColorLight: z.string().nullable(),
  buttonTextColorLight: z.string().nullable(),
  button2BgColorLight: z.string().nullable(),
  button2TextColorLight: z.string().nullable(),
  // Title Highlight Gradient
  titleHighlightFrom: z.string().nullable(),
  titleHighlightTo: z.string().nullable(),
  titleHighlightFromLight: z.string().nullable(),
  titleHighlightToLight: z.string().nullable(),
  textAlign: z.string(), // Enum as string
  theme: z.string(), // Enum as string
  order: z.number().int().min(0),
  isActive: z.boolean(),
  showOnMobile: z.boolean(),
  showOnDesktop: z.boolean(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});

export const SliderAdminDTOSchema = SliderPublicDTOSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================
// DTO TYPES
// ============================================

export type SliderPublicDTO = z.infer<typeof SliderPublicDTOSchema>;
export type SliderAdminDTO = z.infer<typeof SliderAdminDTOSchema>;

// ============================================
// MAPPER FUNCTIONS
// ============================================

/**
 * Maps Slider from Prisma to Public DTO
 * Enums → Strings for frontend compatibility
 */
export function mapSliderToPublicDTO(slider: SliderPublic): SliderPublicDTO {
  return SliderPublicDTOSchema.parse({
    id: slider.id,
    name: slider.name,
    badge: slider.badge,
    badgeIcon: slider.badgeIcon,
    title: slider.title,
    titleHighlight: slider.titleHighlight,
    subtitle: slider.subtitle,
    buttonText: slider.buttonText,
    buttonLink: slider.buttonLink,
    buttonStyle: String(slider.buttonStyle),
    button2Text: slider.button2Text,
    button2Link: slider.button2Link,
    button2Style: String(slider.button2Style),
    desktopImage: slider.desktopImage,
    mobileImage: slider.mobileImage,
    backgroundVideo: slider.backgroundVideo,
    // Overlay - Dark Theme
    overlayColor: slider.overlayColor,
    overlayOpacity: slider.overlayOpacity,
    // Overlay - Light Theme
    overlayColorLight: slider.overlayColorLight,
    overlayOpacityLight: slider.overlayOpacityLight,
    // Content Colors - Dark Theme
    titleColor: slider.titleColor,
    subtitleColor: slider.subtitleColor,
    badgeBgColor: slider.badgeBgColor,
    badgeTextColor: slider.badgeTextColor,
    buttonBgColor: slider.buttonBgColor,
    buttonTextColor: slider.buttonTextColor,
    button2BgColor: slider.button2BgColor,
    button2TextColor: slider.button2TextColor,
    // Content Colors - Light Theme
    titleColorLight: slider.titleColorLight,
    subtitleColorLight: slider.subtitleColorLight,
    badgeBgColorLight: slider.badgeBgColorLight,
    badgeTextColorLight: slider.badgeTextColorLight,
    buttonBgColorLight: slider.buttonBgColorLight,
    buttonTextColorLight: slider.buttonTextColorLight,
    button2BgColorLight: slider.button2BgColorLight,
    button2TextColorLight: slider.button2TextColorLight,
    // Title Highlight Gradient
    titleHighlightFrom: slider.titleHighlightFrom,
    titleHighlightTo: slider.titleHighlightTo,
    titleHighlightFromLight: slider.titleHighlightFromLight,
    titleHighlightToLight: slider.titleHighlightToLight,
    textAlign: String(slider.textAlign),
    theme: String(slider.theme),
    order: slider.order,
    isActive: slider.isActive,
    showOnMobile: slider.showOnMobile,
    showOnDesktop: slider.showOnDesktop,
    startDate: slider.startDate,
    endDate: slider.endDate,
  });
}

/**
 * Maps Slider from Prisma to Admin DTO
 * Includes all admin fields
 */
export function mapSliderToAdminDTO(slider: SliderAdmin): SliderAdminDTO {
  return SliderAdminDTOSchema.parse({
    ...mapSliderToPublicDTO(slider),
    createdAt: slider.createdAt,
    updatedAt: slider.updatedAt,
  });
}

// ============================================
// ARRAY MAPPERS
// ============================================

export function mapSlidersToPublicDTO(sliders: SliderPublic[]): SliderPublicDTO[] {
  return sliders.map(mapSliderToPublicDTO);
}

export function mapSlidersToAdminDTO(sliders: SliderAdmin[]): SliderAdminDTO[] {
  return sliders.map(mapSliderToAdminDTO);
}

// ============================================
// FILTER HELPERS
// ============================================

/**
 * Filters active sliders that should be shown now
 * Checks: isActive, date range, device visibility
 */
export function filterActiveSliders(
  sliders: SliderPublicDTO[],
  device: 'mobile' | 'desktop' = 'desktop'
): SliderPublicDTO[] {
  const now = new Date();
  
  return sliders.filter(slider => {
    // Must be active
    if (!slider.isActive) return false;
    
    // Device visibility
    if (device === 'mobile' && !slider.showOnMobile) return false;
    if (device === 'desktop' && !slider.showOnDesktop) return false;
    
    // Date range check
    if (slider.startDate && slider.startDate > now) return false;
    if (slider.endDate && slider.endDate < now) return false;
    
    return true;
  });
}
