/**
 * @repo/db - Shared Database Package
 * 
 * This package provides:
 * - Single canonical Prisma schema
 * - Shared Prisma client instance
 * - Type-safe database access
 * 
 * Migration owner: This package
 * Consumers: fusionmarkt, nextadmin
 */

// Prisma Client
export { prisma } from "./client";

// Re-export Prisma types for convenience
export * from "@prisma/client";

// Package info
export const DB_PACKAGE_VERSION = "0.0.1";
export const MIGRATION_OWNER = "packages/db";
