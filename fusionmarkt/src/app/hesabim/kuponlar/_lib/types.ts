/** `GET /api/user/coupons` yanıtının istemci tarafı sözleşmesi. */

export type CouponUrgency = "last_day" | "last_3_days" | "last_7_days" | null;

export interface CouponRefItem {
  id: string;
  name: string;
  slug: string;
}

export interface CouponRestrictions {
  /** Kuponun YALNIZCA geçerli olduğu kategoriler (boşsa kısıt yok). */
  categories: CouponRefItem[];
  /** Kuponun YALNIZCA geçerli olduğu ürünler (boşsa kısıt yok). */
  products: CouponRefItem[];
  excludedCategories: CouponRefItem[];
  excludedProducts: CouponRefItem[];
  excludeSaleItems: boolean;
}

export interface UserCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  endDate: string | null;
  freeShipping: boolean;
  /** Kişi başı kullanım hakkı; 0 = sınırsız. Hakkı dolan kupon listeye gelmiyor. */
  perUserLimit: number;
  urgency: CouponUrgency;
  /** Kartın orta bandındaki koşul cümlesi — sunucuda türetiliyor. */
  conditionText: string;
  /** "Ürünlere git" hedefi; kupon tek bir yere kilitli değilse `/magaza`. */
  targetUrl: string;
  restrictions: CouponRestrictions;
}

export interface UserCouponsResponse {
  coupons: UserCoupon[];
  count: number;
}
