/**
 * Application Configuration
 * Centralized config with environment variables
 */

// Upload Limits
export const UPLOAD_CONFIG = {
  // General media upload limit (MB)
  MAX_UPLOAD_MB: parseInt(process.env.MAX_UPLOAD_MB || "10", 10),
  
  // User photo specific limit (MB)
  USER_PHOTO_MAX_MB: parseInt(process.env.USER_PHOTO_MAX_MB || "5", 10),
  
  // Allowed image types
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  
  // User avatar dimensions
  AVATAR_SIZE: 512,
  AVATAR_FORMAT: "webp" as const,
  AVATAR_QUALITY: 85,
} as const;

// S3 Configuration
export const S3_CONFIG = {
  REGION: process.env.AWS_REGION || "eu-central-1",
  BUCKET: process.env.AWS_S3_BUCKET || "fusionmarkt",
  PREFIX: process.env.S3_PREFIX || "fusionmarkt",
  PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL || process.env.AWS_CLOUDFRONT_URL,
  PRESIGN_EXPIRY: 300, // 5 minutes
} as const;

// Storage paths
export const STORAGE_CONFIG = {
  BASE_PATH: process.env.STORAGE_PATH || "./storage",
  USERS_PATH: "users",
  AVATAR_FILENAME: "avatar.webp",
} as const;

// Helper functions
export function getMaxUploadBytes(): number {
  return UPLOAD_CONFIG.MAX_UPLOAD_MB * 1024 * 1024;
}

export function getUserPhotoMaxBytes(): number {
  return UPLOAD_CONFIG.USER_PHOTO_MAX_MB * 1024 * 1024;
}

export function isAllowedImageType(mimeType: string): boolean {
  return UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType as any);
}
