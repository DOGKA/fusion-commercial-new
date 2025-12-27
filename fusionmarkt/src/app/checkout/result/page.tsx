"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Home, RefreshCw } from "lucide-react";

export default function CheckoutResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const status = searchParams.get("status");
  const error = searchParams.get("error");
  const orderNumber = searchParams.get("orderNumber");

  const isSuccess = status === "success";

  // Başarılı ise order-confirmation'a yönlendir
  useEffect(() => {
    if (isSuccess && orderNumber) {
      router.replace(`/order-confirmation?orderNumber=${orderNumber}`);
    }
  }, [isSuccess, orderNumber, router]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-4">
          Ödeme Başarısız
        </h1>

        {/* Error Message */}
        <p className="text-white/60 mb-2">
          Ödeme işlemi tamamlanamadı.
        </p>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
            <p className="text-red-400 text-sm">{decodeURIComponent(error)}</p>
          </div>
        )}

        {/* Order Number */}
        {orderNumber && (
          <p className="text-white/40 text-sm mb-8">
            Sipariş Referansı: <span className="font-mono">{orderNumber}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/checkout/payment"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Tekrar Dene
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors border border-white/10"
          >
            <Home className="w-5 h-5" />
            Ana Sayfa
          </Link>
        </div>

        {/* Help */}
        <p className="mt-12 text-white/40 text-sm">
          Sorun devam ederse{" "}
          <Link href="/iletisim" className="text-emerald-500 hover:underline">
            bizimle iletişime geçin
          </Link>
        </p>
      </div>
    </div>
  );
}

