/**
 * iyzipay TypeScript Type Declarations
 */

declare module "iyzipay" {
  interface IyzipayConfig {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  interface IyzipayResult {
    status: "success" | "failure";
    errorCode?: string;
    errorMessage?: string;
    errorGroup?: string;
    locale?: string;
    systemTime?: number;
    conversationId?: string;
    threeDSHtmlContent?: string;
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

  type IyzipayCallback = (err: Error | null, result: IyzipayResult) => void;

  class Iyzipay {
    constructor(config: IyzipayConfig);

    static LOCALE: {
      TR: string;
      EN: string;
    };

    static CURRENCY: {
      TRY: string;
      USD: string;
      EUR: string;
      GBP: string;
      IRR: string;
    };

    static PAYMENT_CHANNEL: {
      WEB: string;
      MOBILE: string;
      MOBILE_WEB: string;
      MOBILE_IOS: string;
      MOBILE_ANDROID: string;
      MOBILE_WINDOWS: string;
      MOBILE_TABLET: string;
      MOBILE_PHONE: string;
    };

    static PAYMENT_GROUP: {
      PRODUCT: string;
      LISTING: string;
      SUBSCRIPTION: string;
    };

    static BASKET_ITEM_TYPE: {
      PHYSICAL: string;
      VIRTUAL: string;
    };

    static REFUND_REASON: {
      BUYER_REQUEST: string;
      FRAUD: string;
      OTHER: string;
    };

    threedsInitialize: {
      create: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
    };

    threedsPayment: {
      create: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
    };

    payment: {
      create: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
      retrieve: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
    };

    refund: {
      create: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
    };

    cancel: {
      create: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
    };

    checkoutFormInitialize: {
      create: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
    };

    checkoutForm: {
      retrieve: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
    };

    installmentInfo: {
      retrieve: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
    };

    binNumber: {
      retrieve: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
    };

    apiTest: {
      retrieve: (request: Record<string, unknown>, callback: IyzipayCallback) => void;
    };
  }

  export = Iyzipay;
}

