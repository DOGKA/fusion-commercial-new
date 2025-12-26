import Signin from "@/components/Auth/Signin";
import { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Giriş Yap | FusionMarkt Admin",
};

function SigninFormLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 dark:bg-dark-3 rounded-lg"></div>
      <div className="h-12 bg-gray-200 dark:bg-dark-3 rounded-lg"></div>
      <div className="h-12 bg-gray-200 dark:bg-dark-3 rounded-lg"></div>
    </div>
  );
}

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-2 dark:bg-[#020d1a] p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl dark:bg-gray-dark dark:shadow-card overflow-hidden">
        <div className="flex flex-wrap items-stretch">
          {/* Sol Panel - Form */}
          <div className="w-full xl:w-1/2">
            <div className="w-full p-8 sm:p-12 xl:p-16">
              {/* Logo */}
              <div className="mb-8 text-center xl:text-left">
                <h1 className="text-3xl font-bold text-primary">
                  <span className="text-dark dark:text-white">Fusion</span>Markt
                </h1>
                <p className="text-sm text-gray-500 mt-1">Yönetim Paneli</p>
              </div>

              <h2 className="mb-2 text-2xl font-bold text-dark dark:text-white">
                Hoş Geldiniz
              </h2>
              <p className="mb-8 text-gray-500">
                Devam etmek için giriş yapın
              </p>

              <Suspense fallback={<SigninFormLoading />}>
                <Signin />
              </Suspense>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-stroke dark:border-dark-3">
                <p className="text-center text-xs text-gray-400">
                  © 2025 FusionMarkt. Tüm hakları saklıdır.
                </p>
                <p className="text-center text-xs text-gray-400 mt-1">
                  Developed by <span className="font-medium">Juststack Software and Technology</span>
                </p>
              </div>
            </div>
          </div>

          {/* Sağ Panel - Görsel */}
          <div className="hidden xl:flex xl:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 items-center justify-center p-12">
            <div className="text-center text-white">
              {/* Icon */}
              <div className="mb-8 mx-auto w-24 h-24 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>

              <h2 className="text-3xl font-bold mb-4">
                FusionMarkt
              </h2>
              <p className="text-lg opacity-90 mb-2">
                E-Ticaret Yönetim Paneli
              </p>
              <p className="text-sm opacity-70 max-w-xs mx-auto">
                Siparişlerinizi, ürünlerinizi ve müşterilerinizi tek bir yerden yönetin.
              </p>

              {/* Features */}
              <div className="mt-12 space-y-4 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <span className="text-sm">Kolay sipariş yönetimi</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <span className="text-sm">Stok takibi ve raporlama</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <span className="text-sm">Müşteri ve üye yönetimi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
