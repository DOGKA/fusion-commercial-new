/**
 * Banner Validation Schemas
 * For Admin API request body validation
 */

import { z } from "zod";

// Banner Card Creation/Update Schema
export const BannerCardInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  buttonText: z.string().nullable().optional(),
  buttonLink: z.string().min(1, "Button link is required"),
  icon: z.string().nullable().optional(),
  desktopImage: z.string().nullable().optional(),
  mobileImage: z.string().nullable().optional(),
  gradientFrom: z.string().nullable().optional(),
  gradientTo: z.string().nullable().optional(),
  desktopColSpan: z.number().int().min(1).max(4).default(1),
  desktopRowSpan: z.number().int().min(1).max(2).default(1),
  mobileColSpan: z.number().int().min(1).max(2).default(1),
  mobileRowSpan: z.number().int().min(1).max(2).default(1),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
});

// Banner Creation Schema
export const CreateBannerSchema = z.object({
  name: z.string().min(1, "Banner name is required"),
  bannerType: z.enum(["SINGLE", "GRID", "CAROUSEL", "HERO", "CATEGORY", "CATEGORY_GRID"]).default("GRID"),
  placement: z.string().min(1, "Placement is required"),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  buttonText: z.string().nullable().optional(),
  buttonLink: z.string().nullable().optional(),
  desktopImage: z.string().nullable().optional(),
  mobileImage: z.string().nullable().optional(),
  backgroundColor: z.string().nullable().optional(),
  gradientFrom: z.string().nullable().optional(),
  gradientTo: z.string().nullable().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  cards: z.array(BannerCardInputSchema).optional(),
});

// Banner Update Schema (all fields optional)
export const UpdateBannerSchema = z.object({
  name: z.string().min(1).optional(),
  bannerType: z.enum(["SINGLE", "GRID", "CAROUSEL", "HERO", "CATEGORY", "CATEGORY_GRID"]).optional(),
  placement: z.string().optional(),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  buttonText: z.string().nullable().optional(),
  buttonLink: z.string().nullable().optional(),
  desktopImage: z.string().nullable().optional(),
  mobileImage: z.string().nullable().optional(),
  backgroundColor: z.string().nullable().optional(),
  gradientFrom: z.string().nullable().optional(),
  gradientTo: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  cards: z.array(BannerCardInputSchema).optional(),
});

// Types
export type CreateBannerInput = z.infer<typeof CreateBannerSchema>;
export type UpdateBannerInput = z.infer<typeof UpdateBannerSchema>;
export type BannerCardInput = z.infer<typeof BannerCardInputSchema>;
