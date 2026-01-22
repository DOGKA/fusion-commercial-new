/**
 * iyzico Payment Integration - Admin Panel (HTTP API)
 * 
 * iyzipay-node paketi serverless ortamlarda sorun çıkardığı için
 * doğrudan HTTP API kullanıyoruz.
 */

import crypto from "crypto";

// Check if iyzico is configured
export const IYZICO_ENABLED = !!(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);

const API_KEY = process.env.IYZICO_API_KEY || "";
const SECRET_KEY = process.env.IYZICO_SECRET_KEY || "";
const BASE_URL = process.env.IYZICO_BASE_URL || "https://api.iyzipay.com";

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
// AUTH HELPERS (iyzico V2 signature format)
// ═══════════════════════════════════════════════════════════════════════════

function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

function buildAuthorizationHeader(endpoint: string, requestBody: string, randomString: string): string {
  const dataToSign = `${randomString}${endpoint}${requestBody}`;
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(dataToSign).digest("base64");
  const authorization = Buffer.from(`${API_KEY}:${randomString}:${signature}`).toString("base64");
  return `IYZWSv2 ${authorization}`;
}

async function iyzicoRequest(endpoint: string, body: Record<string, any>): Promise<IyzicoResult> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Generate random string for this request
  const randomString = generateRandomString(8);
  const requestBody = JSON.stringify(body);
  const authorization = buildAuthorizationHeader(endpoint, requestBody, randomString);
  
  console.log(`🔐 iyzico Request to ${endpoint}`);
  console.log(`📦 Body:`, JSON.stringify(body, null, 2));
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authorization,
      "x-iyzi-rnd": randomString,
    },
    body: requestBody,
  });
  
  const result = await response.json() as IyzicoResult;
  
  console.log(`📨 iyzico Response:`, JSON.stringify(result, null, 2));
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// CANCEL (İptal) - Aynı gün yapılan ödemeler için
// ═══════════════════════════════════════════════════════════════════════════

export async function createCancel(request: CancelRequest): Promise<IyzicoResult> {
  if (!IYZICO_ENABLED) {
    console.error("❌ iyzico is not configured");
    throw new Error("iyzico is not configured");
  }

  const body = {
    locale: request.locale || "tr",
    conversationId: request.conversationId,
    paymentId: request.paymentId,
    ip: request.ip,
  };

  console.log("🚫 iyzico Cancel Request:", JSON.stringify(body, null, 2));

  const result = await iyzicoRequest("/payment/cancel", body);
  
  if (result.status === "success") {
    console.log(`✅ iyzico Cancel başarılı`);
  } else {
    console.error(`❌ iyzico Cancel başarısız: ${result.errorMessage}`);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// REFUND (İade) - Sonraki günlerde yapılan ödemeler için
// ═══════════════════════════════════════════════════════════════════════════

export async function createRefund(request: RefundRequest): Promise<IyzicoResult> {
  if (!IYZICO_ENABLED) {
    console.error("❌ iyzico is not configured");
    throw new Error("iyzico is not configured");
  }

  const body = {
    locale: request.locale || "tr",
    conversationId: request.conversationId,
    paymentTransactionId: request.paymentTransactionId,
    price: request.price,
    currency: request.currency || "TRY",
    ip: request.ip,
  };

  console.log("💸 iyzico Refund Request:", JSON.stringify(body, null, 2));

  const result = await iyzicoRequest("/payment/refund", body);
  
  if (result.status === "success") {
    console.log(`✅ iyzico Refund başarılı`);
  } else {
    console.error(`❌ iyzico Refund başarısız: ${result.errorMessage}`);
  }
  
  return result;
}
