/**
 * iyzico Payment Integration
 * 
 * Official iyzipay-node SDK: https://github.com/iyzico/iyzipay-node
 * Documentation: https://dev.iyzipay.com
 * 
 * 3D Secure akışı:
 * 1. threedsInitialize -> HTML form döner
 * 2. Kullanıcı 3D doğrulama yapar
 * 3. Callback URL'e POST yapılır
 * 4. threedsPayment ile ödeme tamamlanır
 */

import Iyzipay from "iyzipay";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || "",
  secretKey: process.env.IYZICO_SECRET_KEY || "",
  uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
});

// Check if iyzico is configured
export const IYZICO_ENABLED = !!(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);

if (!IYZICO_ENABLED && process.env.NODE_ENV === "production") {
  console.warn("⚠️  iyzico disabled! Set IYZICO_API_KEY and IYZICO_SECRET_KEY to enable payments.");
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PaymentCard {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  registerCard?: "0" | "1";
}

export interface Buyer {
  id: string;
  name: string;
  surname: string;
  gsmNumber: string;
  email: string;
  identityNumber: string;
  registrationAddress: string;
  ip: string;
  city: string;
  country: string;
  zipCode?: string;
}

export interface Address {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

export interface BasketItem {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType: "PHYSICAL" | "VIRTUAL";
  price: string; // Her item'ın fiyatı (string olarak)
}

export interface ThreeDSInitializeRequest {
  locale?: "tr" | "en";
  conversationId: string;
  price: string; // Toplam fiyat
  paidPrice: string; // Ödenen fiyat (komisyon dahil)
  currency: "TRY" | "USD" | "EUR" | "GBP";
  installment: string;
  basketId: string;
  paymentChannel: "WEB" | "MOBILE" | "MOBILE_WEB";
  paymentGroup: "PRODUCT" | "LISTING" | "SUBSCRIPTION";
  callbackUrl: string;
  paymentCard: PaymentCard;
  buyer: Buyer;
  shippingAddress: Address;
  billingAddress: Address;
  basketItems: BasketItem[];
}

export interface ThreeDSPaymentRequest {
  locale?: "tr" | "en";
  conversationId: string;
  paymentId: string;
  conversationData?: string;
}

export interface IyzicoResult {
  status: "success" | "failure";
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  locale?: string;
  systemTime?: number;
  conversationId?: string;
  // 3DS Initialize specific
  threeDSHtmlContent?: string;
  // Payment specific
  paymentId?: string;
  price?: number;
  paidPrice?: number;
  installment?: number;
  currency?: string;
  basketId?: string;
  binNumber?: string;
  lastFourDigits?: string;
  cardAssociation?: string;
  cardFamily?: string;
  cardType?: string;
  fraudStatus?: number;
  itemTransactions?: Array<{
    itemId: string;
    paymentTransactionId: string;
    transactionStatus: number;
    price: number;
    paidPrice: number;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3D SECURE INITIALIZE
// ═══════════════════════════════════════════════════════════════════════════

export function threedsInitialize(request: ThreeDSInitializeRequest): Promise<IyzicoResult> {
  return new Promise((resolve, reject) => {
    const iyziRequest = {
      locale: request.locale || Iyzipay.LOCALE.TR,
      conversationId: request.conversationId,
      price: request.price,
      paidPrice: request.paidPrice,
      currency: Iyzipay.CURRENCY[request.currency] || Iyzipay.CURRENCY.TRY,
      installment: request.installment,
      basketId: request.basketId,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL[request.paymentChannel] || Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP[request.paymentGroup] || Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: request.callbackUrl,
      paymentCard: {
        cardHolderName: request.paymentCard.cardHolderName,
        cardNumber: request.paymentCard.cardNumber.replace(/\s/g, ""),
        expireMonth: request.paymentCard.expireMonth,
        expireYear: request.paymentCard.expireYear,
        cvc: request.paymentCard.cvc,
        registerCard: request.paymentCard.registerCard || "0",
      },
      buyer: {
        id: request.buyer.id,
        name: request.buyer.name,
        surname: request.buyer.surname,
        gsmNumber: request.buyer.gsmNumber,
        email: request.buyer.email,
        identityNumber: request.buyer.identityNumber,
        registrationAddress: request.buyer.registrationAddress,
        ip: request.buyer.ip,
        city: request.buyer.city,
        country: request.buyer.country,
        zipCode: request.buyer.zipCode || "00000",
      },
      shippingAddress: {
        contactName: request.shippingAddress.contactName,
        city: request.shippingAddress.city,
        country: request.shippingAddress.country,
        address: request.shippingAddress.address,
        zipCode: request.shippingAddress.zipCode || "00000",
      },
      billingAddress: {
        contactName: request.billingAddress.contactName,
        city: request.billingAddress.city,
        country: request.billingAddress.country,
        address: request.billingAddress.address,
        zipCode: request.billingAddress.zipCode || "00000",
      },
      basketItems: request.basketItems.map((item) => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        category2: item.category2 || item.category1,
        itemType: Iyzipay.BASKET_ITEM_TYPE[item.itemType] || Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: item.price,
      })),
    };

    console.log("🔐 3DS Initialize Request:", JSON.stringify(iyziRequest, null, 2));

    iyzipay.threedsInitialize.create(iyziRequest, (err: Error | null, result: IyzicoResult) => {
      if (err) {
        console.error("❌ iyzico 3DS Initialize Error:", err);
        reject(err);
        return;
      }
      
      console.log("✅ iyzico 3DS Initialize Result:", result.status);
      resolve(result);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 3D SECURE PAYMENT (Callback sonrası)
// ═══════════════════════════════════════════════════════════════════════════

export function threedsPayment(request: ThreeDSPaymentRequest): Promise<IyzicoResult> {
  return new Promise((resolve, reject) => {
    const iyziRequest = {
      locale: request.locale || Iyzipay.LOCALE.TR,
      conversationId: request.conversationId,
      paymentId: request.paymentId,
      conversationData: request.conversationData,
    };

    console.log("💳 3DS Payment Request:", JSON.stringify(iyziRequest, null, 2));

    iyzipay.threedsPayment.create(iyziRequest, (err: Error | null, result: IyzicoResult) => {
      if (err) {
        console.error("❌ iyzico 3DS Payment Error:", err);
        reject(err);
        return;
      }
      
      console.log("✅ iyzico 3DS Payment Result:", result.status);
      resolve(result);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// REFUND (İade)
// ═══════════════════════════════════════════════════════════════════════════

export interface RefundRequest {
  locale?: "tr" | "en";
  conversationId: string;
  paymentTransactionId: string;
  price: string;
  currency?: "TRY" | "USD" | "EUR" | "GBP";
  ip: string;
}

export function createRefund(request: RefundRequest): Promise<IyzicoResult> {
  return new Promise((resolve, reject) => {
    const iyziRequest = {
      locale: request.locale || Iyzipay.LOCALE.TR,
      conversationId: request.conversationId,
      paymentTransactionId: request.paymentTransactionId,
      price: request.price,
      currency: request.currency ? Iyzipay.CURRENCY[request.currency] : Iyzipay.CURRENCY.TRY,
      ip: request.ip,
    };

    console.log("💸 Refund Request:", JSON.stringify(iyziRequest, null, 2));

    iyzipay.refund.create(iyziRequest, (err: Error | null, result: IyzicoResult) => {
      if (err) {
        console.error("❌ iyzico Refund Error:", err);
        reject(err);
        return;
      }
      
      console.log("✅ iyzico Refund Result:", result.status);
      resolve(result);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CANCEL (İptal)
// ═══════════════════════════════════════════════════════════════════════════

export interface CancelRequest {
  locale?: "tr" | "en";
  conversationId: string;
  paymentId: string;
  ip: string;
}

export function createCancel(request: CancelRequest): Promise<IyzicoResult> {
  return new Promise((resolve, reject) => {
    const iyziRequest = {
      locale: request.locale || Iyzipay.LOCALE.TR,
      conversationId: request.conversationId,
      paymentId: request.paymentId,
      ip: request.ip,
    };

    console.log("🚫 Cancel Request:", JSON.stringify(iyziRequest, null, 2));

    iyzipay.cancel.create(iyziRequest, (err: Error | null, result: IyzicoResult) => {
      if (err) {
        console.error("❌ iyzico Cancel Error:", err);
        reject(err);
        return;
      }
      
      console.log("✅ iyzico Cancel Result:", result.status);
      resolve(result);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// RETRIEVE PAYMENT (Ödeme Sorgulama)
// ═══════════════════════════════════════════════════════════════════════════

export function retrievePayment(paymentId: string, conversationId?: string): Promise<IyzicoResult> {
  return new Promise((resolve, reject) => {
    const iyziRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId || paymentId,
      paymentId: paymentId,
    };

    iyzipay.payment.retrieve(iyziRequest, (err: Error | null, result: IyzicoResult) => {
      if (err) {
        console.error("❌ iyzico Retrieve Error:", err);
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER - Price Formatting
// ═══════════════════════════════════════════════════════════════════════════

/**
 * iyzico için fiyatı string formatına çevirir
 * iyzico noktalı format bekler: "99.90"
 */
export function formatIyzicoPrice(price: number): string {
  return price.toFixed(2);
}

/**
 * iyzico item toplam fiyat doğrulaması
 * Tüm basketItems fiyatları toplamı = price olmalı
 */
export function validateBasketTotal(items: BasketItem[], expectedTotal: string): boolean {
  const calculatedTotal = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
  return Math.abs(calculatedTotal - parseFloat(expectedTotal)) < 0.01;
}

export default iyzipay;

