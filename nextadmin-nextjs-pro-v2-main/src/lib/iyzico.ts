/**
 * iyzico Payment Integration - Admin Panel
 * Sadece iptal/iade işlemleri için
 */

import Iyzipay from "iyzipay";

// Check if iyzico is configured
export const IYZICO_ENABLED = !!(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);

// Only create iyzipay instance if credentials are available
const iyzipay = IYZICO_ENABLED 
  ? new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
    })
  : null;

if (!IYZICO_ENABLED && process.env.NODE_ENV === "production") {
  console.warn("⚠️  iyzico disabled in admin! Set IYZICO_API_KEY and IYZICO_SECRET_KEY.");
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface IyzicoResult {
  status: "success" | "failure";
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  locale?: string;
  systemTime?: number;
  conversationId?: string;
  paymentId?: string;
  price?: number;
  currency?: string;
}

export interface CancelRequest {
  locale?: "tr" | "en";
  conversationId: string;
  paymentId: string;
  ip: string;
}

export interface RefundRequest {
  locale?: "tr" | "en";
  conversationId: string;
  paymentTransactionId: string;
  price: string;
  currency?: "TRY" | "USD" | "EUR" | "GBP";
  ip: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CANCEL (İptal) - Aynı gün yapılan ödemeler için
// ═══════════════════════════════════════════════════════════════════════════

export function createCancel(request: CancelRequest): Promise<IyzicoResult> {
  return new Promise((resolve, reject) => {
    if (!iyzipay) {
      console.error("❌ iyzico is not configured");
      reject(new Error("iyzico is not configured"));
      return;
    }

    const iyziRequest = {
      locale: request.locale || Iyzipay.LOCALE.TR,
      conversationId: request.conversationId,
      paymentId: request.paymentId,
      ip: request.ip,
    };

    console.log("🚫 iyzico Cancel Request:", JSON.stringify(iyziRequest, null, 2));

    iyzipay.cancel.create(iyziRequest, (err: Error | null, result: IyzicoResult) => {
      if (err) {
        console.error("❌ iyzico Cancel Error:", err);
        reject(err);
        return;
      }
      
      console.log("✅ iyzico Cancel Result:", JSON.stringify(result, null, 2));
      resolve(result);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// REFUND (İade) - Sonraki günlerde yapılan ödemeler için
// ═══════════════════════════════════════════════════════════════════════════

export function createRefund(request: RefundRequest): Promise<IyzicoResult> {
  return new Promise((resolve, reject) => {
    if (!iyzipay) {
      console.error("❌ iyzico is not configured");
      reject(new Error("iyzico is not configured"));
      return;
    }

    const iyziRequest = {
      locale: request.locale || Iyzipay.LOCALE.TR,
      conversationId: request.conversationId,
      paymentTransactionId: request.paymentTransactionId,
      price: request.price,
      currency: request.currency ? Iyzipay.CURRENCY[request.currency] : Iyzipay.CURRENCY.TRY,
      ip: request.ip,
    };

    console.log("💸 iyzico Refund Request:", JSON.stringify(iyziRequest, null, 2));

    iyzipay.refund.create(iyziRequest, (err: Error | null, result: IyzicoResult) => {
      if (err) {
        console.error("❌ iyzico Refund Error:", err);
        reject(err);
        return;
      }
      
      console.log("✅ iyzico Refund Result:", JSON.stringify(result, null, 2));
      resolve(result);
    });
  });
}

export default iyzipay;
