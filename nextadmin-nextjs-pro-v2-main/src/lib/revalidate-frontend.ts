/**
 * Utility to revalidate cache on the frontend (fusionmarkt) app
 * 
 * Called after admin CRUD operations to ensure frontend shows fresh data
 * 
 * Required Environment Variables:
 * - FRONTEND_URL: Frontend app URL (e.g., https://fusionmarkt.com)
 * - REVALIDATE_SECRET: Shared secret for revalidation (min 32 chars recommended)
 */

const FRONTEND_URL = process.env.FRONTEND_URL;
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

// Validate configuration on module load
if (!FRONTEND_URL) {
  console.warn("⚠️  FRONTEND_URL not set! Revalidation will fail.");
}
if (!REVALIDATE_SECRET) {
  console.warn("⚠️  REVALIDATE_SECRET not set! Revalidation will fail.");
}

export type RevalidateTag = "banners" | "sliders" | "products" | "categories" | "homepage";

interface RevalidateOptions {
  tags?: RevalidateTag[];
  path?: string;
}

interface RevalidateResult {
  success: boolean;
  revalidated?: boolean;
  error?: string;
}

/**
 * Revalidate frontend cache after admin operations
 * 
 * @example
 * // After saving a banner:
 * await revalidateFrontend({ tags: ["banners", "homepage"] });
 * 
 * // After saving a slider:
 * await revalidateFrontend({ tags: ["sliders", "homepage"] });
 * 
 * // Revalidate specific path:
 * await revalidateFrontend({ path: "/" });
 */
export async function revalidateFrontend(options: RevalidateOptions): Promise<RevalidateResult> {
  // Validate configuration before making request
  if (!FRONTEND_URL || !REVALIDATE_SECRET) {
    console.error("❌ [REVALIDATE FRONTEND] Missing FRONTEND_URL or REVALIDATE_SECRET");
    return { success: false, error: "Revalidation not configured" };
  }

  try {
    const response = await fetch(`${FRONTEND_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": REVALIDATE_SECRET,
      },
      body: JSON.stringify({
        tags: options.tags,
        path: options.path,
      }),
      // Don't cache this request
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("❌ [REVALIDATE FRONTEND] Failed:", error);
      return { success: false, error: error.error || `HTTP ${response.status}` };
    }

    const result = await response.json();
    console.log("✅ [REVALIDATE FRONTEND] Success:", result);
    return { success: true, revalidated: result.revalidated };
  } catch (error: any) {
    console.error("❌ [REVALIDATE FRONTEND] Network error:", error.message);
    // Don't fail the main operation if revalidation fails
    return { success: false, error: error.message };
  }
}

/**
 * Helper for banner-related revalidation
 */
export async function revalidateBanners(placement?: string): Promise<RevalidateResult> {
  const tags: RevalidateTag[] = ["banners"];
  
  // If homepage placement, also revalidate homepage
  if (
    !placement ||
    placement === "HOME_HERO" ||
    placement === "HOME_CATEGORY" ||
    placement === "HOME_PROMO" ||
    placement === "HOME_BOTTOM"
  ) {
    tags.push("homepage");
  }
  
  // For SHOP placements, also revalidate shop-related paths
  const result = await revalidateFrontend({ tags });
  
  // If SHOP_HEADER or SHOP_CATEGORY, also revalidate /magaza path
  if (placement === "SHOP_HEADER" || placement?.startsWith("SHOP_CATEGORY_")) {
    await revalidateFrontend({ path: "/magaza" });
  }
  
  return result;
}

/**
 * Helper for slider-related revalidation
 */
export async function revalidateSliders(): Promise<RevalidateResult> {
  return revalidateFrontend({ tags: ["sliders", "homepage"] });
}
