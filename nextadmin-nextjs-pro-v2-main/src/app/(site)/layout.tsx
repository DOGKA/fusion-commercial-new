"use client";

import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { type ReactNode, useEffect } from "react";
import ToastContext from "../context/ToastContext";

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Auth sayfalarında sidebar/header gösterme
  const isAuthPage = pathname.startsWith("/auth");

  // Session yoksa giriş sayfasına yönlendir (auth sayfaları hariç)
  useEffect(() => {
    if (status === "unauthenticated" && !isAuthPage) {
      router.push("/auth/signin");
    }
  }, [status, isAuthPage, router]);

  // Do not render sidebar and header on these pages
  if (
    isAuthPage ||
    ["/coming-soon", "/two-step-verification", "/under-maintenance"].some(
      (value) => pathname.endsWith(value),
    )
  ) {
    return (
      <>
        {children}
        <ToastContext />
      </>
    );
  }

  // Session yüklenirken veya yoksa loading göster
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-2 dark:bg-[#020d1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-500">
            {status === "unauthenticated" ? "Giriş sayfasına yönlendiriliyor..." : "Yükleniyor..."}
          </p>
        </div>
      </div>
    );
  }

  // Session varsa dashboard göster
  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
            <Header />

            <main className="mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>

      <ToastContext />
    </>
  );
}
