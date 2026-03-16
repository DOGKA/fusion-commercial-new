/**
 * Slider Validation Schemas
 * For Admin API request body validation
 */

import { z } from "zod";

// Slider Creation Schema
export const CreateSliderSchema = z.object({
  name: z.string().min(1, "Slider name is required"),
  badge: z.string().nullable().optional(),
  badgeIcon: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  titleHighlight: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  buttonText: z.string().nullable().optional(),
  buttonLink: z.string().nullable().optional(),
  buttonStyle: z.enum(["PRIMARY", "SECONDARY", "OUTLINE", "GHOST"]).default("PRIMARY"),
  button2Text: z.string().nullable().optional(),
  button2Link: z.string().nullable().optional(),
  button2Style: z.enum(["PRIMARY", "SECONDARY", "OUTLINE", "GHOST"]).default("SECONDARY"),
  desktopImage: z.string().nullable().optional(),
  mobileImage: z.string().nullable().optional(),
  backgroundVideo: z.string().nullable().optional(),
  gradientFrom: z.string().nullable().optional(),
  gradientTo: z.string().nullable().optional(),
  // Overlay - Dark Theme (Default)
  overlayColor: z.string().nullable().optional(),
  overlayOpacity: z.number().int().min(0).max(100).default(50),
  // Overlay - Light Theme
  overlayColorLight: z.string().nullable().optional(),
  overlayOpacityLight: z.number().int().min(0).max(100).nullable().optional(),
  // Content Colors - Dark Theme (Default)
  titleColor: z.string().nullable().optional(),
  subtitleColor: z.string().nullable().optional(),
  badgeBgColor: z.string().nullable().optional(),
  badgeTextColor: z.string().nullable().optional(),
  buttonBgColor: z.string().nullable().optional(),
  buttonTextColor: z.string().nullable().optional(),
  button2BgColor: z.string().nullable().optional(),
  button2TextColor: z.string().nullable().optional(),
  // Content Colors - Light Theme
  titleColorLight: z.string().nullable().optional(),
  subtitleColorLight: z.string().nullable().optional(),
  badgeBgColorLight: z.string().nullable().optional(),
  badgeTextColorLight: z.string().nullable().optional(),
  buttonBgColorLight: z.string().nullable().optional(),
  buttonTextColorLight: z.string().nullable().optional(),
  button2BgColorLight: z.string().nullable().optional(),
  button2TextColorLight: z.string().nullable().optional(),
  // Title Highlight Gradient - Dark Theme
  titleHighlightFrom: z.string().nullable().optional(),
  titleHighlightTo: z.string().nullable().optional(),
  // Title Highlight Gradient - Light Theme
  titleHighlightFromLight: z.string().nullable().optional(),
  titleHighlightToLight: z.string().nullable().optional(),
  textAlign: z.enum(["LEFT", "CENTER", "RIGHT"]).default("LEFT"),
  theme: z.enum(["DARK", "LIGHT", "GRADIENT", "CUSTOM"]).default("DARK"),
  effect: z.enum(["NONE", "FADE", "SLIDE", "PARALLAX", "ZOOM", "CUBE"]).default("FADE"),
  effectSpeed: z.number().int().min(0).default(500),
  animation: z.string().nullable().optional(),
  animationDelay: z.number().int().min(0).default(0),
  autoplay: z.boolean().default(true),
  autoplayDelay: z.number().int().min(1000).default(5000),
  loop: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  showOnMobile: z.boolean().default(true),
  showOnDesktop: z.boolean().default(true),
  startDate: z.string().datetime().nullable().optional().transform((val: string | null | undefined) => val ? new Date(val) : null),
  endDate: z.string().datetime().nullable().optional().transform((val: string | null | undefined) => val ? new Date(val) : null),
});

// Slider Update Schema (all fields optional)
export const UpdateSliderSchema = z.object({
  name: z.string().min(1).optional(),
  badge: z.string().nullable().optional(),
  badgeIcon: z.string().nullable().optional(),
  title: z.string().min(1).optional(),
  titleHighlight: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  buttonText: z.string().nullable().optional(),
  buttonLink: z.string().nullable().optional(),
  buttonStyle: z.enum(["PRIMARY", "SECONDARY", "OUTLINE", "GHOST"]).optional(),
  button2Text: z.string().nullable().optional(),
  button2Link: z.string().nullable().optional(),
  button2Style: z.enum(["PRIMARY", "SECONDARY", "OUTLINE", "GHOST"]).optional(),
  desktopImage: z.string().nullable().optional(),
  mobileImage: z.string().nullable().optional(),
  backgroundVideo: z.string().nullable().optional(),
  gradientFrom: z.string().nullable().optional(),
  gradientTo: z.string().nullable().optional(),
  // Overlay - Dark Theme (Default)
  overlayColor: z.string().nullable().optional(),
  overlayOpacity: z.number().int().min(0).max(100).optional(),
  // Overlay - Light Theme
  overlayColorLight: z.string().nullable().optional(),
  overlayOpacityLight: z.number().int().min(0).max(100).nullable().optional(),
  // Content Colors - Dark Theme (Default)
  titleColor: z.string().nullable().optional(),
  subtitleColor: z.string().nullable().optional(),
  badgeBgColor: z.string().nullable().optional(),
  badgeTextColor: z.string().nullable().optional(),
  buttonBgColor: z.string().nullable().optional(),
  buttonTextColor: z.string().nullable().optional(),
  button2BgColor: z.string().nullable().optional(),
  button2TextColor: z.string().nullable().optional(),
  // Content Colors - Light Theme
  titleColorLight: z.string().nullable().optional(),
  subtitleColorLight: z.string().nullable().optional(),
  badgeBgColorLight: z.string().nullable().optional(),
  badgeTextColorLight: z.string().nullable().optional(),
  buttonBgColorLight: z.string().nullable().optional(),
  buttonTextColorLight: z.string().nullable().optional(),
  button2BgColorLight: z.string().nullable().optional(),
  button2TextColorLight: z.string().nullable().optional(),
  // Title Highlight Gradient - Dark Theme
  titleHighlightFrom: z.string().nullable().optional(),
  titleHighlightTo: z.string().nullable().optional(),
  // Title Highlight Gradient - Light Theme
  titleHighlightFromLight: z.string().nullable().optional(),
  titleHighlightToLight: z.string().nullable().optional(),
  textAlign: z.enum(["LEFT", "CENTER", "RIGHT"]).optional(),
  theme: z.enum(["DARK", "LIGHT", "GRADIENT", "CUSTOM"]).optional(),
  effect: z.enum(["NONE", "FADE", "SLIDE", "PARALLAX", "ZOOM", "CUBE"]).optional(),
  effectSpeed: z.number().int().min(0).optional(),
  animation: z.string().nullable().optional(),
  animationDelay: z.number().int().min(0).optional(),
  autoplay: z.boolean().optional(),
  autoplayDelay: z.number().int().min(1000).optional(),
  loop: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  showOnMobile: z.boolean().optional(),
  showOnDesktop: z.boolean().optional(),
  startDate: z.string().datetime().nullable().optional().transform((val: string | null | undefined) => val ? new Date(val) : null),
  endDate: z.string().datetime().nullable().optional().transform((val: string | null | undefined) => val ? new Date(val) : null),
});

// Types
export type CreateSliderInput = z.infer<typeof CreateSliderSchema>;
export type UpdateSliderInput = z.infer<typeof UpdateSliderSchema>;
