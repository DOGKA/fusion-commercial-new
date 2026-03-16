// ═══════════════════════════════════════════════════════════════════════════
// CAMPAIGN TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CouponBadge {
  text: string;
  variant: 'primary' | 'secondary' | 'warning' | 'success' | 'danger';
}

export interface CouponProduct {
  id: string;
  name: string;
  image?: string;
}

export interface CouponCondition {
  type: 'min_cart' | 'min_quantity' | 'specific_products' | 'first_order' | 'membership';
  value: string;
  label: string;
}

export interface Coupon {
  id: string;
  name: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  badges: CouponBadge[];
  validProducts?: CouponProduct[];
  expiresAt: Date;
  conditions: CouponCondition[];
  maxUses?: number;
  remainingUses?: number;
  code?: string; // Kullanıcıya özel claim edilmiş kod
  isClaimed?: boolean;
}

export interface ClaimState {
  couponId: string;
  status: 'idle' | 'claiming' | 'claimed' | 'error';
  code?: string;
  error?: string;
}
