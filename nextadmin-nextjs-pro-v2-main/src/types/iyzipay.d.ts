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
    paymentId?: string;
    price?: number;
    paidPrice?: number;
    currency?: string;
  }

  type IyzipayCallback<T> = (err: Error | null, result: T) => void;

  class Iyzipay {
    constructor(config: IyzipayConfig);

    static LOCALE: {
      TR: "tr";
      EN: "en";
    };

    static CURRENCY: {
      TRY: "TRY";
      USD: "USD";
      EUR: "EUR";
      GBP: "GBP";
    };

    cancel: {
      create: (request: any, callback: IyzipayCallback<IyzipayResult>) => void;
    };

    refund: {
      create: (request: any, callback: IyzipayCallback<IyzipayResult>) => void;
    };
  }

  export = Iyzipay;
}
