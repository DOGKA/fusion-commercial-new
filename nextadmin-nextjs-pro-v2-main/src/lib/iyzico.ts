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
// AUTH HELPERS (iyzico PKI string format)
// ═══════════════════════════════════════════════════════════════════════════

function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

function generateAuthorizationHeader(request: Record<string, any>, endpoint: string): string {
  const randomString = generateRandomString(8);
  
  // Build PKI string (iyzico's format)
  const pkiString = buildPkiString(request);
  
  // Create hash
  const hashString = API_KEY + randomString + SECRET_KEY + pkiString;
  const hash = crypto.createHash("sha1").update(hashString).digest("base64");
  
  // Authorization header format
  const authString = `IYZWS ${API_KEY}:${hash}`;
  
  return authString;
}

function buildPkiString(obj: Record<string, any>): string {
  let result = "[";
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      if (typeof value === "object" && !Array.isArray(value)) {
        result += `${key}=${buildPkiString(value)},`;
      } else if (Array.isArray(value)) {
        result += `${key}=[`;
        for (const item of value) {
          if (typeof item === "object") {
            result += `${buildPkiString(item)}, `;
          } else {
            result += `${item}, `;
          }
        }
        result = result.slice(0, -2) + "],";
      } else {
        result += `${key}=${value},`;
      }
    }
  }
  
  result = result.slice(0, -1) + "]";
  return result;
}

async function iyzicoRequest(endpoint: string, body: Record<string, any>): Promise<IyzicoResult> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Generate random string for this request
  const randomString = generateRandomString(8);
  
  // Build PKI string
  const pkiString = buildPkiString(body);
  
  // Create hash: apiKey + randomKey + secretKey + pkiString
  const hashString = API_KEY + randomString + SECRET_KEY + pkiString;
  const hash = crypto.createHash("sha1").update(hashString).digest("base64");
  
  // Authorization header
  const authorization = `IYZWS ${API_KEY}:${hash}`;
  
  console.log(`🔐 iyzico Request to ${endpoint}`);
  console.log(`📦 Body:`, JSON.stringify(body, null, 2));
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authorization,
      "x-iyzi-rnd": randomString,
    },
    body: JSON.stringify(body),
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
