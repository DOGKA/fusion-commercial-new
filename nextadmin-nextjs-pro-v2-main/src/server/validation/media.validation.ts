/**
 * Media Validation Schemas
 * For Admin API request body validation
 * 
 * Maps frontend "usage" to DB schema fields (provider, usage, alt required)
 */

import { z } from "zod";

// Allowed MIME types for media uploads
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
] as const;

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
] as const;

const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES] as const;

// Presign request validation (frontend usage → DB usage mapping)
export const PresignUploadSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  size: z.number().int().positive().max(100 * 1024 * 1024, "File too large (max 100MB)"),
  usage: z.enum(["USER_PHOTO", "BANNER", "SLIDER", "PRODUCT", "CATEGORY", "OTHER"]).default("OTHER"),
});

// Create media record validation (matches @repo/db Media model exactly)
export const CreateMediaSchema = z.object({
  provider: z.enum(["LOCAL", "S3"]).default("S3"),
  filename: z.string().min(1),
  key: z.string().min(1),
  url: z.string().url(),
  mimeType: z.string(),
  size: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  alt: z.string().min(1, "Alt text is required for SEO"),
  title: z.string().optional(),
  description: z.string().optional(),
  usage: z.enum(["USER_PHOTO", "BANNER", "SLIDER", "PRODUCT", "CATEGORY", "OTHER"]).default("OTHER"),
  ownerUserId: z.string().cuid().optional(),
  uploadedBy: z.string().cuid().optional(),
});

// Update SEO metadata validation
export const UpdateMediaSEOSchema = z.object({
  alt: z.string().min(1, "Alt text is required"), // ZORUNLU
  title: z.string().optional(),
  description: z.string().optional(),
});

// Types
export type PresignUploadInput = z.infer<typeof PresignUploadSchema>;
export type CreateMediaInput = z.infer<typeof CreateMediaSchema>;
export type UpdateMediaSEOInput = z.infer<typeof UpdateMediaSEOSchema>;
