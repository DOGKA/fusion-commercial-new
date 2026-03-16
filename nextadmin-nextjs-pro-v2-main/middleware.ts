/**
 * Admin Panel Middleware
 * Tüm sayfalarda ve Admin API'lerinde giriş zorunlu
 * Sadece ADMIN ve SUPER_ADMIN rolündeki kullanıcılar erişebilir
 */

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`\n🔍 MIDDLEWARE: ${request.method} ${pathname}`);

  // Public paths - bunlara herkes erişebilir
  const publicPaths = [
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/error",
  ];

  // Public path kontrolü - sadece auth sayfaları
  const isAuthPage = publicPaths.some(path => pathname.startsWith(path));
  
  // Admin API kontrolü - bunlar da korunmalı!
  const isAdminAPI = pathname.startsWith("/api/admin");
  
  // Public API'ler - bunlara herkes erişebilir (NextAuth vb.)
  const isPublicAPI = pathname.startsWith("/api/auth") || 
                      pathname.startsWith("/api/public");
  
  // Static files - uzantısı olan dosyalar
  const isStaticFile = pathname.includes(".") || 
                       pathname.startsWith("/_next") || 
                       pathname.startsWith("/images") ||
                       pathname.startsWith("/storage");

  // Public veya static ise geç (ama Admin API hariç!)
  if ((isAuthPage || isStaticFile || isPublicAPI) && !isAdminAPI) {
    console.log(`   ➡️ Public/Static path, skipping auth check`);
    return NextResponse.next();
  }

  // Token al - Admin panel için özel cookie adı
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "admin-session-token",
  });

  // Token yoksa
  if (!token) {
    console.log(`🔒 No token: ${pathname}`);
    
    // API için JSON response
    if (isAdminAPI) {
      return NextResponse.json(
        { error: "Yetkilendirme gerekli", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
    
    // Sayfa için redirect
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Rol kontrolü - sadece ADMIN ve SUPER_ADMIN
  const userRole = token.role as string;

  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    console.warn(`⛔ Unauthorized: ${token.email} (role: ${userRole}) tried to access ${pathname}`);
    
    // API için JSON response
    if (isAdminAPI) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok", code: "FORBIDDEN" },
        { status: 403 }
      );
    }
    
    // Sayfa için redirect
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("error", "AccessDenied");
    signInUrl.searchParams.set("message", "Bu panele erişim yetkiniz yok. Sadece yöneticiler giriş yapabilir.");
    
    // Session'ı temizle
    const response = NextResponse.redirect(signInUrl);
    response.cookies.delete("admin-session-token");
    response.cookies.delete("__Secure-admin-session-token");
    
    return response;
  }

  console.log(`✅ Access granted: ${token.email} (${userRole}) -> ${pathname}`);
  return NextResponse.next();
}

// Middleware'in çalışacağı yollar
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next (Next.js internals)
     * - Static files with extensions
     * 
     * NOT: /api/admin/* korunuyor, /api/auth/* public
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
