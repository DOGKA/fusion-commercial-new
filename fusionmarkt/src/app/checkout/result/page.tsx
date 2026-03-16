"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, Home, RefreshCw, Loader2 } from "lucide-react";

function CheckoutResultContent() {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <div className="checkout-result-page min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Ödeme Başarısız
          </h1>

          {/* Error Message */}
          <p className="text-foreground-muted mb-2">
            Ödeme işlemi tamamlanamadı.
          </p>
          {error && (
            <div className="error-box bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
              <p className="text-red-500 text-sm">{decodeURIComponent(error)}</p>
            </div>
          )}

          {/* Order Number */}
          {orderNumber && (
            <p className="text-foreground-muted text-sm mb-8">
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
              className="home-button inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-colors border"
            >
              <Home className="w-5 h-5" />
              Ana Sayfa
            </Link>
          </div>

          {/* Help */}
          <p className="mt-12 text-foreground-muted text-sm">
            Sorun devam ederse{" "}
            <Link href="/iletisim" className="text-emerald-500 hover:underline">
              bizimle iletişime geçin
            </Link>
          </p>
        </div>
      </div>

      {/* Theme-aware styles */}
      <style jsx global>{`
        /* Dark theme (default) */
        .checkout-result-page {
          --result-bg: #050505;
          --result-text: #ffffff;
          --result-text-muted: rgba(255, 255, 255, 0.6);
        }
        .checkout-result-page .home-button {
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.1);
        }
        .checkout-result-page .home-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        /* Light theme */
        .light .checkout-result-page {
          background-color: #ffffff !important;
        }
        .light .checkout-result-page h1 {
          color: #0f172a !important;
        }
        .light .checkout-result-page p {
          color: #64748b !important;
        }
        .light .checkout-result-page .error-box {
          background-color: #fef2f2 !important;
          border-color: #fecaca !important;
        }
        .light .checkout-result-page .error-box p {
          color: #dc2626 !important;
        }
        .light .checkout-result-page .home-button {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
          border-color: #e2e8f0 !important;
        }
        .light .checkout-result-page .home-button:hover {
          background-color: #e2e8f0 !important;
        }
      `}</style>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutResultContent />
    </Suspense>
  );
}
